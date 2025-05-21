package com.fivesum.sumfood.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.model.FoodItem;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.Wheel;
import com.fivesum.sumfood.model.WheelItemRelation;
import com.fivesum.sumfood.repository.WheelRepository;
import com.fivesum.sumfood.dto.requests.WheelCreateRequest;
import com.fivesum.sumfood.dto.responses.WheelItemResponse;
import com.fivesum.sumfood.dto.responses.WheelResponse;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class WheelService {
    private final WheelRepository wheelRepository;
    private final FoodItemService foodItemService;

    public List<WheelResponse> getWheelsByRestaurant(Restaurant restaurant) {
        List<Wheel> wheels = wheelRepository.findByRestaurant(restaurant).get();
        return wheels.stream().map(item -> toResponseDTO(item)).collect(Collectors.toList());
    }

    public WheelResponse createWheel(Restaurant restaurant, WheelCreateRequest request) {
        Wheel wheel = Wheel.builder()
                .restaurant(restaurant)
                .title(request.getName())
                .description(request.getDescription())
                .price(0)
                .items(new ArrayList<>())
                .build();
        wheelRepository.save(wheel);
        return toResponseDTO(wheel);
    }

    public WheelResponse addItemToWheel(long wheelId, long foodItemId, Restaurant restaurant) {
        Wheel wheel = wheelRepository.findById(wheelId).orElseThrow(() -> new RuntimeException("Wheel not found"));

        if (wheel.getRestaurant() != restaurant) {
            throw new RuntimeException("Unauthorized access to this wheel");
        }

        FoodItem foodItem = foodItemService.getById(foodItemId);
        WheelItemRelation item = WheelItemRelation.builder()
                .wheel(wheel)
                .foodItem(foodItem)
                .build();
        wheel.getItems().add(item);
        wheelRepository.save(wheel);
        updatePrice(wheel);
        return toResponseDTO(wheel);
    }

    public WheelResponse removeItemFromWheel(long wheelId, long foodItemId, Restaurant restaurant) {
        Wheel wheel = wheelRepository.findById(wheelId).orElseThrow(() -> new RuntimeException("Wheel not found"));

        if (wheel.getRestaurant() != restaurant) {
            throw new RuntimeException("Unauthorized access to this wheel");
        }

        WheelItemRelation itemToRemove = wheel.getItems().stream()
                .filter(item -> item.getFoodItem().getId() == foodItemId)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in the wheel"));

        wheel.getItems().remove(itemToRemove);
        wheelRepository.save(wheel);
        updatePrice(wheel);
        return toResponseDTO(wheel);
    }

    public void deleteWheel(long wheelId, Restaurant restaurant) {
        Wheel wheel = wheelRepository.findById(wheelId).orElseThrow(() -> new RuntimeException("Wheel not found"));

        if (wheel.getRestaurant() != restaurant) {
            throw new RuntimeException("Unauthorized access to this wheel");
        }

        wheelRepository.delete(wheel);
        wheelRepository.flush();
    }

    public WheelResponse toResponseDTO(Wheel wheel) {
        List<WheelItemResponse> items = wheel.getItems().stream()
                .map(item -> WheelItemResponse.builder()
                        .foodItemId(item.getFoodItem().getId())
                        .foodItemName(item.getFoodItem().getName())
                        .imageRestaurantName(item.getFoodItem().getRestaurant().getBusinessName())
                        .price(item.getFoodItem().getPrice())
                        .build())
                .collect(Collectors.toList());
        
        return WheelResponse.builder()
                .id(wheel.getId())
                .restaurantId(wheel.getRestaurant().getId())
                .restaurantName(wheel.getRestaurant().getName())
                .name(wheel.getTitle())
                .description(wheel.getDescription())
                .price(wheel.getPrice())
                .items(items)
                .build();
    }

    public void updatePrice(Wheel wheel) {
        double newPrice = wheel.getItems().stream()
                .mapToDouble(i -> i.getFoodItem().getPrice())
                .sum();
        wheel.setPrice(Math.round((newPrice / wheel.getItems().size()) * 100.0) / 100.0);
        wheelRepository.save(wheel);
    }
}
