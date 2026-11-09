
        package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "beds")
@Getter
@Setter
@NoArgsConstructor
public class Bed extends BaseEntity {

    @Column(nullable = false)
    private String bedNumber;

    private String bedType;

    private String status = "AVAILABLE";

    @ManyToOne
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;
}
