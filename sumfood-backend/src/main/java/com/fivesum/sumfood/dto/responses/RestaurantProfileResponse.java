package com.fivesum.sumfood.dto.responses;

import lombok.Data;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Data
public class RestaurantProfileResponse {
    private Long id;
    private String displayName;
    private String description;
    private double longitude;
    private double latitude;
    private String address;
}