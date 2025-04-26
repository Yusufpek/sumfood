package com.fivesum.sumfood.dto;

import lombok.Data;

@Data
public class ShoppingCartCreateRequest {
    Long restaurantId;
    Long foodItemId;
    int foodItemCount;
}
