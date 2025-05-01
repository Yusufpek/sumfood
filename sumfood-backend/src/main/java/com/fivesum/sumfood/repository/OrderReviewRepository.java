package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.OrderReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderReviewRepository extends JpaRepository<OrderReview, Long> {
    Optional<OrderReview> findById(Long id);

    Optional<OrderReview> findByOrderId(Long orderId);

    List<OrderReview> findByOrder_ShoppingCart_Restaurant_Id(Long restaurantId);
}