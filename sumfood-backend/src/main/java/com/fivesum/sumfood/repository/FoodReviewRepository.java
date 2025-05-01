package com.fivesum.sumfood.repository;

import com.fivesum.sumfood.model.FoodReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodReviewRepository extends JpaRepository<FoodReview, Long> {
    // Implement crud operations
    FoodReview findByFoodId(Long foodId);
    FoodReview findByFoodIdAndCustomerId(Long foodId, Long customerId);
    FoodReview findByCustomerId(Long customerId);

}