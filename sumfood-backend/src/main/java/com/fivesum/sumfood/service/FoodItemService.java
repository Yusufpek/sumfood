package com.fivesum.sumfood.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.dto.requests.FoodItemAddRequest;
import com.fivesum.sumfood.dto.responses.FoodItemResponse;
import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.enums.Category;
import com.fivesum.sumfood.repository.FoodItemRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantService restaurantService;

    public FoodItem getById(Long id) {
        return foodItemRepository.getById(id);
    }

    // get all food items that are not donated
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findByIsDonated(false);
    }

    public List<FoodItem> getItemsByCategory(Category category) {
        return foodItemRepository.findByCategoriesContaining(category);
    }

    public List<FoodItemResponse> getFoodItemByRestaurant(Restaurant restaurant) {
        List<FoodItem> foodItems = foodItemRepository.findByRestaurantAndIsDonated(restaurant, false);
        return foodItems.stream().map(item -> toResponseDTO(item)).collect(Collectors.toList());
    }

    public List<FoodItemResponse> getDonatedFoodItemByRestaurant(Restaurant restaurant) {
        List<FoodItem> foodItems = foodItemRepository.findByRestaurantAndIsDonated(restaurant, true);
        return foodItems.stream()
        .filter(item -> item.getStock() > 0)
        .map(item -> toResponseDTO(item))
        .collect(Collectors.toList());
    }

    public List<FoodItemResponse> getFoodItemsByCustomer(Customer customer, double maxDistance) {
        List<Restaurant> restaurants = restaurantService.getRestaurantByCustomerRaw(customer, maxDistance);
        List<FoodItemResponse> foodItemResponses = new ArrayList<>();
        for (Restaurant restaurant : restaurants) {
            List<FoodItem> foodItems = foodItemRepository.findByRestaurant(restaurant);
            for (FoodItem foodItem : foodItems) {
                foodItemResponses.add(toResponseDTO(foodItem));
            }
        }
        return foodItemResponses;
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
    public FoodItemResponse addFoodItem(FoodItemAddRequest request, Restaurant restaurant) {
        FoodItem foodItem = FoodItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .restaurant(restaurant)
                .imageName(request.getImagePath())
                .categories(new ArrayList<Category>())
                .build();
        foodItem.getCategories().add(request.getCategory());
        foodItemRepository.save(foodItem);
        return toResponseDTO(foodItem);
    }

    @Transactional
    public FoodItemResponse decreaseStock(FoodItem foodItem) {
        foodItem.setStock(foodItem.getStock() - 1);
        foodItemRepository.save(foodItem);
        return toResponseDTO(foodItem);
    }

    @Transactional
    public FoodItemResponse addDonatedFoodItem(FoodItem foodItem, int amount) {
        Optional<FoodItem> existingDonationItem = foodItemRepository.findByIsDonatedAndImageName(true,
                foodItem.getImageName());
        FoodItem item;
        if (existingDonationItem.isPresent()) {
            item = existingDonationItem.get();
            item.setStock(item.getStock() + amount);
        } else {
            item = FoodItem.builder()
                    .name(foodItem.getName())
                    .description(foodItem.getDescription())
                    .price(0)
                    .stock(amount)
                    .isDonated(true)
                    .restaurant(foodItem.getRestaurant())
                    .imageName(foodItem.getImageName())
                    .categories(new ArrayList<Category>())
                    .build();
            for (Category category : foodItem.getCategories()) {
                item.getCategories().add(category);
            }
        }
        foodItemRepository.save(item);
        decreaseStock(foodItem);
        return toResponseDTO(item);
    }

    @Transactional
    public FoodItemResponse updateFoodItem(FoodItemAddRequest request, Long id) {
        Optional<FoodItem> foodItemOptional = foodItemRepository.findById(id);
        if (foodItemOptional.isPresent()) {
            FoodItem foodItem = foodItemOptional.get();
            foodItem.setName(request.getName());
            foodItem.setDescription(request.getDescription());
            foodItem.setPrice(request.getPrice());
            foodItem.setStock(request.getStock());
            if (request.getCategory() != null) {
                foodItem.setCategories(new ArrayList<Category>());
                foodItem.getCategories().add(request.getCategory());
            }

            if (request.getImagePath() != null && !request.getImagePath().isEmpty()) {
                foodItem.setImageName(request.getImagePath());
            }

            foodItemRepository.save(foodItem);
            return toResponseDTO(foodItem);
        }
        return null;
    }

    public FoodItemResponse toResponseDTO(FoodItem item) {
        Restaurant itemRestaurant = item.getRestaurant();
        return FoodItemResponse.builder()
                .foodItemId(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .imageName(item.getImageName())
                .price(item.getPrice())
                .stock(item.getStock())
                .restaurantId(itemRestaurant.getId())
                .restaurantName(itemRestaurant.getBusinessName())
                .categories(item.getCategories())
                .build();
    }
}
