package com.fivesum.sumfood.dto;

import java.util.Date;

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
    private String courierName;
    private VehicleType courierVehicleType;
}
