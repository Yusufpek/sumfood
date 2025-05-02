package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.Delivery;
import com.fivesum.sumfood.model.enums.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByOrderId(Long orderId);

    List<Delivery> findByCourierId(Long courierId);

    List<Delivery> findByCourierIdAndOrder_OrderStatus(Long courierId, OrderStatus orderStatus);

    boolean existsByCourierIdAndOrder_OrderStatus(Long courierId, OrderStatus orderStatus);
}
