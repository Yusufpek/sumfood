package com.fivesum.sumfood.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fivesum.sumfood.model.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    void deleteById(Long id);
    Optional<Address> findById(Long id);
}