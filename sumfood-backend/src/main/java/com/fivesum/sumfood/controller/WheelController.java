package com.fivesum.sumfood.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fivesum.sumfood.dto.requests.WheelCreateRequest;
import com.fivesum.sumfood.dto.responses.WheelResponse;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;
import com.fivesum.sumfood.service.WheelService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wheels")
@RequiredArgsConstructor
public class WheelController {
    private final JwtService jwtService;
    private final RestaurantService restaurantService;
    private final WheelService wheelService;
    
    @GetMapping("/restaurant")
    public ResponseEntity<List<WheelResponse>> getFoodItemsByRestaurant(
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(wheelService.getWheelsByRestaurant(restaurant.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("/restaurant/create")
    public ResponseEntity<WheelResponse> createWheel(
            @RequestHeader("Authorization") String token,
            @RequestBody WheelCreateRequest request) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            // Logic to create a wheel
            return ResponseEntity.status(HttpStatus.OK).body(wheelService.createWheel(restaurant.get(), request));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("restaurant/add_to_wheel/{wheelId}/{foodItemId}")
    public ResponseEntity<WheelResponse> addItemToWheel(
            @RequestHeader("Authorization") String token, @PathVariable Long wheelId,
            @PathVariable Long foodItemId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            // Logic to add item to wheel
            return ResponseEntity.status(HttpStatus.OK).body(wheelService.addItemToWheel(wheelId, foodItemId, restaurant.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("restaurant/remove_from_wheel/{wheelId}/{foodItemId}")
    public ResponseEntity<WheelResponse> removeItemFromWheel(
            @RequestHeader("Authorization") String token, @PathVariable Long wheelId,
            @PathVariable Long foodItemId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            // Logic to add item to wheel
            return ResponseEntity.status(HttpStatus.OK).body(wheelService.removeItemFromWheel(wheelId, foodItemId, restaurant.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("restaurant/delete/{wheelId}")
    public ResponseEntity<Void> deleteWheel(
            @RequestHeader("Authorization") String token, @PathVariable Long wheelId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Restaurant> restaurant = restaurantService.findByEmail(email);
        if (restaurant.isPresent()) {
            // Logic to add item to wheel
            wheelService.deleteWheel(wheelId, restaurant.get());
            return ResponseEntity.status(HttpStatus.OK).build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
