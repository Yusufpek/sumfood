package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.ShoppingCartFoodItemRelation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShoppingCartFoodItemRelationRepository extends JpaRepository<ShoppingCartFoodItemRelation, Long> {
}