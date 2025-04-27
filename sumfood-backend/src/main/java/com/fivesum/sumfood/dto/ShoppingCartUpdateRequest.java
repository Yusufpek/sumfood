package com.fivesum.sumfood.dto;

import lombok.Data;

@Data
public class ShoppingCartUpdateRequest {
    Long shoppingCartId;
    Long foodItemId;
    int foodItemCount;
}
