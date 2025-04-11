package com.fivesum.sumfood.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.enums.Category;
import com.fivesum.sumfood.service.FoodItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodItemController {
    private final FoodItemService foodItemService;

    @GetMapping("/items")
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemService.getAllFoodItems());
    }

    @GetMapping("/items/{categoryStr}")
    public ResponseEntity<List<FoodItem>> getFoodItemByCategory(@PathVariable() String categoryStr) {
        try {
            Category category = Category.valueOf(categoryStr.toUpperCase());
            return ResponseEntity.ok(foodItemService.getItemsByCategory(category));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }
}
