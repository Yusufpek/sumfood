package com.fivesum.sumfood.controller;

import lombok.RequiredArgsConstructor;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fivesum.sumfood.constants.ImagePath;
import com.fivesum.sumfood.dto.requests.AuthRequest;
import com.fivesum.sumfood.dto.requests.CourierRegistrationRequest;
import com.fivesum.sumfood.dto.requests.CustomerRegistrationRequest;
import com.fivesum.sumfood.dto.requests.RestaurantRegistrationRequest;
import com.fivesum.sumfood.dto.responses.LoginResponse;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.base.UserBase;
import com.fivesum.sumfood.model.enums.Role;
import com.fivesum.sumfood.service.CourierService;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.ImageService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerService customerService;
    private final CourierService courierService;
    private final RestaurantService restaurantService;
    private final JwtService jwtService;
    private final ImageService imageService;

    @PostMapping("/register/customer")
    public ResponseEntity<Customer> registerCustomer(@RequestBody CustomerRegistrationRequest request) {
        // Check if email already exists
        if (customerService.existsByEmail(request.getEmail()) || courierService.existsByEmail(request.getEmail())
                || restaurantService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.registerCustomer(request));
    }

    @PostMapping("/register/courier")
    public ResponseEntity<?> registerCouirer(@RequestBody CourierRegistrationRequest request) {
        // Check if email already exists
        if (customerService.existsByEmail(request.getEmail()) || courierService.existsByEmail(request.getEmail())
                || restaurantService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email must be unique");
        }
        if (courierService.existsByPhoneNumber(request.getPhoneNumber())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Phone Number must be unique");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(courierService.registerCourier(request));
    }

    @PostMapping(value = "/register/restaurant", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerRestaurant(
            @RequestPart("restaurantRegistration") RestaurantRegistrationRequest request,
            @RequestPart("file") MultipartFile file) {
        // Check if email already exists
        if (customerService.existsByEmail(request.getEmail()) || courierService.existsByEmail(request.getEmail())
                || restaurantService.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email must be unique");
        }
        if (restaurantService.existsByTaxIdentificationNumber(request.getTaxIdentificationNumber())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Tax Identification Number must be unique");
        }
        if (restaurantService.existsByPhoneNumber(request.getPhoneNumber())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Phone Number must be unique");
        }
        String imagePath;

        try {
            imagePath = imageService.saveImageToStorage(ImagePath.RESTAURANT_LOGO_PATH, file);
        } catch (IOException exception) {
            imagePath = null;
            System.out.println("Restaurant image save error: " + exception.getMessage());
        }

        request.setImagePath(imagePath);
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.registerRestaurant(request));
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
        UserBase authenticatedUser;

        if (loginUserDto.getRole() == Role.CUSTOMER) {
            authenticatedUser = customerService.authenticate(loginUserDto);
        } else if (loginUserDto.getRole() == Role.COURIER) {
            authenticatedUser = courierService.authenticate(loginUserDto);
        } else if (loginUserDto.getRole() == Role.RESTAURANT) {
            authenticatedUser = restaurantService.authenticate(loginUserDto);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponse loginResponse = new LoginResponse(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);
    }
}