package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.FoodReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodReviewRepository extends JpaRepository<FoodReview, Long> {
    // Implement crud operations
    FoodReview findByOrderReviewId(Long orderReviewId);

    FoodReview findByRestaurantId(Long restaurantId);

    FoodReview findByOrderReviewCustomerId(Long customerId);

}