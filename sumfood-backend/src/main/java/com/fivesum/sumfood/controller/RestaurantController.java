package com.fivesum.sumfood.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.responses.RestaurantProfileResponse;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantController {
    private final JwtService jwtService;
    private final RestaurantService restaurantService;

    @GetMapping("/public/all")
    public ResponseEntity<List<RestaurantProfileResponse>> getAllFoodItems() {
        return ResponseEntity.ok(restaurantService.getAll());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        System.out.println("===============");
        System.out.println("restaurant profile");
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Restaurant restaurant = restaurantService.getRestaurantProfile(email);
            RestaurantProfileResponse response = restaurantService.toProfileResponse(restaurant);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
