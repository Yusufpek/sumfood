package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.ShoppingCartFoodItemRelation;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShoppingCartFoodItemRelationRepository extends JpaRepository<ShoppingCartFoodItemRelation, Long> {
    Optional<ShoppingCartFoodItemRelation> findByShoppingCartIdAndFoodItemId(Long shoppingId, Long footItemId);
}