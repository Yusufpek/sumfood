package com.fivesum.sumfood.dto;

import java.util.Date;
import java.util.List;

import lombok.*;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class OrderResponse {
    private Long id;
    private Date createdAt;
    private String orderStatus;
    private String paymentStatus;
    private double totalPrice;
    private String restaurantName;
    private String address;
    private List<FoodItemShoppingCartDTO> foodItems;
}
