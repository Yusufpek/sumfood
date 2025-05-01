package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.Data;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@Entity
@Table(name = "order_reviews")
public class OrderReview extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @OneToOne(optional = false)
    @JoinColumn(name = "delivery_review", nullable = false)
    private DeliveryReview deliveryReview;

    @OneToOne(optional = false)
    @JoinColumn(name = "food_review", nullable = false)
    private FoodReview foodReview;
}
