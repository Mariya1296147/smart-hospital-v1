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
@Table(name = "pharmacy_sales", uniqueConstraints = @UniqueConstraint(name = "uk_pharmacy_sale_invoice", columnNames = "invoice_number"))
@Getter
@Setter
@NoArgsConstructor
public class PharmacySale extends BaseEntity {
    @Column(name = "invoice_number", nullable = false, length = 64)
    private String invoiceNumber;

    @Column(length = 160)
    private String customerName;

    @Column(length = 80)
    private String customerContact;

    @Column(nullable = false)
    private LocalDate saleDate;

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

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PharmacySaleItem> items = new ArrayList<>();

    public void addItem(PharmacySaleItem item) {
        items.add(item);
        item.setSale(this);
    }
}
