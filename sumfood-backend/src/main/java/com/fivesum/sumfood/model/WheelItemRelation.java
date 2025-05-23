package com.fivesum.sumfood.model;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "wheel_item_relations", uniqueConstraints = @UniqueConstraint(columnNames = { "wheel_id",
        "food_item_id" }))
public class WheelItemRelation extends EntityBase {

    @ManyToOne(optional = false)
    @JoinColumn(name = "wheel_id", referencedColumnName = "id")
    private Wheel wheel;

    @ManyToOne(optional = false)
    @JoinColumn(name = "food_item_id", referencedColumnName = "id")
    private FoodItem foodItem;
    
}
