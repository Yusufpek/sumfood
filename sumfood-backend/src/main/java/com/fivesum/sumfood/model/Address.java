package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

public class Address extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String addressLine;

    @Column(nullable = true)
    private String addressLine2;

    @Column(nullable = false, length = 5)
    private String postalCode;
}
