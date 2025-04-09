package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;
import com.fivesum.sumfood.model.enums.DeliveryStatus;

import lombok.experimental.SuperBuilder;

@SuperBuilder
@Entity
@Table(name = "deliveries")
public class Delivery extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "courier_id", nullable = false)
    private Courier courier;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;
}
