package com.fivesum.sumfood.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    private String addressLine;
    private String addressLine2;
    private String postalCode;
    private boolean isDefault;

    public boolean getIsDefault() {
        return isDefault;
    }
}