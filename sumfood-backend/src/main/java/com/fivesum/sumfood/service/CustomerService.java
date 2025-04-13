package com.fivesum.sumfood.service;

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
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Address;
import com.fivesum.sumfood.repository.CustomerRepository;
import com.fivesum.sumfood.repository.AddressRepository;
import com.fivesum.sumfood.responses.CustomerGetResponse;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class CustomerService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AddressRepository addressRepository;

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
            customer.getPhoneNumber()
        );
    }

    @Transactional
    public Address addAddress(AddressRequest request, Customer customer) {
        Address address = Address.builder()
                .customer(customer)
                .addressLine(request.getAddressLine())
                .addressLine2(request.getAddressLine2())
                .postalCode(request.getPostalCode())
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
        if (request.getAddressLine() != null) {
            address.setAddressLine(request.getAddressLine());
        }
        if (request.getAddressLine2() != null) {
            address.setAddressLine2(request.getAddressLine2());
        }
        if (request.getPostalCode() != null) {
            address.setPostalCode(request.getPostalCode());
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
