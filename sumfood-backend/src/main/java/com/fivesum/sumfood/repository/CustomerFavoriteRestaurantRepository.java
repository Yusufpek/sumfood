package com.fivesum.sumfood.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fivesum.sumfood.model.CustomerFavoriteRestaurant;

@Repository
public interface CustomerFavoriteRestaurantRepository extends JpaRepository<CustomerFavoriteRestaurant, Long> {
    List<CustomerFavoriteRestaurant> findByCustomerId(Long customerId);

    Optional<CustomerFavoriteRestaurant> findByCustomerIdAndRestaurantId(Long customerId, Long restaurantId);
}
