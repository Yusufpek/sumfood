package com.fivesum.sumfood.responses;

import lombok.Data;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Data
public class RestaurantProfileResponse {
    private String displayName;
    private String description;
    private double longitude;
    private double latitude;
    private String address;
}