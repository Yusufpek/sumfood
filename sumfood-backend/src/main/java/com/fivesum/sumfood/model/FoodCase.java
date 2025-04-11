package com.fivesum.sumfood.model;

import java.util.List;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

public class FoodCase extends EntityBase {
    @OneToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Menu category;

    @Column(nullable = false, length = 50)
    String title;

    @Column(nullable = false)
    String description;

    @Column(nullable = false)
    double price;

    // Relation
    @OneToMany(mappedBy = "foodCase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FoodCaseItemRelation> items;
}
