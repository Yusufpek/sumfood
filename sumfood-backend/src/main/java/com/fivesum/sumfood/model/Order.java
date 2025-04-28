package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.model.enums.PaymentStatus;

import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@SuperBuilder
@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "orders")
public class Order extends EntityBase {

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer;

    @OneToOne
    @JoinColumn(name = "shopping_cart_id", referencedColumnName = "id", unique = true)
    private ShoppingCart shoppingCart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = true)
    private double latitude;

    @Column(nullable = true)
    private double longitude;
}