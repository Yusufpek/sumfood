package com.fivesum.sumfood.model;

import java.util.List;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity
@SuperBuilder
@Table(name = "wheels")
public class Wheel extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false, length = 50)
    String title;

    @Column(nullable = false)
    String description;

    @Column(nullable = false)
    double price;

    @OneToMany(mappedBy = "wheel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WheelItemRelation> items;

}
