package com.fivesum.sumfood.dto.requests;

import lombok.Data;

@Data
public class ShoppingCartUpdateRequest {
    Long shoppingCartId;
    Long foodItemId;
    int foodItemCount;
}
