package com.fivesum.sumfood.dto.responses;

import java.util.List;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShoppingCartResponse {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private double totalPrice;
    private List<ShoppingCartItemResponse> items;
    private List<ShoppingCartWheelResponse> wheels;
}