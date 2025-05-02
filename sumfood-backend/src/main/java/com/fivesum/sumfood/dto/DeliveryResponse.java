package com.fivesum.sumfood.dto;

import java.util.Date;

import com.fivesum.sumfood.dto.responses.OrderResponse;
import com.fivesum.sumfood.model.enums.VehicleType;

import lombok.*;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DeliveryResponse {
    private Long id;
    private Date createdAt;
    private OrderResponse order;
    private String fromAddress;
    private double fromLat;
    private double fromLong;
    private String courierName;
    private VehicleType courierVehicleType;
}
