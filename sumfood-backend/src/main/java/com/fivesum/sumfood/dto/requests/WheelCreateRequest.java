package com.fivesum.sumfood.dto.requests;

import java.util.List;

import lombok.Data;

@Data
public class WheelCreateRequest {
    Long restaurantId;
    String name;
    String description;
    double price;
    List<Long> foodItemIds;
}
