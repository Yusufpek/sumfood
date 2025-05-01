package com.fivesum.sumfood.service;

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

import com.fivesum.sumfood.dto.requests.AddressRequest;
import com.fivesum.sumfood.dto.requests.AuthRequest;
import com.fivesum.sumfood.dto.requests.CustomerRegistrationRequest;
import com.fivesum.sumfood.dto.requests.CustomerUpdateRequest;
import com.fivesum.sumfood.dto.responses.CustomerGetResponse;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Address;
import com.fivesum.sumfood.repository.CustomerRepository;
import com.fivesum.sumfood.repository.AddressRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class CustomerService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AddressRepository addressRepository;
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
                .isDefault(request.getIsDefault())
                .build();

        if (address.getIsDefault()) {
            // set all others isDefault=false before saving new one
            addressRepository.updateDefaultAddressFalse(customer.getId());
        }

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

        if (request.getIsDefault()) {
            addressRepository.updateDefaultAddressFalse(customer.getId());
            address.setIsDefault(true);
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
    public Address updateDefaultAddressByCustomer(Customer customer, String addressIdString) {
        Long addressId;
        try {
            addressId = Long.parseLong(addressIdString);
        } catch (Exception e) {
            throw new IllegalArgumentException("Address Id is not valid!");
        }
        Optional<Address> addressOpt = addressRepository.findById(addressId);
        if (!addressOpt.isPresent()) {
            throw new IllegalArgumentException("Address Id is not valid!");
        }
        Address address = addressOpt.get();
        addressRepository.updateDefaultAddressFalse(customer.getId());
        address.setIsDefault(true);
        return addressRepository.save(address);
    }

    public Address getDefaultAddressByCustomer(Customer customer) {
        List<Address> addresses = addressRepository.findByIsDefaultAndCustomerId(true, customer.getId());
        if (addresses.size() == 0) {
            return null;
        } else {
            return addresses.get(0);
        }
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
