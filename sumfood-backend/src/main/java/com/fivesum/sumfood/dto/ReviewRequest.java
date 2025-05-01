package com.fivesum.sumfood.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;
import javax.validation.constraints.Max;

@Data
public class ReviewRequest {

    @NotNull(message = "Delivery score is required")
    @Min(value = 1, message = "Delivery score must be at least 1")
    @Max(value = 5, message = "Delivery score must be at most 5")
    private double deliveryScore;

    @NotNull(message = "Food score is required")
    @Min(value = 1, message = "Food score must be at least 1")
    @Max(value = 5, message = "Food score must be at most 5")
    private double foodScore;

    private String foodComment; // Comment is optional

}
