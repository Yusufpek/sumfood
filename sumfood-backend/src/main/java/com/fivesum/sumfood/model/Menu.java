package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.experimental.SuperBuilder;

@SuperBuilder
@Entity
@Table(name = "menu")
public class Menu extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant resturant;

    @Column(nullable = false)
    String title;

    @Column(nullable = false)
    String description;
}
