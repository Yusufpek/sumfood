package com.fivesum.sumfood.service;

import com.fivesum.sumfood.dto.FoodItemShoppingCartDTO;
import com.fivesum.sumfood.dto.OrderResponse;
import com.fivesum.sumfood.exception.InvalidRequestException;
import com.fivesum.sumfood.model.*;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.model.enums.OrderType;
import com.fivesum.sumfood.model.enums.PaymentStatus;
import com.fivesum.sumfood.repository.OrderRepository;

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
				.orderStatus(OrderStatus.PENDING)
				.orderType(OrderType.REGULAR)
				.build();
		shoppingCartService.disableShoppingCart(shoppingCart);
		orderRepository.save(order);

		return toResponseDTO(order);
	}

	public PaymentStatus getPayment(double totalPrice) {
		return PaymentStatus.SUCCESSFUL;
	}

	@Transactional
	public List<OrderResponse> getOrdersByCustomer(Customer customer) {
		List<Order> orders = orderRepository.findByCustomer(customer);
		return orders.stream().map(item -> toResponseDTO(item)).collect(Collectors.toList());
	}

	@Transactional(rollbackOn = Exception.class, dontRollbackOn = { InvalidRequestException.class })
	public List<OrderResponse> getOrdersByCustomerByStatus(Customer customer, String status) {
		OrderStatus orderStatus;
		try {
			orderStatus = OrderStatus.valueOf(status);
		} catch (Exception e) {
			throw new InvalidRequestException("Status " + status + " is not valid!");
		}
		List<Order> orders = orderRepository.findByCustomerAndByOrderStatus(customer, orderStatus);
		return orders.stream().map(item -> toResponseDTO(item)).collect(Collectors.toList());
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
				.orderType(order.getOrderType().toString())
				.paymentStatus(order.getPaymentStatus().toString())
				.totalPrice(order.getShoppingCart().getTotalPrice())
				.restaurantName(order.getShoppingCart().getRestaurant().getDisplayName())
				.foodItems(items)
				.build();
	}
}