package com.fivesum.sumfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fivesum.sumfood.model.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
}
