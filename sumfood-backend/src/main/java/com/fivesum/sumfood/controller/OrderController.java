package com.fivesum.sumfood.controller;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final CustomerService customerService;
    private final JwtService jwtService;

    @Transactional
    @PostMapping("/")
    public ResponseEntity<?> createOrder(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));

        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            try {
                OrderResponse response = orderService.createOrder(customer.get());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } catch (InvalidRequestException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An unexpected error occurred: " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            List<OrderResponse> orders = orderService.getOrdersByCustomer(customer);

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/orders/{orderStatus}")
    public ResponseEntity<?> getOrders(@RequestHeader("Authorization") String token,
            @PathVariable() String orderStatus) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            List<OrderResponse> orders = orderService.getOrdersByCustomerByStatus(customer, orderStatus);

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }
}
