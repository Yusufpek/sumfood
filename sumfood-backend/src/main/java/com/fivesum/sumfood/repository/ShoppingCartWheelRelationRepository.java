package com.fivesum.sumfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fivesum.sumfood.model.ShoppingCartWheelRelation;

public interface ShoppingCartWheelRelationRepository extends JpaRepository<ShoppingCartWheelRelation, Long> {
    
}
