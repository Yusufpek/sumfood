package com.fivesum.sumfood.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.fivesum.sumfood.model.enums.OrderStatus;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class OrderStatusRequest {
    private OrderStatus orderStatus;
}
