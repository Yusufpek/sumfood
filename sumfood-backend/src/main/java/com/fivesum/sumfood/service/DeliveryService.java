package com.fivesum.sumfood.service;

import org.springframework.stereotype.Service;

import com.fivesum.sumfood.model.Delivery;
import com.fivesum.sumfood.repository.DeliveryRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class DeliveryService {
    private final DeliveryRepository deliveryRepository;

    public Delivery findByOrderId(Long orderId) {
        return deliveryRepository.findByOrderId(orderId).orElse(null);
    }

}
