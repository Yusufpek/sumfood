package com.fivesum.sumfood.controller;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.service.FoodItemService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantController {
    private final JwtService jwtService;
    private final RestaurantService restaurantService;
    private final FoodItemService foodItemService;

    @GetMapping("/items")
    public ResponseEntity<List<FoodItem>> addFoodItem(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(foodItemService.getFoodItemByRestaurant(restaurant.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
