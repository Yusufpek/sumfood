package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.experimental.SuperBuilder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Setter
@Getter
@Table(name = "deliveries")
public class Delivery extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "courier_id", nullable = false)
    private Courier courier;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}
