package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.FoodItemShoppingCartDTO;
import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.model.enums.PaymentStatus;

import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
	private final ShoppingCartService shoppingCartService;

	@Transactional(rollbackOn = Exception.class, dontRollbackOn = { InvalidRequestException.class })
	public OrderResponse createOrder(Customer customer) {
		// PAYMENT CHECK

		ShoppingCart shoppingCart = shoppingCartService.getActiveCartByCustomer(customer);
		if (shoppingCart == null) {
			throw new InvalidRequestException("Invalid request active shopping cart is not exist!");
		}
		double totalPrice = shoppingCart.getTotalPrice();
		PaymentStatus paymentStatus = getPayment(totalPrice);

		Order order = Order.builder()
				.shoppingCart(shoppingCart)
				.customer(customer)
				.paymentStatus(paymentStatus)
				.orderStatus(OrderStatus.REGULAR)
				.build();
		shoppingCartService.disableShoppingCart(shoppingCart);

		return toResponseDTO(order);
	}

	public PaymentStatus getPayment(double totalPrice) {
		return PaymentStatus.SUCCESSFUL;
	}

	public OrderResponse toResponseDTO(Order order) {
		List<FoodItemShoppingCartDTO> items = order.getShoppingCart().getItems().stream()
				.map(item -> FoodItemShoppingCartDTO.builder()
						.foodItemId(item.getFoodItem().getId())
						.name(item.getFoodItem().getName())
						.quantity(item.getAmount())
						.price(item.getFoodItem().getPrice())
						.build())
				.collect(Collectors.toList());

		return OrderResponse
				.builder()
				.id(order.getId())
				.createdAt(order.getCreateAt())
				.orderStatus(order.getOrderStatus().toString())
				.paymentStatus(order.getPaymentStatus().toString())
				.totalPrice(order.getShoppingCart().getTotalPrice())
				.restaurantName(order.getShoppingCart().getRestaurant().getDisplayName())
				.foodItems(items)
				.build();
	}

}