package com.fivesum.sumfood.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShoppingCartWheelResponse {
    private Long wheelId;
    private double price;
    private Long foodItemId;
    private String foodItemName;
    private String imageRestaurantName;
}
