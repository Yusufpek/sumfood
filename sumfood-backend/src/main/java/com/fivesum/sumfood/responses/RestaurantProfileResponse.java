package com.fivesum.sumfood.responses;

import lombok.Data;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Data
public class RestaurantProfileResponse {
    private String displayName;
    private String description;
    private String address;
}