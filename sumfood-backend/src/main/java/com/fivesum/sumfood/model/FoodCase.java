package com.fivesum.sumfood.model;

import java.util.List;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;
import com.fivesum.sumfood.model.enums.Category;

@Entity
@Table(name = "food_cases")
public class FoodCase extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false, length = 50)
    String title;

    @Column(nullable = false)
    String description;

    @Column(nullable = false)
    double price;

    @ElementCollection(targetClass = Category.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "food_case_categories", joinColumns = @JoinColumn(name = "food_case_id"))
    @Column(name = "category")
    private List<Category> categories;

    // Relation
    @OneToMany(mappedBy = "foodCase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FoodCaseItemRelation> items;
}
