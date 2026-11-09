package com.hospitalCRUD.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class BillingPaymentRequest {
    private BigDecimal amount;
    private String paymentMethod;
    private String reference;
    private String notes;
}
