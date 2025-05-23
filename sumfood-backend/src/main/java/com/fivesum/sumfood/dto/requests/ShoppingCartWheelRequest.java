package com.fivesum.sumfood.dto.requests;

import lombok.Data;

@Data
public class ShoppingCartWheelRequest {
    private Long shoppingCartId;
    private Long wheelId;
    private Long foodItemId;
}
