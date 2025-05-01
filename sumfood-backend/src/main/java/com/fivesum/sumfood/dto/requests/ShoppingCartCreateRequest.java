package com.fivesum.sumfood.dto.requests;

import lombok.Data;

@Data
public class ShoppingCartCreateRequest {
    Long restaurantId;
    Long foodItemId;
    int foodItemCount;
}
