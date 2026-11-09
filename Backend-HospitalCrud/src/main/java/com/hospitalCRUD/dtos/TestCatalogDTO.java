package com.hospitalCRUD.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class TestCatalogDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;
}
