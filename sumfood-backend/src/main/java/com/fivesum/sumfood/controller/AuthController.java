package com.fivesum.sumfood.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.dto.AuthRequest;
import com.fivesum.sumfood.dto.CourierRegistrationRequest;
import com.fivesum.sumfood.dto.CustomerRegistrationRequest;
import com.fivesum.sumfood.dto.RestaurantRegistrationRequest;
import com.fivesum.sumfood.model.Courier;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.service.CourierService;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.RestaurantService;
import com.fivesum.sumfood.responses.LoginResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerService customerService;
    private final CourierService courierService;
    private final RestaurantService restaurantService;

    @PostMapping("/register/customer")
    public ResponseEntity<Customer> registerCustomer(@RequestBody CustomerRegistrationRequest request) {
        // Check if email already exists
        if (customerService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.registerCustomer(request));
    }

    @PostMapping("/register/courier")
    public ResponseEntity<Courier> registerCouirer(@RequestBody CourierRegistrationRequest request) {
        // Check if email already exists
        if (courierService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(courierService.registerCourier(request));
    }

    @PostMapping("/register/restaurant")
    public ResponseEntity<Restaurant> registerRestaurant(@RequestBody RestaurantRegistrationRequest request) {
        // Check if email already exists
        if (restaurantService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.registerCourier(request));
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

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody AuthRequest loginUserDto) {
        User authenticatedUser;

        if (loginUserDto.getRole() == "CUSTOMER") {
            authenticatedUser = customerService.authenticate(loginUserDto);
        } else if (loginUserDto.getRole() == "COURIER") {
            authenticatedUser = courierService.authenticate(loginUserDto);
        } else if (loginUserDto.getRole() == "RESTAURANT") {
            authenticatedUser = restaurantService.authenticate(loginUserDto);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Request Body");
        }

        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = new LoginResponse().setToken(jwtToken).setExpiresIn(jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);
    }
}