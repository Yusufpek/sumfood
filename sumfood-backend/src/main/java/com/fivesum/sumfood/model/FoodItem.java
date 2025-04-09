package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.experimental.SuperBuilder;

@SuperBuilder
@Entity
@Table(name = "food_items")
public class FoodItem extends EntityBase {
    @OneToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 50)
    String name;

    @Column(nullable = false)
    String description;

    @Column(nullable = false)
    double price;

    @Column(nullable = false)
    int stock = 0;

    @Column(nullable = false)
    boolean isDonated = false; // default is for sale

}
