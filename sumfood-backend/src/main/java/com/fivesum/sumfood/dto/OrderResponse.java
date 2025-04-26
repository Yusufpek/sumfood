package com.fivesum.sumfood.dto;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.fivesum.sumfood.dto.FoodItem;

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
    private List<FoodItem> foodItems;
}
