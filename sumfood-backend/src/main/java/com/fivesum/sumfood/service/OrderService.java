package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.OrderRequest;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.model.enums.PaymentStatus;
import com.fivesum.sumfood.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import javax.transaction.Transactional;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final CustomerRepository customerRepository;
    private final FoodItemRepository foodItemRepository;
    private final ShoppingCartRepository shoppingCartRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Order createOrder(OrderRequest request, String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail).orElseThrow();
        ShoppingCart cart = new ShoppingCart();
        cart.setCustomer(customer);
        cart.setItems(new ArrayList<>());

        for (var itemDto : request.getItems()) {
            FoodItem foodItem = foodItemRepository.findById(itemDto.getFoodItemId()).orElseThrow();
            ShoppingCartFoodItemRelation rel = new ShoppingCartFoodItemRelation();
            rel.setFoodItem(foodItem);
            rel.setQuantity(itemDto.getQty());
            rel.setShoppingCart(cart);
            cart.getItems().add(rel);
        }
        shoppingCartRepository.save(cart);

        Order order = Order.builder()
                .customer(customer)
                .shoppingCart(cart)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        return orderRepository.save(order);
    }
}