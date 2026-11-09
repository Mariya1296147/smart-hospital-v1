package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Pharmacy;
import com.hospitalCRUD.dtos.PharmacyPurchaseRequest;
import com.hospitalCRUD.dtos.PharmacySaleRequest;
import com.hospitalCRUD.dtos.PharmacyTransactionDTO;
import com.hospitalCRUD.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public List<Pharmacy> getAll() {
        return pharmacyService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public Pharmacy getById(@PathVariable Long id) {
        return pharmacyService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public Pharmacy create(@RequestBody Pharmacy pharmacy) {
        return pharmacyService.create(pharmacy);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public Pharmacy update(
            @PathVariable Long id,
            @RequestBody Pharmacy pharmacy
    ) {
        return pharmacyService.update(id, pharmacy);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public String delete(@PathVariable Long id) {
        pharmacyService.delete(id);
        return "Pharmacy deleted successfully";
    }

    @GetMapping("/purchases")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public List<PharmacyTransactionDTO> getPurchases() { return pharmacyService.getPurchases(); }

    @PostMapping("/purchases")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public PharmacyTransactionDTO createPurchase(@RequestBody PharmacyPurchaseRequest request) { return pharmacyService.createPurchase(request); }

    @GetMapping("/purchases/{id}/invoice.pdf")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public ResponseEntity<byte[]> purchasePdf(@PathVariable Long id) { return pdf(pharmacyService.purchasePdf(id), "purchase-" + id + ".pdf"); }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public List<PharmacyTransactionDTO> getSales() { return pharmacyService.getSales(); }

    @PostMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public PharmacyTransactionDTO createSale(@RequestBody PharmacySaleRequest request) { return pharmacyService.createSale(request); }

    @GetMapping("/sales/{id}/invoice.pdf")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACY_STAFF')")
    public ResponseEntity<byte[]> salePdf(@PathVariable Long id) { return pdf(pharmacyService.salePdf(id), "sale-" + id + ".pdf"); }

    private ResponseEntity<byte[]> pdf(byte[] content, String filename) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"").body(content);
    }
}
