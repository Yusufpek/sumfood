package com.fivesum.sumfood.config;

import lombok.*;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.fivesum.sumfood.repository.CourierRepository;
import com.fivesum.sumfood.repository.CustomerRepository;
import com.fivesum.sumfood.repository.RestaurantRepository;

@AllArgsConstructor
@Configuration
public class JWTConfig {
    private final CourierRepository courierRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;

    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            Optional<? extends UserDetails> user;
            user = customerRepository.findByEmail(username);
            if (user.isPresent())
                return user.get();

            user = courierRepository.findByEmail(username);
            if (user.isPresent())
                return user.get();

            user = restaurantRepository.findByEmail(username);
            if (user.isPresent())
                return user.get();

            throw new UsernameNotFoundException("User not found: " + username);
        };
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