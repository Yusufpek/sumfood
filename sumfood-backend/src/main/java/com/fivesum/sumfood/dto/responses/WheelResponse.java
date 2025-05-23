package com.fivesum.sumfood.dto.responses;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@Getter
@Setter
public class WheelResponse {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String name;
    private String description;
    private double price;
    private List<WheelItemResponse> items;
}
