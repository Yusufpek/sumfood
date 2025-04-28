package com.fivesum.sumfood.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@Getter
@Setter
public class FoodItemShoppingCartDTO {
    private Long foodItemId;
    private String name;
    private int quantity;
    private double price;
}