package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.ShoppingCart;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {

    Optional<ShoppingCart> findByCustomerIdAndIsActive(Long customerId, boolean isActive);
}