package com.fivesum.sumfood.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fivesum.sumfood.dto.CustomerRegistrationRequest;
import com.fivesum.sumfood.dto.CustomerUpdateRequest;
import com.fivesum.sumfood.dto.AuthRequest;
import com.fivesum.sumfood.dto.AddressRequest;
import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.dto.FoodItemShoppingCartDTO;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.ShoppingCart;
import com.fivesum.sumfood.model.ShoppingCartFoodItemRelation;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Address;
import com.fivesum.sumfood.repository.CustomerRepository;
import com.fivesum.sumfood.repository.AddressRepository;
import com.fivesum.sumfood.repository.OrderRepository;
import com.fivesum.sumfood.responses.CustomerGetResponse;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class CustomerService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final GoogleMapsService googleMapsService;

    @Transactional
    public Customer registerCustomer(CustomerRegistrationRequest request) {
        Customer customer = Customer.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .build();

        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(CustomerUpdateRequest request, Customer customer) {
        if (request.getName() != null) {
            customer.setName(request.getName());
        }
        if (request.getLastName() != null) {
            customer.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            customer.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getPassword() != null) {
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return customerRepository.save(customer);
    }

    public CustomerGetResponse getCustomerResponse(Customer customer) {
        return new CustomerGetResponse(
                customer.getName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber());
    }

    @Transactional
    public Address addAddress(AddressRequest request, Customer customer) {
        double latitude = 0;
        double longitude = 0;
        try {
            String addressStr = request.getAddressLine() + request.getAddressLine2();
            double[] points = googleMapsService.getLatLongByAddress(addressStr);
            latitude = points[0];
            longitude = points[1];
        } catch (Exception e) {
            System.out.println("Error in updating address " + e.getMessage());
        }

        Address address = Address.builder()
                .customer(customer)
                .addressLine(request.getAddressLine())
                .addressLine2(request.getAddressLine2())
                .postalCode(request.getPostalCode())
                .latitude(latitude)
                .longitude(longitude)
                .build();

        customer.getAddresses().add(address);
        customerRepository.save(customer);
        return address;
    }

    @Transactional
    public Address updateAddress(Address address, AddressRequest request, Customer customer) {
        if (!customer.getAddresses().contains(address)) {
            throw new IllegalArgumentException("Address not found in customer's address list");
        }
        boolean isChanged = false;
        if (request.getAddressLine() != null) {
            address.setAddressLine(request.getAddressLine());
            isChanged = true;
        }
        if (request.getAddressLine2() != null) {
            address.setAddressLine2(request.getAddressLine2());
            isChanged = true;
        }
        if (request.getPostalCode() != null) {
            address.setPostalCode(request.getPostalCode());
        }

        if (isChanged) {
            try {
                String addressStr = address.getAddressLine() + address.getAddressLine2();
                double[] points = googleMapsService.getLatLongByAddress(addressStr);
                address.setLatitude(points[0]);
                address.setLongitude(points[1]);
            } catch (Exception e) {
                System.out.println("Error in updating address " + e.getMessage());
            }
        }

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Address address, Customer customer) {
        if (!customer.getAddresses().contains(address)) {
            throw new IllegalArgumentException("Address not found in customer's address list");
        }
        customer.getAddresses().remove(address);
        addressRepository.delete(address);
        customerRepository.save(customer);
    }

    public Address findAddressById(Long addressId) {
        return addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found with id: " + addressId));
    }

    @Transactional
    public List<OrderResponse> getOrders(Customer customer) {
        List<Order> orders = orderRepository.findByCustomer(customer);
        List<OrderResponse> orderResponses = new ArrayList<>();

        for (Order order : orders) {
            OrderResponse orderResponse = new OrderResponse();
            orderResponse.setId(order.getId());
            orderResponse.setCreatedAt(order.getCreateAt());
            orderResponse.setOrderStatus(order.getOrderStatus().name());
            orderResponse.setPaymentStatus(order.getPaymentStatus().name());
            orderResponse.setTotalPrice(order.getShoppingCart().getTotalPrice());
            orderResponse.setRestaurantName(order.getShoppingCart().getRestaurant().getName());
            List<FoodItemShoppingCartDTO> foodItemsInCart = new ArrayList<>();
            for (ShoppingCartFoodItemRelation relation : order.getShoppingCart().getItems()) {
                foodItemsInCart.add(new FoodItemShoppingCartDTO(
                        relation.getFoodItem().getId(),
                        relation.getFoodItem().getName(),
                        relation.getAmount(),
                        relation.getFoodItem().getPrice()
                        ));
            }
            orderResponse.setFoodItems(foodItemsInCart);
            orderResponses.add(orderResponse);
        }

        return orderResponses;
    }

    @Transactional
    public Customer authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        return customerRepository.findByEmail(request.getEmail()).orElseThrow(null);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        customerRepository.findByEmail(email);
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmail(email);
    }
}
