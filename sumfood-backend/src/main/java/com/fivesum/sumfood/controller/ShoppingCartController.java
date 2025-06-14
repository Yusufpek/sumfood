package com.fivesum.sumfood.controller;

import com.fivesum.sumfood.dto.requests.ShoppingCartCreateRequest;
import com.fivesum.sumfood.dto.requests.ShoppingCartUpdateRequest;
import com.fivesum.sumfood.dto.requests.ShoppingCartWheelRequest;
import com.fivesum.sumfood.dto.responses.ShoppingCartResponse;
import com.fivesum.sumfood.exception.ConflictException;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.exception.UnauthorizedAccessException;
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
            try {
                ShoppingCartResponse response = shoppingCartService.createShoppingCart(request, customer.get());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } catch (ConflictException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            } catch (InvalidRequestException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An unexpected error occurred: " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

    }

    @Transactional
    @PostMapping("/update")
    public ResponseEntity<?> updateShoppingCart(@RequestBody ShoppingCartUpdateRequest request,
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));

        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            try {
                ShoppingCartResponse response = shoppingCartService.updateShoppingCart(request, customer.get());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } catch (InvalidRequestException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            } catch (UnauthorizedAccessException e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            } catch (ConflictException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An unexpected error occurred: " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("/add_wheel")
    public ResponseEntity<?> addWheelToShoppingCart(@RequestBody ShoppingCartWheelRequest request,
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            try {
                ShoppingCartResponse response = shoppingCartService.addWheelToShoppingCart(request, customer.get());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } catch (InvalidRequestException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            } catch (UnauthorizedAccessException e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            } catch (ConflictException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An unexpected error occurred: " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/")
    public ResponseEntity<?> getShoppingCart(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            ShoppingCart cart = shoppingCartService.getActiveCartByCustomer(customer.get());
            if (cart != null) {
                ShoppingCartResponse response = shoppingCartService.mapToDTO(cart);
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Shopping cart not found.");
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> getShoppingCart(@RequestHeader("Authorization") String token,
            @PathVariable() String cartId) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            long id;
            try {
                id = Long.parseLong(cartId);
                boolean response = shoppingCartService.deleteShoppingCart(customer.get(), id);
                if (response)
                    return ResponseEntity.ok("Address deleted successfully");
            } catch (NumberFormatException e) {
                System.out.printf("Invalid item ID format: %s%n", cartId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid item ID format.");
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}