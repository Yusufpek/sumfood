package com.fivesum.sumfood.dto.responses;

import java.util.Date;

import lombok.*;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@Getter
@Setter
public class ReviewResponse {
    private Date createdAt;
    private Long orderId;
    private String customerName;
    private double foodReviewScore;
    private String foodReviewComment;
    private double deliveryScore;
}