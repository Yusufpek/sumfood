package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.OrderRequest;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.model.enums.OrderState;
import com.fivesum.sumfood.model.enums.PaymentStatus;
import com.fivesum.sumfood.repository.*;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerRepository customerRepository;
    private final FoodItemRepository foodItemRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Order createOrder(OrderRequest request, String customerEmail) {
        // 1. Get Customer (using get() to extract from Optional)
        Customer customer = customerRepository.findByEmail(customerEmail).get();

        // 2. Process Items, Calculate Total, Determine Restaurant
        List<OrderItem> orderItemsList = new ArrayList<>();
        BigDecimal calculatedTotalPrice = BigDecimal.ZERO;
        Restaurant orderRestaurant = null;

        if (request.getItems() == null || request.getItems().isEmpty()) {
            // For now simply return a new empty Order if no item
            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new IllegalArgumentException("Order request must contain items.");
            }
        }

        for (OrderRequest.CartItemDto itemDto : request.getItems()) {
            FoodItem foodItem = foodItemRepository.findById(itemDto.getFoodItemId()).get();

            // Use the restaurant of the first item
            if (orderRestaurant == null) {
                orderRestaurant = foodItem.getRestaurant();
            }

            // Create an OrderItem
            OrderItem orderItem = OrderItem.builder()
                    .foodItem(foodItem)
                    .quantity(itemDto.getQty())
                    .price(BigDecimal.valueOf(foodItem.getPrice()))
                    .build();
            orderItemsList.add(orderItem);

            calculatedTotalPrice = calculatedTotalPrice.add(
                    BigDecimal.valueOf(foodItem.getPrice()).multiply(BigDecimal.valueOf(itemDto.getQty()))
            );
        }

        // 3. Create Order using enum constants (using PENDING from PaymentStatus and OrderState)
        Order newOrder = Order.builder()
                .customer(customer)
                .restaurant(orderRestaurant)
                .totalPrice(calculatedTotalPrice)
                .orderState(OrderState.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .contactPhone(request.getContactPhone())
                .build();

        // 4. Link OrderItems to the Order
        for (OrderItem item : orderItemsList) {
            item.setOrder(newOrder);
        }
        newOrder.setOrderItems(orderItemsList);

        // 5. Save the Order
        return orderRepository.save(newOrder);
    }
}