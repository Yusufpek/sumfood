package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.ShoppingCartCreateRequest;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.repository.*;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ShoppingCartService {

    private final ShoppingCartRepository shoppingCartRepository;
    private final ShoppingCartFoodItemRelationRepository shoppingCartItemRepository;
    private final RestaurantService restaurantService;
    private final FoodItemService foodItemService;

    @Transactional
    public ShoppingCart createShoppingCart(ShoppingCartCreateRequest request, Customer customer) {
        // 2. Process Items, Calculate Total, Determine Restaurant
        double calculatedTotalPrice = 0;
        Restaurant orderRestaurant = null;

        if (request.getFoodItemId() == null || request.getRestaurantId() == null) {
            throw new IllegalArgumentException("Invalid request!");
        }
        orderRestaurant = restaurantService.getRestaurantById(request.getRestaurantId());

        FoodItem foodItem = foodItemService.getById(request.getFoodItemId());
        calculatedTotalPrice = foodItem.getPrice() * request.getFoodItemCount();

        ShoppingCart shoppingCart = ShoppingCart.builder()
                .customer(customer)
                .restaurant(orderRestaurant)
                .totalPrice(calculatedTotalPrice)
                .build();

        shoppingCartRepository.save(shoppingCart);

        ShoppingCartFoodItemRelation shoppingCardItem = ShoppingCartFoodItemRelation.builder()
                .shoppingCart(shoppingCart)
                .foodItem(foodItem)
                .amount(request.getFoodItemCount())
                .build();

        shoppingCartItemRepository.save(shoppingCardItem);

        return shoppingCart;
    }
}