package com.fivesum.sumfood.service;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.dto.ReviewRequest;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.exception.UnauthorizedAccessException;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Delivery;
import com.fivesum.sumfood.model.DeliveryReview;
import com.fivesum.sumfood.model.FoodReview;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.OrderReview;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.repository.DeliveryReviewRepository;
import com.fivesum.sumfood.repository.FoodReviewRepository;
import com.fivesum.sumfood.repository.OrderReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {
    // Repositories
    private final OrderReviewRepository orderReviewRepository;
    private final FoodReviewRepository foodReviewRepository;
    private final DeliveryReviewRepository deliveryReviewRepository;
    // Services
    private final OrderService orderService;
    private final DeliveryService deliveryService;

    public OrderReview getReviewById(Long id) {
        return orderReviewRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Review is not found!"));
    }

    @Transactional(rollbackOn = Exception.class, dontRollbackOn = { InvalidRequestException.class,
            UnauthorizedAccessException.class })
    public boolean createReview(Customer customer, Long orderId, ReviewRequest request) {
        Order order = orderService.findById(orderId);
        if (order == null) {
            throw new InvalidRequestException("Order is not found!");
        }

        if (order.getCustomer() != customer) {
            throw new UnauthorizedAccessException("You are not allowed to review this order.");
        }

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new UnauthorizedAccessException("You can not leave review to not delivered orders.");
        }

        Delivery delivery = deliveryService.findByOrderId(orderId);
        if (delivery == null) {
            throw new InvalidRequestException("Delivery is not found!");
        }

        OrderReview orderReview = OrderReview.builder()
                .customer(customer)
                .order(order)
                .build();
        orderReviewRepository.save(orderReview);

        FoodReview foodReview = FoodReview.builder()
                .orderReview(orderReview)
                .comment(request.getFoodComment())
                .score(request.getFoodScore())
                .restaurant(order.getShoppingCart().getRestaurant())
                .build();
        foodReviewRepository.save(foodReview);

        DeliveryReview deliveryReview = DeliveryReview.builder()
                .orderReview(orderReview)
                .delivery(delivery)
                .score(request.getDeliveryScore())
                .build();
        deliveryReviewRepository.save(deliveryReview);

        return true;
    }
}
