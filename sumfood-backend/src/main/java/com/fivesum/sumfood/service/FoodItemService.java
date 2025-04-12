package com.fivesum.sumfood.service;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.dto.FoodItemAddRequest;
import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.Restaurant;
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

    @Transactional
    public FoodItem addFoodItem(FoodItemAddRequest request, Restaurant restaurant) {
        FoodItem foodItem = FoodItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .restaurant(restaurant)
                .build();

        return foodItemRepository.save(foodItem);
    }

}
