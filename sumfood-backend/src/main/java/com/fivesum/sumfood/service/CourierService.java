package com.fivesum.sumfood.service;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fivesum.sumfood.dto.CourierRegistrationRequest;
import com.fivesum.sumfood.model.Courier;
import com.fivesum.sumfood.repository.CourierRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class CourierService implements UserDetailsService {

    private final CourierRepository courierRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Courier registerCourier(CourierRegistrationRequest request) {
        Courier courier = Courier.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .vehicleType(request.getVehicleType())
                .driverLicenceId(request.getDriverLicenceId())
                .birthDate(request.getBirthDate())
                .totalScore(0)
                .isValidated(false)
                .build();

        return courierRepository.save(courier);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return courierRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public Optional<Courier> findByEmail(String email) {
        return courierRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return courierRepository.existsByEmail(email);
    }
}
