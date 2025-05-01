package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "food_reviews")
public class FoodReview extends EntityBase {
    @OneToOne(optional = false)
    @JoinColumn(name = "order_review_id", nullable = false)
    private OrderReview orderReview;

    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column
    private double score;

    @Column
    private String comment;
}
