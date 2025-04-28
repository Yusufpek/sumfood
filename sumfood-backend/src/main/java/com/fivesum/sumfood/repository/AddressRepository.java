package com.fivesum.sumfood.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fivesum.sumfood.model.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    void deleteById(Long id);

    Optional<Address> findById(Long id);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.customer.id = :customerId")
    void updateDefaultAddressFalse(@Param("customerId") Long customerId);

    Optional<Address> getDefaultAddressByCustomerId(Long customerId);
}