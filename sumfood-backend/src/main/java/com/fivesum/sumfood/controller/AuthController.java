package com.fivesum.sumfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.dto.AuthRequest;
import com.fivesum.sumfood.dto.CustomerRegistrationRequest;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.service.CustomerService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerService customerService;

    @PostMapping("/register/customer")
    public ResponseEntity<Customer> registerCustomer(@RequestBody CustomerRegistrationRequest request) {
        // Check if email already exists
        if (customerService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.registerCustomer(request));
    }

    @PostMapping("/login-alt")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            // This is just a fallback method - primary login is handled by
            // JwtAuthenticationFilter
            // The actual authentication will be handled by the filter
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}