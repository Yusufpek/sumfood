package com.fivesum.sumfood.controller;

import java.text.Collator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.dto.responses.OrderResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.exception.UnauthorizedAccessException;
import com.fivesum.sumfood.model.Courier;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.OrderReview;
import com.fivesum.sumfood.service.CourierService;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.OrderService;
import com.fivesum.sumfood.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final CustomerService customerService;
    private final ReviewService reviewService;
    private final CourierService courierService;
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
            orders.stream().map(orderResponse -> {
                OrderReview review = reviewService.getReviewByOrderId(orderResponse.getId());
                orderResponse.setReviewId(review.getId());
                return orderResponse;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@RequestHeader("Authorization") String token,
            @PathVariable() String orderId) {

        String email = jwtService.extractUsername(token.substring(7));
        Optional<Customer> customerOpt = customerService.findByEmail(email);

        if (!customerOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
        }
        Customer customer = customerOpt.get();
        long id;
        try {
            id = Long.parseLong(orderId);
            OrderResponse response = orderService.getOrderById(customer, id);
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
                    .body("An unexpected error occured: " + e.getMessage());
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }

    @GetMapping("/orders/past")
    public ResponseEntity<?> getPastOrders(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            List<OrderResponse> orders = orderService.getPastOrdersByCustomer(customer);

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }

    @GetMapping("/orders/active")
    public ResponseEntity<?> getActiveOrders(@RequestHeader("Authorization") String token,
            @RequestHeader("Role") String role) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            if (role.equals("CUSTOMER")) {
                Optional<Customer> customerOpt = customerService.findByEmail(email);
                if (!customerOpt.isPresent()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
                }

                Customer customer = customerOpt.get();
                List<OrderResponse> orders = orderService.getActiveOrdersByCustomer(customer);
                return ResponseEntity.ok(orders);

            } else if (role.equals("COURIER")) {
                Optional<Courier> courierOpt = courierService.findByEmail(email);
                if (!courierOpt.isPresent()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
                }
                List<OrderResponse> orders = orderService.getActiveOrders();
                return ResponseEntity.ok(orders);
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }
}
