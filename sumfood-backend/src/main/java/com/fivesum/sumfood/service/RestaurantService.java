package com.fivesum.sumfood.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fivesum.sumfood.dto.requests.AuthRequest;
import com.fivesum.sumfood.dto.requests.RestaurantRegistrationRequest;
import com.fivesum.sumfood.dto.responses.RestaurantProfileResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.CustomerFavoriteRestaurant;
import com.fivesum.sumfood.repository.CustomerFavoriteRestaurantRepository;
import com.fivesum.sumfood.repository.RestaurantRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class RestaurantService implements UserDetailsService {

    private final RestaurantRepository restaurantRepository;
    private final CustomerFavoriteRestaurantRepository customerFavoriteRestaurantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final GoogleMapsService googleMapsService;
    private final CustomerService customerService;

    public List<RestaurantProfileResponse> getAll() {
        List<Restaurant> restaurants = restaurantRepository.getByIsValidated(true);
        return restaurants.stream().map(res -> toProfileResponse(res)).collect(Collectors.toList());
    }

    public List<Restaurant> getAllRaw() {
        return restaurantRepository.getByIsValidated(true);
    }

    @Transactional
    public Restaurant registerRestaurant(RestaurantRegistrationRequest request) {
        double longitude = 0;
        double latitude = 0;

        try {
            double[] points = googleMapsService.getLatLongByAddress(request.getAddress() + " " + request.getCity());
            latitude = points[0];
            longitude = points[1];
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        Restaurant restaurant = Restaurant.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .taxIdentificationNumber(request.getTaxIdentificationNumber())
                .businessName(request.getBusinessName())
                .displayName(request.getDisplayName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .longitude(longitude)
                .latitude(latitude)
                .logoName(request.getImagePath())
                .isValidated(false)
                .build();

        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant authenticate(AuthRequest request) {
        System.out.println(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        return restaurantRepository.findByEmail(request.getEmail()).orElseThrow(null);
    }

    public Restaurant getRestaurantProfile(String email) {
        return restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public Optional<Restaurant> findByEmail(String email) {
        return restaurantRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return restaurantRepository.existsByEmail(email);
    }

    public boolean existsByTaxIdentificationNumber(String taxIdentification) {
        return restaurantRepository.existsByTaxIdentificationNumber(taxIdentification);
    }

    public boolean existsByPhoneNumber(String phoneNumber) {
        return restaurantRepository.existsByPhoneNumber(phoneNumber);
    }

    public List<RestaurantProfileResponse> getRestaurantByCustomer(Customer customer, double maxDistance) {
        List<Restaurant> allRestaurants = getAllRaw();
        List<RestaurantProfileResponse> restaurantResponses = new ArrayList<>();
        double customerLat = customerService.getDefaultAddressByCustomer(customer).getLatitude();
        double customerLong = customerService.getDefaultAddressByCustomer(customer).getLongitude();
        for (Restaurant restaurant : allRestaurants) {
            double distance = distFromLatLong(customerLat, restaurant.getLatitude(),
                    customerLong, restaurant.getLongitude());
            if (distance <= maxDistance) {
                restaurantResponses.add(toProfileResponse(restaurant));
            }
        }
        return restaurantResponses;
    }

    public List<Restaurant> getRestaurantByCustomerRaw(Customer customer, double maxDistance) {
        List<Restaurant> allRestaurants = getAllRaw();
        List<Restaurant> restaurants = new ArrayList<>();
        double customerLat = customerService.getDefaultAddressByCustomer(customer).getLatitude();
        double customerLong = customerService.getDefaultAddressByCustomer(customer).getLongitude();
        for (Restaurant restaurant : allRestaurants) {
            double distance = distFromLatLong(customerLat, restaurant.getLatitude(),
                    customerLong, restaurant.getLongitude());
            if (distance <= maxDistance) {
                restaurants.add(restaurant);
            }
        }
        return restaurants;
    }

    public boolean getIsRestaurantFav(Customer customer, Long restaurantId) {
        Optional<CustomerFavoriteRestaurant> favRes = customerFavoriteRestaurantRepository
                .findByCustomerIdAndRestaurantId(customer.getId(), restaurantId);
        if (favRes.isPresent()) {
            return true;
        } else {
            return false;
        }
    }

    public List<RestaurantProfileResponse> getCustomerFavoriteRestaurants(Customer customer) {
        return customerFavoriteRestaurantRepository.findByCustomerId(customer.getId()).stream()
                .map(customerFavRes -> toProfileResponse(customerFavRes.getRestaurant())).collect(Collectors.toList());
    }

    public RestaurantProfileResponse uptadeCustomerFavoriteRestaurants(Customer customer, Long restaurantId) {
        Optional<Restaurant> res = restaurantRepository.findById(restaurantId);
        if (!res.isPresent()) {
            throw new InvalidRequestException("Restaurant Id is invalid");
        }
        Restaurant restaurant = res.get();

        Optional<CustomerFavoriteRestaurant> favRes = customerFavoriteRestaurantRepository
                .findByCustomerIdAndRestaurantId(customer.getId(), restaurantId);
        if (favRes.isPresent()) {
            customerFavoriteRestaurantRepository.delete(favRes.get());
        } else {
            CustomerFavoriteRestaurant newFavRes = CustomerFavoriteRestaurant
                    .builder()
                    .customer(customer)
                    .restaurant(restaurant)
                    .build();
            customerFavoriteRestaurantRepository.save(newFavRes);
        }
        return toProfileResponse(restaurant);
    }

    public RestaurantProfileResponse toProfileResponse(Restaurant restaurant) {
        return RestaurantProfileResponse.builder()
                .id(restaurant.getId())
                .displayName(restaurant.getDisplayName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress() + " " + restaurant.getCity())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .logoName(restaurant.getLogoName())
                .build();
    }

    public double distFromLatLong(double lat1, double lat2, double lon1, double lon2) {
        double rad = 6371;
        return Math.acos(
                (Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2))) + (Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(lon2) - Math.toRadians(lon1))))
                * rad;
    }
}
