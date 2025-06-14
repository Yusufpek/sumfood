package com.fivesum.sumfood.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.constants.ImagePath;
import com.fivesum.sumfood.dto.responses.RestaurantProfileResponse;
import com.fivesum.sumfood.dto.responses.ReviewResponse;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.service.ImageService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;
import com.fivesum.sumfood.service.ReviewService;
import com.fivesum.sumfood.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantController {
    private final JwtService jwtService;
    private final RestaurantService restaurantService;
    private final OrderService orderService;
    private final ImageService imageService;
    private final ReviewService reviewService;

    @GetMapping("/public/image/{imageName}")
    public ResponseEntity<byte[]> getImage(@PathVariable String imageName) throws IOException {
        byte[] image = imageService.getImage(ImagePath.RESTAURANT_LOGO_PATH, imageName);
        if (image != null) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
                    .body(image);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/public/all")
    public ResponseEntity<List<RestaurantProfileResponse>> getAllFoodItems() {
        List<RestaurantProfileResponse> restaurantProfileResponses = restaurantService.getAll();
        for (RestaurantProfileResponse profile : restaurantProfileResponses) {
            profile = addAverageRate(profile);
        }
        return ResponseEntity.ok(restaurantProfileResponses);
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

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublicRestaurantById(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantService.getRestaurantById(id);
            if (restaurant == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found with ID: " + id);
            }
            RestaurantProfileResponse response = restaurantService.toProfileResponse(restaurant);
            response = addAverageRate(response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching restaurant details.");
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
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @PathVariable OrderStatus status,
            @RequestHeader("Authorization") String token) {
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

    private RestaurantProfileResponse addAverageRate(RestaurantProfileResponse restaurant) {
        List<ReviewResponse> reviews = reviewService.getReviewsByRestaurantId(restaurant.getId());
        double totalScore = 0;
        for (ReviewResponse review : reviews) {
            totalScore += review.getFoodReviewScore();
        }
        double average = totalScore / reviews.size();
        restaurant.setAverageRate(average);
        return restaurant;
    }
}
