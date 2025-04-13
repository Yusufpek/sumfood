package com.fivesum.sumfood.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.UserBase;
import com.fivesum.sumfood.model.enums.Role;

import lombok.*;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "restaurants")
public class Restaurant extends UserBase {
    // User base fields is for Restaurant admin user

    @Column(nullable = false, unique = true)
    private String taxIdentificationNumber; // Vergi Kimlik Numarası

    @Column(nullable = false, unique = true)
    private String businessName; // Real Name

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

    @Override
    public boolean isEnabled() {
        return isValidated;
    }

    // Relation
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FoodItem> foodItems = new ArrayList<>();
}
