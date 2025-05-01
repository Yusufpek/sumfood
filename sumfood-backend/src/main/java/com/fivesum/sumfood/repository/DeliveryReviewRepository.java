package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.DeliveryReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryReviewRepository extends JpaRepository<DeliveryReview, Long> {
    Optional<DeliveryReview> findByDeliveryId(Long orderId);

    List<DeliveryReview> findByDelivery_Courier_Id(Long courierId);

    Optional<DeliveryReview> findByOrderReviewId(Long orderId);
}