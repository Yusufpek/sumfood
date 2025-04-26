package com.fivesum.sumfood.controller;

import com.fivesum.sumfood.dto.OrderRequest;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.service.OrderService;
import com.fivesum.sumfood.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request, @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Order order = orderService.createOrder(request, email);
        return ResponseEntity.ok(order);
    }
}