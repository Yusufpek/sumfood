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
@Table(name = "delivery_reviews")
public class DeliveryReview extends EntityBase {
    @OneToOne(optional = false)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_review_id", nullable = false)
    private OrderReview orderReview;

    @Column
    private double score;
}
