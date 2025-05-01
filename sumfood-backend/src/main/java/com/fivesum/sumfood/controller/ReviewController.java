package com.fivesum.sumfood.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fivesum.sumfood.dto.ReviewRequest;
import com.fivesum.sumfood.dto.responses.ReviewResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.exception.UnauthorizedAccessException;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final CustomerService customerService;
    private final JwtService jwtService;

    @GetMapping("/public/{reviewId}")
    public ResponseEntity<?> getOrder(@PathVariable() String reviewId) {
        try {
            long id = Long.parseLong(reviewId);
            ReviewResponse response = reviewService.getReviewById(id);
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            System.out.printf("Invalid item ID format: %s%n", reviewId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid item ID format.");
        } catch (InvalidRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }

    }

    @PostMapping("/order/{orderId}")
    public ResponseEntity<?> addOrder(@RequestHeader("Authorization") String token, @RequestBody ReviewRequest request,
            @PathVariable() String orderId) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));

        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            try {
                long id = Long.parseLong(orderId);
                ReviewResponse response = reviewService.createReview(customer.get(), id, request);
                return ResponseEntity.ok(response);
            } catch (NumberFormatException e) {
                System.out.printf("Invalid item ID format: %s%n", orderId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid item ID format.");
            } catch (InvalidRequestException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            } catch (UnauthorizedAccessException e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An unexpected error occurred: " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

}
