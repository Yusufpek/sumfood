package com.fivesum.sumfood.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.UserBase;
import com.fivesum.sumfood.model.enums.Role;

import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "customers")
public class Customer extends UserBase {
    @PrePersist
    public void prePersist() {
        setRole(Role.CUSTOMER);
    }

    // Relations
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerFavoriteRestaurant> favoriteRestaurants = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();
}
