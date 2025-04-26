package com.fivesum.sumfood.controller;

import com.fivesum.sumfood.dto.OrderRequest;
import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import javax.transaction.Transactional;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final JwtService jwtService;

    @Transactional
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request, @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Order order = orderService.createOrder(request, email);
        
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getId());
        response.setOrderState(order.getOrderState());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }
}