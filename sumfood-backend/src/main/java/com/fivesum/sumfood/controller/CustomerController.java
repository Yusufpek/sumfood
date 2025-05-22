package com.fivesum.sumfood.controller;

import java.util.Optional;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fivesum.sumfood.dto.requests.AddressRequest;
import com.fivesum.sumfood.dto.requests.CustomerUpdateRequest;
import com.fivesum.sumfood.dto.responses.CustomerGetResponse;
import com.fivesum.sumfood.dto.responses.RestaurantProfileResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.Address;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.JwtService;
import com.fivesum.sumfood.service.OrderService;
import com.fivesum.sumfood.service.RestaurantService;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final RestaurantService restaurantService;
    private final OrderService orderService;
    private final JwtService jwtService;

    @PutMapping("/")
    public ResponseEntity<?> updateCustomer(@RequestBody CustomerUpdateRequest request,
            @RequestHeader("Authorization") String token) {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }

    @PostMapping("/address/")
    public ResponseEntity<?> addAddress(@RequestBody AddressRequest request,
            @RequestHeader("Authorization") String token) {
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

    @GetMapping("/address/default/")
    public ResponseEntity<?> getDefaultAddress(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            Address address = customerService.getDefaultAddressByCustomer(customer);
            if (address == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Default Address is not defined");
            }

            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PutMapping("/address/default/{addressId}")
    public ResponseEntity<?> updateDefaultAddress(@RequestHeader("Authorization") String token,
            @PathVariable() String addressId) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();
            Address address = customerService.updateDefaultAddressByCustomer(customer, addressId);
            if (address == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Default Address is not defined");
            }

            return ResponseEntity.ok(address);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
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
    public ResponseEntity<?> updateAddress(@PathVariable String addressIdStr, @RequestBody AddressRequest request,
            @RequestHeader("Authorization") String token) {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }

    @DeleteMapping("/address/{addressIdStr}")
    public ResponseEntity<?> deleteAddress(@PathVariable String addressIdStr,
            @RequestHeader("Authorization") String token) {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }

    @GetMapping("/restaurants/{maxDistance}")
    public ResponseEntity<List<RestaurantProfileResponse>> getRestaurantsByCustomer(
            @PathVariable("maxDistance") double maxDistance,
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    restaurantService.getRestaurantByCustomer(customer.get(), maxDistance));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/restaurants/fav")
    public ResponseEntity<List<RestaurantProfileResponse>> getFavRestaurantsByCustomer(
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(restaurantService.getCustomerFavoriteRestaurants(customer.get()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/restaurants/fav/{restaurantId}")
    public ResponseEntity<?> getIsFavRestaurantsByCustomer(
            @RequestHeader("Authorization") String token, @PathVariable String restaurantId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            try {
                Long resId = Long.parseLong(restaurantId);
                boolean response = restaurantService.getIsRestaurantFav(customer.get(), resId);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Restaurant ID format is incorrect.");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An unexpected error occurred: " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping("/restaurants/fav/{restaurantId}")
    public ResponseEntity<?> updateFavRestaurantsByCustomer(
            @RequestHeader("Authorization") String token, @PathVariable String restaurantId) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            try {
                Long resId = Long.parseLong(restaurantId);
                RestaurantProfileResponse response = restaurantService.uptadeCustomerFavoriteRestaurants(customer.get(),
                        resId);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } catch (InvalidRequestException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Restaurant ID format is incorrect.");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("An unexpected error occurred: " + e.getMessage());
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantProfileResponse>> getRestaurantsByCustomer(
            @RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        Optional<Customer> customer = customerService.findByEmail(email);
        if (customer.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    restaurantService.getRestaurantByCustomer(customer.get(), 30));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("/cancel_order/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtService.extractUsername(token.substring(7));
            Optional<Customer> customerOpt = customerService.findByEmail(email);

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            Customer customer = customerOpt.get();

            Order order = orderService.getOrderById(orderId);

            orderService.cancelOrder(order, customer);

            return ResponseEntity.ok("Order cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occured: " + e.getMessage());
        }
    }
}