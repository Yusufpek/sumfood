package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.ShoppingCartCreateRequest;
import com.fivesum.sumfood.dto.ShoppingCartUpdateRequest;
import com.fivesum.sumfood.exception.ConflictException;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.exception.UnauthorizedAccessException;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.repository.*;
import com.fivesum.sumfood.responses.ShoppingCartItemResponse;
import com.fivesum.sumfood.responses.ShoppingCartResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
                .items(new ArrayList<>())
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

    @Transactional(rollbackOn = Exception.class, dontRollbackOn = { InvalidRequestException.class,
            UnauthorizedAccessException.class, ConflictException.class })
    public ShoppingCart updateShoppingCart(ShoppingCartUpdateRequest request, Customer customer) {
        double calculatedTotalPrice = 0;

        if (request.getFoodItemId() == null || request.getShoppingCartId() == null) {
            throw new InvalidRequestException("Invalid request: missing IDs.");
        }

        ShoppingCart shoppingCart = this.getShoppingCartById(request.getShoppingCartId());

        if (shoppingCart.getCustomer() != customer) {
            throw new UnauthorizedAccessException("You are not allowed to update this shopping cart.");
        }

        FoodItem foodItem = foodItemService.getById(request.getFoodItemId());
        calculatedTotalPrice = foodItem.getPrice() * request.getFoodItemCount();

        if (foodItem.getRestaurant() != shoppingCart.getRestaurant()) {
            throw new ConflictException("Cannot add items from different restaurants to the same cart.");
        }

        ShoppingCartFoodItemRelation updateItem = getShoppingItemInCart(shoppingCart.getId(), foodItem.getId());
        if (updateItem == null) {
            if (request.getFoodItemCount() <= 0) {
                throw new ConflictException("Cannot remove item that is not existing in the cart.");
            }
            // create new relation
            ShoppingCartFoodItemRelation shoppingCardItem = ShoppingCartFoodItemRelation.builder()
                    .shoppingCart(shoppingCart)
                    .foodItem(foodItem)
                    .amount(request.getFoodItemCount())
                    .build();

            shoppingCartItemRepository.save(shoppingCardItem);

            calculatedTotalPrice = shoppingCart.getTotalPrice() + request.getFoodItemCount() * foodItem.getPrice();
        } else {
            // update relation
            if (request.getFoodItemCount() + updateItem.getAmount() < 0) {
                throw new ConflictException("Cannot remove more items than exist in the cart.");
            } else if (request.getFoodItemCount() + updateItem.getAmount() == 0) {
                calculatedTotalPrice = shoppingCart.getTotalPrice()
                        - updateItem.getAmount() * updateItem.getFoodItem().getPrice();
                shoppingCartItemRepository.delete(updateItem);
            } else {
                updateItem.setAmount(updateItem.getAmount() + request.getFoodItemCount());
                calculatedTotalPrice = shoppingCart.getTotalPrice() + foodItem.getPrice() * request.getFoodItemCount();
                shoppingCartItemRepository.save(updateItem);
            }
        }

        shoppingCart.setTotalPrice(calculatedTotalPrice);
        shoppingCartRepository.save(shoppingCart);

        return shoppingCart;
    }

    public ShoppingCart getShoppingCartById(Long id) {
        return shoppingCartRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Shopping cart not found"));
    }

    public ShoppingCartFoodItemRelation getShoppingItemInCart(Long shoppingCartId, Long foodItemId) {
        return shoppingCartItemRepository.findByShoppingCartIdAndFoodItemId(shoppingCartId, foodItemId)
                .orElse(null);
    }

    public ShoppingCartResponse mapToDTO(ShoppingCart cart) {
        List<ShoppingCartItemResponse> items = cart.getItems().stream()
                .map(item -> ShoppingCartItemResponse.builder()
                        .foodItemId(item.getFoodItem().getId())
                        .foodItemName(item.getFoodItem().getName()) // assuming you have name field
                        .amount(item.getAmount())
                        .build())
                .collect(Collectors.toList());

        return ShoppingCartResponse.builder()
                .id(cart.getId())
                .totalPrice(cart.getTotalPrice())
                .restaurantName(cart.getRestaurant().getDisplayName())
                .items(items)
                .build();

    }
}