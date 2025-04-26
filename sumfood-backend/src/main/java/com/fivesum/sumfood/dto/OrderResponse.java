package com.fivesum.sumfood.dto;

import com.fivesum.sumfood.model.enums.OrderState;
import lombok.Data;

@Data
public class OrderResponse {
    private Long orderId;
    private OrderState orderState;
}