package com.fivesum.sumfood.controller;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.dto.FoodItemAddRequest;
import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.enums.Category;
import com.fivesum.sumfood.service.FoodItemService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodItemController {
    private final FoodItemService foodItemService;
    private final JwtService jwtService;
    private final RestaurantService restaurantService;

    @GetMapping("/public/items")
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemService.getAllFoodItems());
    }

    @GetMapping("/public/items/{categoryStr}")
    public ResponseEntity<List<FoodItem>> getFoodItemByCategory(@PathVariable() String categoryStr) {
        try {
            Category category = Category.valueOf(categoryStr.toUpperCase());
            return ResponseEntity.ok(foodItemService.getItemsByCategory(category));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @PostMapping("/item")
    public ResponseEntity<FoodItem> addFoodItem(@RequestHeader("Authorization") String token,
            @RequestBody FoodItemAddRequest request) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(foodItemService.addFoodItem(request, restaurant.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
