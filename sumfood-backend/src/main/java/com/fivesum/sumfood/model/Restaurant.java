package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.UserBase;
import com.fivesum.sumfood.model.enums.Role;

import lombok.experimental.SuperBuilder;

@SuperBuilder
@Entity
@Table(name = "restaurants")
public class Restaurant extends UserBase {
    // User base fields is for Restaurant admin user

    @Column(nullable = false, unique = true)
    private String taxIdentificationNumber; // Vergi Kimlik Numarası

    @Column(nullable = false, unique = true)
    private String bussinesName; // Real Name

    @Column(nullable = false, unique = true, length = 50)
    private String displayName;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private boolean isValidated = false;

    // TODO: Add location fields

    @PrePersist
    public void prePersist() {
        setRole(Role.RESTAURANT);
    }
}
