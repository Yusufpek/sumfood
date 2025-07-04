package com.fivesum.sumfood.dto.requests;

import com.fivesum.sumfood.model.enums.Category;

import lombok.Data;

@Data
public class FoodItemAddRequest {
    String name;
    String description;
    double price;
    int stock;
    Category category;
    String imagePath;
}
