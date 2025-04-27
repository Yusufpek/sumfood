package com.fivesum.sumfood.model;

import java.util.List;
import java.util.ArrayList;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.*;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shopping_carts")
public class ShoppingCart extends EntityBase {

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id", referencedColumnName = "id")
    private Restaurant restaurant;

    @Column(nullable = false)
    private double totalPrice;

    @Column(nullable = true)
    private boolean isActive;

    // Relations
    @OneToMany(mappedBy = "shoppingCart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShoppingCartFoodItemRelation> items = new ArrayList<>();

}
