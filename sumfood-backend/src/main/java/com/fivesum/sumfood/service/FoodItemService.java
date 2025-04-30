package com.fivesum.sumfood.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.dto.FoodItemAddRequest;
import com.fivesum.sumfood.dto.FoodItemResponse;
import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.enums.Category;
import com.fivesum.sumfood.repository.FoodItemRepository;
import com.fivesum.sumfood.service.CustomerService;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final CustomerService customerService;

    public FoodItem getById(Long id) {
        return foodItemRepository.getById(id);
    }

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public List<FoodItem> getItemsByCategory(Category category) {
        return foodItemRepository.findByCategoriesContaining(category);
    }

    public List<FoodItemResponse> getFoodItemByRestaurant(Restaurant restaurant) {
        List<FoodItem> foodItems = foodItemRepository.findByRestaurant(restaurant);
        return foodItems.stream().map(item -> toResponseDTO(item)).collect(Collectors.toList());
    }

    public List<FoodItemResponse> getFoodItemsByCustomer(Customer customer, double maxDistance) {
        List<FoodItem> allItems = getAllFoodItems();
        List<FoodItemResponse> foodItemResponses = new ArrayList<>();
        double customerLat = customerService.getDefaultAddressByCustomer(customer).getLatitude();
        double customerLong = customerService.getDefaultAddressByCustomer(customer).getLongitude();
        for (FoodItem item : allItems) {
            double distance = distFromLatLong(customerLat, item.getRestaurant().getLatitude(),
                    customerLong, item.getRestaurant().getLongitude());
            if (distance <= maxDistance) {
                foodItemResponses.add(toResponseDTO(item));
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

    public double distFromLatLong(double lat1, double lat2, double lon1, double lon2) {
        double rad = 6371;
        return Math.acos((Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2))) + (Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(lon2) - Math.toRadians(lon1)))) * rad;
    }

}
