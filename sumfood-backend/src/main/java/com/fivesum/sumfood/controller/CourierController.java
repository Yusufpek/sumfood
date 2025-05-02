package com.fivesum.sumfood.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.exception.ConflictException;
import com.fivesum.sumfood.model.Courier;
import com.fivesum.sumfood.model.Delivery;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.service.OrderService;
import com.fivesum.sumfood.service.ReviewService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.CourierService;
import com.fivesum.sumfood.service.DeliveryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/courier")
@RequiredArgsConstructor
public class CourierController {
    private final JwtService jwtService;
    private final OrderService orderService;
    private final CourierService courierService;
    private final DeliveryService deliveryService;
    private final ReviewService reviewService;

    @PostMapping("assign_order/{id}")
    public ResponseEntity<?> assignOrder(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Courier courier = courierService.loadUserByUsername(email);
            Order order = orderService.getOrderById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
            }
            if (order.getOrderStatus() != OrderStatus.READY_FOR_PICKUP) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Order is not ready");
            }

            return ResponseEntity.ok(deliveryService.createDelivery(order, courier));
        } catch (ConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("update_delivery_status/{id}&{status}")
    public ResponseEntity<?> updateDeliveryStatus(@PathVariable Long id, @PathVariable OrderStatus status,
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Courier courier = courierService.loadUserByUsername(email);
            Delivery delivery = deliveryService.getDeliveryById(id);
            if (delivery == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Delivery not found");
            }
            if (status != OrderStatus.DELIVERED && status != OrderStatus.FAILED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status");
            }
            if (delivery.getOrder().getOrderStatus() == OrderStatus.DELIVERED
                    || delivery.getOrder().getOrderStatus() == OrderStatus.FAILED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delivery already completed");
            }
            if (delivery.getOrder().getOrderStatus() != OrderStatus.ON_THE_WAY) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delivery is not picked up yet");
            }
            if (delivery.getCourier().getId() != courier.getId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You are not authorized to update this delivery");
            }

            return ResponseEntity.ok(deliveryService.updateDeliveryStatus(delivery, status));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/delivery")
    public ResponseEntity<?> getActiveDelivery(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Courier courier = courierService.loadUserByUsername(email);
            return ResponseEntity.ok(deliveryService.getActiveDeliveryByCourier(courier));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/deliveries")
    public ResponseEntity<?> getPastDeliveries(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Courier courier = courierService.loadUserByUsername(email);
            return ResponseEntity.ok(deliveryService.getDeliveriesByCourier(courier));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/reviews")
    public ResponseEntity<?> getReviews(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        try {
            Courier courier = courierService.loadUserByUsername(email);
            return ResponseEntity.ok(reviewService.getReviewsByCourier(courier));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
