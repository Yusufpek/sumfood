package com.fivesum.sumfood.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.dto.DeliveryResponse;
import com.fivesum.sumfood.exception.ConflictException;
import com.fivesum.sumfood.model.Courier;
import com.fivesum.sumfood.model.Delivery;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.repository.DeliveryRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class DeliveryService {
    private final OrderService orderService;
    private final DeliveryRepository deliveryRepository;

    public Delivery findByOrderId(Long orderId) {
        return deliveryRepository.findByOrderId(orderId).orElse(null);
    }

    public Delivery getDeliveryById(Long id) {
        return deliveryRepository.getById(id);
    }

    public DeliveryResponse toDeliveryResponse(Delivery delivery) {
        Restaurant restaurant = delivery.getOrder().getShoppingCart().getRestaurant();
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .createdAt(delivery.getCreateAt())
                .order(orderService.toResponseDTO(delivery.getOrder()))
                .fromAddress(restaurant.getAddress())
                .fromLat(restaurant.getLatitude())
                .fromLong(restaurant.getLongitude())
                .courierName(delivery.getCourier().getName())
                .courierVehicleType(delivery.getCourier().getVehicleType())
                .build();
    }

    public DeliveryResponse createDelivery(Order order, Courier courier) {
        if (deliveryRepository.existsByCourierIdAndOrder_OrderStatus(courier.getId(), OrderStatus.ON_THE_WAY)) {
            throw new ConflictException("Courier has a on the way order");
        }
        Delivery delivery = Delivery.builder()
                .order(order)
                .courier(courier)
                .build();
        deliveryRepository.save(delivery);
        orderService.updateStatus(order, OrderStatus.ON_THE_WAY);
        return toDeliveryResponse(delivery);
    }

    public DeliveryResponse updateDeliveryStatus(Delivery delivery, OrderStatus status) {
        orderService.updateStatus(delivery.getOrder(), status);
        delivery = getDeliveryById(delivery.getId());
        return toDeliveryResponse(delivery);
    }

    public List<DeliveryResponse> getDeliveriesByCourier(Courier courier) {
        List<Delivery> deliveries = deliveryRepository.findByCourierId(courier.getId());
        return deliveries.stream().map(delivery -> toDeliveryResponse(delivery)).collect(Collectors.toList());
    }

    public DeliveryResponse getActiveDeliveryByCourier(Courier courier) {
        List<Delivery> deliveries = deliveryRepository.findByCourierIdAndOrder_OrderStatus(courier.getId(),
                OrderStatus.ON_THE_WAY);
        if (deliveries.size() > 0) {
            return toDeliveryResponse(deliveries.get(0));
        }
        return null;
    }
}