package com.fivesum.sumfood.dto.requests;

import lombok.Data;

@Data
public class WheelCreateRequest {
    Long restaurantId;
    String name;
    String description;
}
