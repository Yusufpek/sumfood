package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.UserBase;

import lombok.experimental.SuperBuilder;

@SuperBuilder
@Entity
@Table(name = "customers")
public class Customer extends UserBase {
    @PrePersist
    public void prePersist() {
        setRole(Role.CUSTOMER);
    }
}
