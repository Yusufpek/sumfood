package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.requests.ShoppingCartCreateRequest;
import com.fivesum.sumfood.dto.requests.ShoppingCartUpdateRequest;
import com.fivesum.sumfood.dto.requests.ShoppingCartWheelRequest;
import com.fivesum.sumfood.dto.responses.ShoppingCartItemResponse;
import com.fivesum.sumfood.dto.responses.ShoppingCartResponse;
import com.fivesum.sumfood.dto.responses.ShoppingCartWheelResponse;
import com.fivesum.sumfood.exception.ConflictException;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.exception.UnauthorizedAccessException;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.repository.*;

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
    private final WheelRepository wheelRepository;
    private final ShoppingCartWheelRelationRepository shoppingCartWheelRepository;
    private final ShoppingCartFoodItemRelationRepository shoppingCartItemRepository;
    private final RestaurantService restaurantService;
    private final FoodItemService foodItemService;

    @Transactional(rollbackOn = Exception.class, dontRollbackOn = { InvalidRequestException.class,
            ConflictException.class })
    public ShoppingCartResponse createShoppingCart(ShoppingCartCreateRequest request, Customer customer) {
        // 2. Process Items, Calculate Total, Determine Restaurant
        double calculatedTotalPrice = 0;
        Restaurant orderRestaurant = null;

        if (request.getFoodItemId() == null || request.getRestaurantId() == null) {
            throw new InvalidRequestException("Invalid request!");
        }

        if (getActiveCartByCustomer(customer) != null) {
            throw new ConflictException("Customer has active shopping cart already.");
        }
        orderRestaurant = restaurantService.getRestaurantById(request.getRestaurantId());

        FoodItem foodItem = foodItemService.getById(request.getFoodItemId());
        if (foodItem.getStock() <= 0) {
            throw new InvalidRequestException("Invalid request, food item has no stock!");
        }
        if (!foodItem.isDonated()) {
            calculatedTotalPrice = foodItem.getPrice() * request.getFoodItemCount();
        }

        ShoppingCart shoppingCart = ShoppingCart.builder()
                .customer(customer)
                .restaurant(orderRestaurant)
                .totalPrice(calculatedTotalPrice)
                .isActive(true)
                .items(new ArrayList<>())
                .build();
        shoppingCartRepository.save(shoppingCart);

        System.out.println("_________________________");
        System.out.println("Shopping cart created: " + shoppingCart);

        if (request.getFoodItemCount() > 0) {
            ShoppingCartFoodItemRelation shoppingCartItem = ShoppingCartFoodItemRelation.builder()
                    .shoppingCart(shoppingCart)
                    .foodItem(foodItem)
                    .amount(request.getFoodItemCount())
                    .build();
            
            shoppingCartItemRepository.save(shoppingCartItem);

            System.out.println("_________________________");
            System.out.println("Shopping cart item created: " + shoppingCartItem);

            List<ShoppingCartFoodItemRelation> items = shoppingCart.getItems();
            items.add(shoppingCartItem);
            shoppingCart.setItems(items);
            shoppingCartRepository.save(shoppingCart);

            System.out.println("================");
            System.out.println(shoppingCart.getItems());
        }

        return mapToDTO(shoppingCart);
    }

    @Transactional(rollbackOn = Exception.class, dontRollbackOn = { InvalidRequestException.class,
            UnauthorizedAccessException.class, ConflictException.class })
    public ShoppingCartResponse updateShoppingCart(ShoppingCartUpdateRequest request, Customer customer) {
        double calculatedTotalPrice = 0;

        if (request.getFoodItemId() == null || request.getShoppingCartId() == null) {
            throw new InvalidRequestException("Invalid request: missing IDs.");
        }

        ShoppingCart shoppingCart = this.getShoppingCartById(request.getShoppingCartId());
        calculatedTotalPrice = shoppingCart.getTotalPrice();

        if (shoppingCart.getCustomer() != customer) {
            throw new UnauthorizedAccessException("You are not allowed to update this shopping cart.");
        }

        FoodItem foodItem = foodItemService.getById(request.getFoodItemId());
        if (foodItem.getStock() <= 0 && request.getFoodItemCount() > 0) {
            throw new InvalidRequestException("Invalid request, food item has no stock!");
        }

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
            if (!foodItem.isDonated())
                calculatedTotalPrice = shoppingCart.getTotalPrice() + request.getFoodItemCount() * foodItem.getPrice();
        } else {
            // update relation
            if (request.getFoodItemCount() + updateItem.getAmount() < 0) {
                throw new ConflictException("Cannot remove more items than exist in the cart.");
            } else if (request.getFoodItemCount() + updateItem.getAmount() == 0) {
                if (!foodItem.isDonated())
                    calculatedTotalPrice = shoppingCart.getTotalPrice()
                            - updateItem.getAmount() * updateItem.getFoodItem().getPrice();

                List<ShoppingCartFoodItemRelation> items = shoppingCart.getItems();
                items.remove(updateItem);
                shoppingCartItemRepository.delete(updateItem);
                if (!foodItem.isDonated() && calculatedTotalPrice == 0) {
                    shoppingCartRepository.delete(shoppingCart);
                }
            } else {
                updateItem.setAmount(updateItem.getAmount() + request.getFoodItemCount());
                shoppingCartItemRepository.save(updateItem);
                if (!foodItem.isDonated())
                    calculatedTotalPrice = shoppingCart.getTotalPrice()
                            + foodItem.getPrice() * request.getFoodItemCount();
            }
        }
        if (foodItem.isDonated() || calculatedTotalPrice != 0) {
            shoppingCart.setTotalPrice(calculatedTotalPrice);
            shoppingCartRepository.save(shoppingCart);
            return mapToDTO(shoppingCart);
        }

        return null;
    }

    @Transactional
    public boolean deleteShoppingCart(Customer customer, Long cartId) {
        ShoppingCart cart = getShoppingCartById(cartId);
        if (cart.getCustomer() == customer) {
            shoppingCartRepository.delete(cart);
            return true;
        }
        return false;
    }

    @Transactional
    public ShoppingCartResponse addWheelToShoppingCart(ShoppingCartWheelRequest request, Customer customer) {
        double calculatedTotalPrice = 0;

        if (request.getFoodItemId() == null || request.getShoppingCartId() == null || request.getWheelId() == null) {
            throw new InvalidRequestException("Invalid request: missing IDs.");
        }

        ShoppingCart shoppingCart = this.getShoppingCartById(request.getShoppingCartId());

        if (shoppingCart.getCustomer() != customer) {
            throw new UnauthorizedAccessException("You are not allowed to update this shopping cart.");
        }

        Wheel wheel = wheelRepository.findById(request.getWheelId())
                .orElseThrow(() -> new InvalidRequestException("Wheel not found"));
        if (wheel.getRestaurant() != shoppingCart.getRestaurant()) {
            throw new ConflictException("Cannot add items from different restaurants to the same cart.");
        }

        FoodItem foodItem = foodItemService.getById(request.getFoodItemId());

        calculatedTotalPrice = shoppingCart.getTotalPrice() + wheel.getPrice();
        shoppingCart.setTotalPrice(calculatedTotalPrice);
        shoppingCartRepository.save(shoppingCart);

        ShoppingCartWheelRelation shoppingCartWheel = ShoppingCartWheelRelation.builder()
                .shoppingCart(shoppingCart)
                .wheel(wheel)
                .foodItem(foodItem)
                .build();
        shoppingCartWheelRepository.save(shoppingCartWheel);

        return mapToDTO(shoppingCart);
    }

    public ShoppingCart getShoppingCartById(Long id) {
        return shoppingCartRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Shopping cart not found"));
    }

    public ShoppingCart getActiveCartByCustomer(Customer customer) {
        return shoppingCartRepository.findByCustomerIdAndIsActive(customer.getId(), true).orElse(null);
    }

    public ShoppingCartFoodItemRelation getShoppingItemInCart(Long shoppingCartId, Long foodItemId) {
        return shoppingCartItemRepository.findByShoppingCartIdAndFoodItemId(shoppingCartId, foodItemId)
                .orElse(null);
    }

    public boolean disableShoppingCart(ShoppingCart cart) {
        try {

            cart.setActive(false);
            shoppingCartRepository.save(cart);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public ShoppingCartResponse mapToDTO(ShoppingCart cart) {
        List<ShoppingCartItemResponse> items = new ArrayList<>();
        if(cart.getItems() != null) {
            items = cart.getItems().stream()
                    .map(item -> ShoppingCartItemResponse.builder()
                            .foodItemId(item.getFoodItem().getId())
                            .foodItemName(item.getFoodItem().getName())
                            .price(item.getFoodItem().getPrice())
                            .amount(item.getAmount())
                            .imageRestaurantName(item.getFoodItem().getRestaurant().getBusinessName())
                            .build())
                    .collect(Collectors.toList());
        }
            
        List<ShoppingCartWheelResponse> wheels = new ArrayList<>();
        if(cart.getWheels() != null) {
            wheels = cart.getWheels().stream()
                    .map(item -> ShoppingCartWheelResponse.builder()
                            .wheelId(item.getWheel().getId())
                            .price(item.getWheel().getPrice())
                            .foodItemId(item.getFoodItem().getId())
                            .foodItemName(item.getFoodItem().getName())
                            .imageRestaurantName(item.getFoodItem().getRestaurant().getBusinessName())
                            .build())
                    .collect(Collectors.toList());
        }

        return ShoppingCartResponse.builder()
                .id(cart.getId())
                .totalPrice(cart.getTotalPrice())
                .restaurantId(cart.getRestaurant().getId())
                .restaurantName(cart.getRestaurant().getDisplayName())
                .items(items)
                .wheels(wheels)
                .build();

    }
}