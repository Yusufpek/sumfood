package com.fivesum.sumfood.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.enums.Category;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByCategoriesContaining(Category category);

}