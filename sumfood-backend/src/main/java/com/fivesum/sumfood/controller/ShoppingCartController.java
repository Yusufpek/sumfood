package com.fivesum.sumfood.controller;

import com.fivesum.sumfood.dto.ShoppingCartCreateRequest;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.ShoppingCart;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.ShoppingCartService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import javax.transaction.Transactional;

@RestController
@RequestMapping("/api/shopping_cart")
@RequiredArgsConstructor
public class ShoppingCartController {
    private final ShoppingCartService shoppingCartService;
    private final CustomerService customerService;
    private final JwtService jwtService;

    @Transactional
    @PostMapping("/")
    public ResponseEntity<?> createOrder(@RequestBody ShoppingCartCreateRequest request,
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));

        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            ShoppingCart order = shoppingCartService.createShoppingCart(request, customer.get());
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

    }
}