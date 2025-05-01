package com.fivesum.sumfood.dto.requests;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private List<CartItemDto> items;
    
    @Data
    public static class CartItemDto {
        private Long foodItemId;
        private Integer qty;
    }

    private String deliveryAddress;
    private String contactPhone;
}