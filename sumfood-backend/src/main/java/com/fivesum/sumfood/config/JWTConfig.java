package com.fivesum.sumfood.config;

import lombok.*;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.fivesum.sumfood.repository.CourierRepository;
import com.fivesum.sumfood.repository.CustomerRepository;
import com.fivesum.sumfood.repository.RestaurantRepository;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.RestaurantService;
import com.fivesum.sumfood.service.CourierService;

@AllArgsConstructor
@Configuration
public class JWTConfig {
    private final CourierRepository courierRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;

    @Bean
    CustomerService customerService() {
        return username -> customerRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    RestaurantService restaurantService() {
        return username -> restaurantRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    CourierService courierService() {
        return username -> courierRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }
}