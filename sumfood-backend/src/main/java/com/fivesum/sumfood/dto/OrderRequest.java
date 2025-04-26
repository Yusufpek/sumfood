package com.fivesum.sumfood.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private List<CartItemDto> items;
}

@Data
class CartItemDto {
    private Long foodItemId;
    private int qty;
}