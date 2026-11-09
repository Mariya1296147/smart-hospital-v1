package com.hospitalCRUD.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pharmacy_purchases", uniqueConstraints = @UniqueConstraint(name = "uk_pharmacy_purchase_invoice", columnNames = "invoice_number"))
@Getter
@Setter
@NoArgsConstructor
public class PharmacyPurchase extends BaseEntity {
    @Column(name = "invoice_number", nullable = false, length = 64)
    private String invoiceNumber;

    @Column(nullable = false, length = 160)
    private String supplierName;

    @Column(length = 80)
    private String supplierContact;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @JsonIgnore
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "invoice_pdf", columnDefinition = "bytea")
    private byte[] invoicePdf;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PharmacyPurchaseItem> items = new ArrayList<>();

    public void addItem(PharmacyPurchaseItem item) {
        items.add(item);
        item.setPurchase(this);
    }
}
