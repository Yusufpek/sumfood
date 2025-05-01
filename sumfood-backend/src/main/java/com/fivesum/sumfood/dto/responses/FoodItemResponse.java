package com.fivesum.sumfood.dto.responses;

import java.util.List;

import com.fivesum.sumfood.model.enums.Category;

import lombok.*;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@Getter
@Setter
public class FoodItemResponse {
    private Long foodItemId;
    private String name;
    private String description;
    private Long restaurantId;
    private String restaurantName;
    private String imageName;
    private int stock;
    private double price;
    private List<Category> categories;
}