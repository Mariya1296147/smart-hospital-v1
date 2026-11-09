package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "images")
@Getter
@Setter
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    private String contentType;

    // Store image bytes as PostgreSQL bytea. @Lob maps byte[] to OID on
    // PostgreSQL, which causes mismatches when Hibernate binds byte arrays.
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] imageData;
}
