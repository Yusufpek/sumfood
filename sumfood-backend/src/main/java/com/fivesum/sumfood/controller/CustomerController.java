package com.fivesum.sumfood.controller;

import java.util.Optional;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.dto.AuthRequest;
import com.fivesum.sumfood.dto.CourierRegistrationRequest;
import com.fivesum.sumfood.dto.CustomerRegistrationRequest;
import com.fivesum.sumfood.dto.RestaurantRegistrationRequest;
import com.fivesum.sumfood.dto.CustomerUpdateRequest;
import com.fivesum.sumfood.dto.AddressRequest;
import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.model.Courier;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.Address;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.ShoppingCart;
import com.fivesum.sumfood.model.ShoppingCartFoodItemRelation;
import com.fivesum.sumfood.model.base.UserBase;
import com.fivesum.sumfood.model.enums.Role;
import com.fivesum.sumfood.service.CourierService;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.RestaurantService;
import com.fivesum.sumfood.responses.LoginResponse;
import com.fivesum.sumfood.responses.CustomerGetResponse;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final JwtService jwtService;

    @PutMapping("/")
    public ResponseEntity<?> updateCustomer(@RequestBody CustomerUpdateRequest request, @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            Customer updatedCustomer = customerService.updateCustomer(request, customer);

            return ResponseEntity.ok(updatedCustomer);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/")
    public ResponseEntity<?> getCustomer(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();

            CustomerGetResponse resp = customerService.getCustomerResponse(customer);

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/address/")
    public ResponseEntity<?> addAddress(@RequestBody AddressRequest request, @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            customerService.addAddress(request, customer);

            return ResponseEntity.ok("Address added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/address/")
    public ResponseEntity<?> getAddresses(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            List<Address> addresses = customer.getAddresses();

            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PutMapping("/address/{addressIdStr}")
    public ResponseEntity<?> updateAddress(@PathVariable String addressIdStr, @RequestBody AddressRequest request, @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Long addressId = Long.parseLong(addressIdStr);
            Address address = customerService.findAddressById(addressId);
            if (address == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Address not found");
            }

            Customer customer = customerOpt.get();
            customerService.updateAddress(address, request, customer);

            return ResponseEntity.ok("Address updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping("/address/{addressIdStr}")
    public ResponseEntity<?> deleteAddress(@PathVariable String addressIdStr, @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Long addressId = Long.parseLong(addressIdStr);
            Address address = customerService.findAddressById(addressId);
            if (address == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Address not found");
            }

            Customer customer = customerOpt.get();
            customerService.deleteAddress(address, customer);

            return ResponseEntity.ok("Address deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
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
            List<OrderResponse> orders = customerService.getOrders(customer);

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }
}