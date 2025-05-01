package com.fivesum.sumfood.dto.responses;

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
    private Long reviewId;
    private Date createdAt;
    private String orderStatus;
    private String orderType;
    private String paymentStatus;
    private double totalPrice;
    private String restaurantName;
    private String address;
    private double latitude;
    private double longitude;
    private List<ShoppingCartItemResponse> foodItems;
}
