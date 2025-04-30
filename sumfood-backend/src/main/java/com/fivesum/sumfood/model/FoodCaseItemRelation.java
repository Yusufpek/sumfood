package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.*;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "food_case_item_relations", uniqueConstraints = @UniqueConstraint(columnNames = { "food_case_id",
        "food_item_id" }))
public class FoodCaseItemRelation extends EntityBase {

    @ManyToOne(optional = false)
    @JoinColumn(name = "food_case_id", referencedColumnName = "id")
    private FoodCase foodCase;

    @ManyToOne(optional = false)
    @JoinColumn(name = "food_item_id", referencedColumnName = "id")
    private FoodItem foodItem;

    @Column(nullable = false)
    private double probability;
}
