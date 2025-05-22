package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.ShoppingCart;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {

    @Query(value = "SELECT sc.* " +
            "FROM shopping_carts sc " +
            "JOIN shopping_cart_food_items rel ON sc.id = rel.shopping_cart_id " +
            "JOIN food_items fi ON fi.id = rel.food_item_id " +
            "WHERE fi.is_donated = true " +
            "ORDER BY sc.create_at DESC " +
            "LIMIT 1", nativeQuery = true)
    Optional<ShoppingCart> findTopByDonatedItemOrderByCreatedAtDesc();

    Optional<ShoppingCart> findByCustomerIdAndIsActive(Long customerId, boolean isActive);
}