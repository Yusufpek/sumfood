package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.FoodItemShoppingCartDTO;
import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.model.enums.PaymentStatus;
import com.fivesum.sumfood.repository.OrderRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
	private final ShoppingCartService shoppingCartService;
	private final OrderRepository orderRepository;
	private final CustomerService customerService;

	@Transactional(rollbackOn = Exception.class, dontRollbackOn = { InvalidRequestException.class })
	public OrderResponse createOrder(Customer customer) {

		ShoppingCart shoppingCart = shoppingCartService.getActiveCartByCustomer(customer);
		if (shoppingCart == null) {
			throw new InvalidRequestException("Invalid request active shopping cart is not exist!");
		}

		// PAYMENT CHECK
		double totalPrice = shoppingCart.getTotalPrice();
		PaymentStatus paymentStatus = getPayment(totalPrice);

		// Order Address
		Address address = customerService.getDefaultAddressByCustomer(customer);
		if (address == null) {
			throw new InvalidRequestException("Default address is not defined!");
		}
		String addresString = address.getAddressLine() + " " + address.getAddressLine2();

		Order order = Order.builder()
				.shoppingCart(shoppingCart)
				.address(addresString)
				.latitude(address.getLatitude())
				.longitude(address.getLongitude())
				.customer(customer)
				.paymentStatus(paymentStatus)
				.orderStatus(OrderStatus.REGULAR)
				.build();
		shoppingCartService.disableShoppingCart(shoppingCart);
		orderRepository.save(order);

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

	@Transactional
	public List<OrderResponse> getOrders(Customer customer) {
		List<Order> orders = orderRepository.findByCustomer(customer);
		List<OrderResponse> orderResponses = new ArrayList<>();

		for (Order order : orders) {
			OrderResponse orderResponse = new OrderResponse();
			orderResponse.setId(order.getId());
			orderResponse.setCreatedAt(order.getCreateAt());
			orderResponse.setOrderStatus(order.getOrderStatus().name());
			orderResponse.setPaymentStatus(order.getPaymentStatus().name());
			orderResponse.setTotalPrice(order.getShoppingCart().getTotalPrice());
			orderResponse.setRestaurantName(order.getShoppingCart().getRestaurant().getName());
			List<FoodItemShoppingCartDTO> foodItemsInCart = new ArrayList<>();
			for (ShoppingCartFoodItemRelation relation : order.getShoppingCart().getItems()) {
				foodItemsInCart.add(new FoodItemShoppingCartDTO(
						relation.getFoodItem().getId(),
						relation.getFoodItem().getName(),
						relation.getAmount(),
						relation.getFoodItem().getPrice()));
			}
			orderResponse.setFoodItems(foodItemsInCart);
			orderResponses.add(orderResponse);
		}

		return orderResponses;
	}

}