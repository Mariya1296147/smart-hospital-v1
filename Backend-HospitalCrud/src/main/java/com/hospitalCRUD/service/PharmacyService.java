package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.*;
import com.hospitalCRUD.entity.*;
import com.hospitalCRUD.repository.*;
import com.hospitalCRUD.reports.PharmacyInvoicePdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PharmacyService {
    private final PharmacyRepository pharmacyRepository;
    private final PharmacyPurchaseRepository purchaseRepository;
    private final PharmacySaleRepository saleRepository;
    private final PrescriptionMedicineRepository prescriptionMedicineRepository;
    private final PharmacyInvoicePdfGenerator invoicePdfGenerator;

    @Transactional(readOnly = true)
    public List<Pharmacy> getAll() {
        return pharmacyRepository.findAll().stream().peek(this::refreshStatus).toList();
    }

    @Transactional(readOnly = true)
    public Pharmacy getById(Long id) {
        Pharmacy medicine = pharmacyRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Medicine not found"));
        refreshStatus(medicine);
        return medicine;
    }

    @Transactional
    public Pharmacy create(Pharmacy medicine) {
        validateMedicine(medicine);
        if (medicine.getMedicineId() == null || medicine.getMedicineId().isBlank()) medicine.setMedicineId(newMedicineId());
        if (pharmacyRepository.existsByMedicineIdIgnoreCase(medicine.getMedicineId())) throw new IllegalArgumentException("Medicine ID already exists");
        if (medicine.getPurchasePrice() == null) medicine.setPurchasePrice(money(medicine.getUnitPrice()));
        if (medicine.getSellingPrice() == null) medicine.setSellingPrice(money(medicine.getUnitPrice()));
        positiveMoney(medicine.getSellingPrice(), "Selling price must be greater than zero");
        if (medicine.getPurchasePrice().signum() < 0) throw new IllegalArgumentException("Purchase price cannot be negative");
        medicine.setUnitPrice(medicine.getSellingPrice());
        if (medicine.getLowStockThreshold() == null) medicine.setLowStockThreshold(10);
        refreshStatus(medicine);
        return pharmacyRepository.save(medicine);
    }

    @Transactional
    public Pharmacy update(Long id, Pharmacy input) {
        Pharmacy existing = pharmacyRepository.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Medicine not found"));
        if (input.getMedicineId() != null && !input.getMedicineId().equalsIgnoreCase(existing.getMedicineId()) && pharmacyRepository.existsByMedicineIdIgnoreCase(input.getMedicineId())) throw new IllegalArgumentException("Medicine ID already exists");
        existing.setMedicineId(value(input.getMedicineId(), existing.getMedicineId()));
        existing.setMedicineName(value(input.getMedicineName(), existing.getMedicineName()));
        existing.setCategory(input.getCategory()); existing.setManufacturer(input.getManufacturer()); existing.setBatchNumber(input.getBatchNumber());
        if (input.getQuantity() != null) existing.setQuantity(input.getQuantity());
        if (input.getPurchasePrice() != null) existing.setPurchasePrice(input.getPurchasePrice());
        if (input.getSellingPrice() != null) existing.setSellingPrice(input.getSellingPrice());
        if (existing.getSellingPrice() == null && input.getUnitPrice() != null) existing.setSellingPrice(input.getUnitPrice());
        existing.setUnitPrice(existing.getSellingPrice());
        if (input.getLowStockThreshold() != null) existing.setLowStockThreshold(input.getLowStockThreshold());
        existing.setExpiryDate(input.getExpiryDate()); existing.setSupplier(input.getSupplier());
        validateMedicine(existing); refreshStatus(existing);
        return pharmacyRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Pharmacy medicine = pharmacyRepository.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Medicine not found"));
        boolean transactionReferenced = purchaseRepository.existsByItems_Pharmacy_Id(id) || saleRepository.existsByItems_Pharmacy_Id(id);
        boolean prescriptionReferenced = prescriptionMedicineRepository.existsByPharmacy_Id(id);
        if (transactionReferenced || prescriptionReferenced || (medicine.getQuantity() != null && medicine.getQuantity() > 0))
            throw new IllegalStateException("This medicine has stock or history and cannot be deleted. Set its quantity to zero to retire it.");
        pharmacyRepository.delete(medicine);
    }

    @Transactional(readOnly = true)
    public List<PharmacyTransactionDTO> getPurchases() { return purchaseRepository.findAllByOrderByPurchaseDateDescIdDesc().stream().map(this::toDto).toList(); }
    @Transactional(readOnly = true)
    public List<PharmacyTransactionDTO> getSales() { return saleRepository.findAllByOrderBySaleDateDescIdDesc().stream().map(this::toDto).toList(); }

    @Transactional
    public PharmacyTransactionDTO createPurchase(PharmacyPurchaseRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) throw new IllegalArgumentException("Add at least one medicine to the purchase");
        String invoice = invoice(request.invoiceNumber(), "PUR");
        if (purchaseRepository.existsByInvoiceNumberIgnoreCase(invoice)) throw new IllegalArgumentException("Purchase invoice number already exists");
        PharmacyPurchase purchase = new PharmacyPurchase();
        purchase.setInvoiceNumber(invoice); purchase.setSupplierName(required(request.supplierName(), "Supplier name is required"));
        purchase.setSupplierContact(request.supplierContact()); purchase.setPurchaseDate(request.purchaseDate() == null ? LocalDate.now() : request.purchaseDate());
        BigDecimal subtotal = BigDecimal.ZERO;
        for (PharmacyPurchaseLineRequest line : request.items()) {
            int qty = positive(line.quantity(), "Purchase quantity must be greater than zero");
            BigDecimal price = positiveMoney(line.purchasePrice(), "Purchase price must be greater than zero");
            Pharmacy medicine;
            if (line.pharmacyId() != null) {
                medicine = pharmacyRepository.findByIdForUpdate(line.pharmacyId()).orElseThrow(() -> new IllegalArgumentException("Selected stock batch not found"));
                long before = zero(medicine.getQuantity());
                long after = before + qty;
                if (after > Integer.MAX_VALUE) throw new IllegalArgumentException("Stock quantity is too large");
                BigDecimal oldPrice = money(medicine.getPurchasePrice() == null ? medicine.getUnitPrice() : medicine.getPurchasePrice());
                medicine.setPurchasePrice(oldPrice.multiply(BigDecimal.valueOf(before)).add(price.multiply(BigDecimal.valueOf(qty))).divide(BigDecimal.valueOf(after), 2, java.math.RoundingMode.HALF_UP));
                medicine.setQuantity((int) after);
                if (line.sellingPrice() != null) medicine.setSellingPrice(positiveMoney(line.sellingPrice(), "Selling price must be greater than zero"));
            } else {
                String name = required(line.medicineName(), "Medicine name is required");
                if (line.batchNumber() != null && !line.batchNumber().isBlank()) {
                    List<Pharmacy> matches = pharmacyRepository.findByMedicineNameIgnoreCaseAndBatchNumberIgnoreCase(name, line.batchNumber());
                    if (!matches.isEmpty()) {
                        medicine = matches.stream().min(Comparator.comparing(Pharmacy::getId)).orElseThrow();
                        medicine = pharmacyRepository.findByIdForUpdate(medicine.getId()).orElseThrow();
                        int before = zero(medicine.getQuantity());
                        int after = Math.addExact(before, qty);
                        BigDecimal oldPrice = money(medicine.getPurchasePrice() == null ? medicine.getUnitPrice() : medicine.getPurchasePrice());
                        medicine.setPurchasePrice(oldPrice.multiply(BigDecimal.valueOf(before)).add(price.multiply(BigDecimal.valueOf(qty))).divide(BigDecimal.valueOf(after), 2, java.math.RoundingMode.HALF_UP));
                        medicine.setQuantity(after);
                        if (line.sellingPrice() != null) medicine.setSellingPrice(positiveMoney(line.sellingPrice(), "Selling price must be greater than zero"));
                    } else medicine = newMedicine(line, qty, price, name);
                } else medicine = newMedicine(line, qty, price, name);
            }
            medicine.setSupplier(purchase.getSupplierName()); refreshStatus(medicine);
            medicine = pharmacyRepository.save(medicine);
            PharmacyPurchaseItem item = new PharmacyPurchaseItem(); item.setPharmacy(medicine); item.setMedicineName(medicine.getMedicineName()); item.setBatchNumber(medicine.getBatchNumber()); item.setQuantity(qty); item.setUnitPrice(price); item.setLineTotal(price.multiply(BigDecimal.valueOf(qty))); purchase.addItem(item);
            subtotal = subtotal.add(item.getLineTotal());
        }
        BigDecimal discount = discount(request.discount(), subtotal);
        purchase.setSubtotal(subtotal); purchase.setDiscount(discount); purchase.setTotalAmount(subtotal.subtract(discount));
        purchaseRepository.saveAndFlush(purchase);
        purchase.setInvoicePdf(generatePdf(purchase.getInvoiceNumber(), "PURCHASE INVOICE", purchase.getPurchaseDate(), purchase.getSupplierName(), purchase.getSupplierContact(), purchase.getItems(), subtotal, discount, purchase.getTotalAmount()));
        return toDto(purchaseRepository.save(purchase));
    }

    @Transactional
    public PharmacyTransactionDTO createSale(PharmacySaleRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) throw new IllegalArgumentException("Add at least one medicine to the sale");
        Map<Long, Integer> quantities = new TreeMap<>();
        for (PharmacySaleLineRequest line : request.items()) {
            if (line.pharmacyId() == null) throw new IllegalArgumentException("Select a medicine batch for every sale line");
            int qty = positive(line.quantity(), "Sale quantity must be greater than zero");
            quantities.merge(line.pharmacyId(), qty, Math::addExact);
        }
        String invoice = invoice(request.invoiceNumber(), "SAL");
        if (saleRepository.existsByInvoiceNumberIgnoreCase(invoice)) throw new IllegalArgumentException("Sales invoice number already exists");
        List<Pharmacy> locked = pharmacyRepository.findAllByIdsForUpdate(quantities.keySet());
        if (locked.size() != quantities.size()) throw new IllegalArgumentException("One or more selected medicines no longer exist");
        PharmacySale sale = new PharmacySale(); sale.setInvoiceNumber(invoice); sale.setCustomerName(request.customerName()); sale.setCustomerContact(request.customerContact()); sale.setSaleDate(request.saleDate() == null ? LocalDate.now() : request.saleDate());
        BigDecimal subtotal = BigDecimal.ZERO;
        for (Pharmacy medicine : locked) {
            int qty = quantities.get(medicine.getId());
            if (medicine.getExpiryDate() != null && medicine.getExpiryDate().isBefore(LocalDate.now())) throw new IllegalStateException(medicine.getMedicineName() + " is expired and cannot be sold");
            if (zero(medicine.getQuantity()) < qty) throw new IllegalStateException("Insufficient stock for " + medicine.getMedicineName());
            BigDecimal price = positiveMoney(medicine.getSellingPrice() == null ? medicine.getUnitPrice() : medicine.getSellingPrice(), "Selling price is not set for " + medicine.getMedicineName());
            medicine.setQuantity(medicine.getQuantity() - qty); refreshStatus(medicine);
            PharmacySaleItem item = new PharmacySaleItem(); item.setPharmacy(medicine); item.setMedicineName(medicine.getMedicineName()); item.setBatchNumber(medicine.getBatchNumber()); item.setQuantity(qty); item.setUnitPrice(price); item.setLineTotal(price.multiply(BigDecimal.valueOf(qty))); sale.addItem(item); subtotal = subtotal.add(item.getLineTotal());
        }
        BigDecimal discount = discount(request.discount(), subtotal); sale.setSubtotal(subtotal); sale.setDiscount(discount); sale.setTotalAmount(subtotal.subtract(discount));
        saleRepository.saveAndFlush(sale);
        sale.setInvoicePdf(generatePdf(sale.getInvoiceNumber(), "SALES RECEIPT", sale.getSaleDate(), sale.getCustomerName(), sale.getCustomerContact(), sale.getItems(), subtotal, discount, sale.getTotalAmount()));
        return toDto(saleRepository.save(sale));
    }

    @Transactional(readOnly = true)
    public byte[] purchasePdf(Long id) { return purchaseRepository.findWithItemsById(id).map(PharmacyPurchase::getInvoicePdf).filter(Objects::nonNull).orElseThrow(() -> new IllegalArgumentException("Purchase invoice PDF not found")); }
    @Transactional(readOnly = true)
    public byte[] salePdf(Long id) { return saleRepository.findWithItemsById(id).map(PharmacySale::getInvoicePdf).filter(Objects::nonNull).orElseThrow(() -> new IllegalArgumentException("Sales invoice PDF not found")); }

    private Pharmacy newMedicine(PharmacyPurchaseLineRequest line, int qty, BigDecimal purchasePrice, String name) {
        Pharmacy medicine = new Pharmacy(); medicine.setMedicineId(line.medicineId() == null || line.medicineId().isBlank() ? newMedicineId() : line.medicineId().trim());
        if (pharmacyRepository.existsByMedicineIdIgnoreCase(medicine.getMedicineId())) throw new IllegalArgumentException("Medicine ID already exists: " + medicine.getMedicineId());
        medicine.setMedicineName(name); medicine.setCategory(line.category()); medicine.setManufacturer(line.manufacturer()); medicine.setBatchNumber(line.batchNumber()); medicine.setPurchasePrice(purchasePrice);
        medicine.setSellingPrice(positiveMoney(line.sellingPrice(), "Selling price is required for a new batch")); medicine.setUnitPrice(medicine.getSellingPrice()); medicine.setQuantity(qty); medicine.setExpiryDate(line.expiryDate()); medicine.setLowStockThreshold(10); return medicine;
    }
    private byte[] generatePdf(String invoice, String title, LocalDate date, String party, String contact, List<? extends Object> items, BigDecimal subtotal, BigDecimal discount, BigDecimal total) {
        List<PharmacyInvoicePdfGenerator.Line> rows = new ArrayList<>();
        for (Object obj : items) {
            if (obj instanceof PharmacyPurchaseItem item) rows.add(new PharmacyInvoicePdfGenerator.Line(item.getMedicineName(), item.getBatchNumber(), item.getQuantity(), item.getUnitPrice(), item.getLineTotal()));
            else { PharmacySaleItem item = (PharmacySaleItem) obj; rows.add(new PharmacyInvoicePdfGenerator.Line(item.getMedicineName(), item.getBatchNumber(), item.getQuantity(), item.getUnitPrice(), item.getLineTotal())); }
        }
        return invoicePdfGenerator.generate(invoice, title, date, title.startsWith("PURCHASE") ? "Supplier" : "Customer", party, contact, rows, subtotal, discount, total);
    }
    private PharmacyTransactionDTO toDto(PharmacyPurchase p) { return new PharmacyTransactionDTO(p.getId(),p.getInvoiceNumber(),p.getSupplierName(),p.getSupplierContact(),null,null,p.getPurchaseDate(),p.getSubtotal(),p.getDiscount(),p.getTotalAmount(),p.getItems().stream().map(i->new PharmacyTransactionItemDTO(i.getId(),i.getPharmacy().getId(),i.getPharmacy().getMedicineId(),i.getMedicineName(),i.getBatchNumber(),i.getQuantity(),i.getUnitPrice(),i.getLineTotal())).toList()); }
    private PharmacyTransactionDTO toDto(PharmacySale s) { return new PharmacyTransactionDTO(s.getId(),s.getInvoiceNumber(),null,null,s.getCustomerName(),s.getCustomerContact(),s.getSaleDate(),s.getSubtotal(),s.getDiscount(),s.getTotalAmount(),s.getItems().stream().map(i->new PharmacyTransactionItemDTO(i.getId(),i.getPharmacy().getId(),i.getPharmacy().getMedicineId(),i.getMedicineName(),i.getBatchNumber(),i.getQuantity(),i.getUnitPrice(),i.getLineTotal())).toList()); }
    private void validateMedicine(Pharmacy m) { required(m.getMedicineName(),"Medicine name is required"); if (m.getQuantity()==null || m.getQuantity()<0) throw new IllegalArgumentException("Quantity cannot be negative"); if (m.getLowStockThreshold()!=null && m.getLowStockThreshold()<0) throw new IllegalArgumentException("Low-stock threshold cannot be negative"); if (m.getPurchasePrice()!=null && m.getPurchasePrice().signum()<0) throw new IllegalArgumentException("Purchase price cannot be negative"); if ((m.getSellingPrice()!=null ? m.getSellingPrice() : m.getUnitPrice()) != null && (m.getSellingPrice()!=null ? m.getSellingPrice() : m.getUnitPrice()).signum()<0) throw new IllegalArgumentException("Selling price cannot be negative"); }
    private void refreshStatus(Pharmacy m) { int qty=zero(m.getQuantity()); m.setStatus(m.getExpiryDate()!=null && m.getExpiryDate().isBefore(LocalDate.now()) ? "EXPIRED" : qty==0 ? "OUT OF STOCK" : qty <= (m.getLowStockThreshold()==null?10:m.getLowStockThreshold()) ? "LOW STOCK" : "AVAILABLE"); }
    private BigDecimal discount(BigDecimal discount, BigDecimal subtotal) { BigDecimal d=money(discount); if(d.signum()<0 || d.compareTo(subtotal)>0) throw new IllegalArgumentException("Discount must be between zero and the subtotal"); return d; }
    private BigDecimal positiveMoney(BigDecimal n,String message) { if(n==null || n.signum()<=0) throw new IllegalArgumentException(message); return n.setScale(2,java.math.RoundingMode.HALF_UP); }
    private int positive(Integer n,String message) { if(n==null || n<=0) throw new IllegalArgumentException(message); return n; }
    private int zero(Integer n) { return n==null?0:n; }
    private BigDecimal money(BigDecimal n) { return n==null?BigDecimal.ZERO:n; }
    private String required(String v,String message) { if(v==null || v.isBlank()) throw new IllegalArgumentException(message); return v.trim(); }
    private String value(String v,String fallback) { return v==null || v.isBlank()?fallback:v.trim(); }
    private String invoice(String v,String prefix) { return v==null || v.isBlank()?prefix+"-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT):v.trim(); }
    private String newMedicineId() { return "MED-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT); }
}
