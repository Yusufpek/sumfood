package com.fivesum.sumfood.responses;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShoppingCartItemResponse {
    private Long foodItemId;
    private String foodItemName;
    private double price;
    private int amount;
}
