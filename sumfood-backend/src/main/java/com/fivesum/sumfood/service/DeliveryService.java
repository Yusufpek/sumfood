package com.fivesum.sumfood.service;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.dto.DeliveryResponse;
import com.fivesum.sumfood.model.Courier;
import com.fivesum.sumfood.model.Delivery;
import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.repository.DeliveryRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class DeliveryService {
    private final OrderService orderService;
    private final DeliveryRepository deliveryRepository;

    public Delivery getDeliveryById(Long id) {
        return deliveryRepository.getById(id);
    }

    public DeliveryResponse toDeliveryResponse(Delivery delivery) {
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .createdAt(delivery.getCreateAt())
                .order(orderService.toResponseDTO(delivery.getOrder()))
                .courierName(delivery.getCourier().getName())
                .courierVehicleType(delivery.getCourier().getVehicleType())
                .build();
    }

    public DeliveryResponse createDelivery(Order order, Courier courier) {
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
}