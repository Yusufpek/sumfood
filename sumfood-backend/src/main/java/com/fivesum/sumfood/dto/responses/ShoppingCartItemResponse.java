package com.fivesum.sumfood.dto.responses;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShoppingCartItemResponse {
    private Long foodItemId;
    private String foodItemName;
    private String imageRestaurantName;
    private double price;
    private int amount;
}
