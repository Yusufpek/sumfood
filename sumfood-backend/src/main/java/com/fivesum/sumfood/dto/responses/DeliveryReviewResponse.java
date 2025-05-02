package com.fivesum.sumfood.dto.responses;

import java.util.Date;

import lombok.*;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@Getter
@Setter
public class DeliveryReviewResponse {
    private Date createdAt;
    private OrderResponse order;
    private String fromAddress;
    private String customerName;
    private double deliveryScore;
}