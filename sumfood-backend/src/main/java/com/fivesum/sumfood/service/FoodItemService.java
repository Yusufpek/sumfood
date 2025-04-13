package com.fivesum.sumfood.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    public FoodItem getById(Long id) {
        return foodItemRepository.getById(id);
    }

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public List<FoodItem> getItemsByCategory(Category category) {
        return foodItemRepository.findByCategoriesContaining(category);
    }

    public List<FoodItem> getFoodItemByRestaurant(Restaurant restaurant) {
        return foodItemRepository.findByRestaurant(restaurant);

    }

    @Transactional
    public boolean deleteFoodItem(FoodItem toBeDeleted) {
        try {
            foodItemRepository.delete(toBeDeleted);
            return true;
        } catch (Exception exception) {
            return false;
        }

    }

    @Transactional
    public FoodItem addFoodItem(FoodItemAddRequest request, Restaurant restaurant) {
        FoodItem foodItem = FoodItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .restaurant(restaurant)
                .categories(new ArrayList<Category>())
                .build();
        foodItem.getCategories().add(request.getCategory());
        return foodItemRepository.save(foodItem);
    }

    @Transactional
    public FoodItem updateFoodItem(FoodItemAddRequest request, Long id) {
        Optional<FoodItem> foodItemOptional = foodItemRepository.findById(id);
        if (foodItemOptional.isPresent()) {
            FoodItem foodItem = foodItemOptional.get();
            foodItem.setName(request.getName());
            foodItem.setDescription(request.getDescription());
            foodItem.setPrice(request.getPrice());
            foodItem.setStock(request.getStock());

            return foodItemRepository.save(foodItem);
        }
        return null;
    }

}
