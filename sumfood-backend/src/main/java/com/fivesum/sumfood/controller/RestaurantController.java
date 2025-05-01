package com.fivesum.sumfood.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.responses.RestaurantProfileResponse;
import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;
import com.fivesum.sumfood.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantController {
    private final JwtService jwtService;
    private final RestaurantService restaurantService;
    private final OrderService orderService;

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

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Restaurant restaurant = restaurantService.getRestaurantProfile(email);
            return ResponseEntity.ok(orderService.getActiveOrdersByRestaurant(restaurant));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/orders/{id}&{status}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @PathVariable OrderStatus status, @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Restaurant restaurant = restaurantService.getRestaurantProfile(email);
            return ResponseEntity.ok(orderService.updateOrderStatus(id, restaurant, status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Restaurant restaurant = restaurantService.getRestaurantProfile(email);
            orderService.cancelOrder(id, restaurant);
            return ResponseEntity.ok("Order cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
