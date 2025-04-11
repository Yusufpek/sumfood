package com.fivesum.sumfood.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.enums.Category;
import com.fivesum.sumfood.repository.FoodItemRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public List<FoodItem> getItemsByCategory(Category category) {
        return foodItemRepository.findByCategoriesContaining(category);
    }

}
