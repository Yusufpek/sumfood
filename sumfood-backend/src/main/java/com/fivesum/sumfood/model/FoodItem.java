package com.fivesum.sumfood.model;

import java.util.List;
import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;
import com.fivesum.sumfood.model.enums.Category;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "food_items")
public class FoodItem extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private int stock = 0;

    @Column(nullable = false)
    private boolean isDonated = false;

    @Column(nullable = false)
    private String imageName;

    @ElementCollection(targetClass = Category.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "food_item_categories", joinColumns = @JoinColumn(name = "food_item_id"))
    @Column(name = "category")
    private List<Category> categories;
}
