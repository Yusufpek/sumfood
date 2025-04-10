package com.fivesum.sumfood.service;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fivesum.sumfood.dto.RestaurantRegistrationRequest;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.repository.RestaurantRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class RestaurantService implements UserDetailsService {

    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Restaurant registerCourier(RestaurantRegistrationRequest request) {
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
                .isValidated(false)
                .build();

        return restaurantRepository.save(restaurant);
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
}
