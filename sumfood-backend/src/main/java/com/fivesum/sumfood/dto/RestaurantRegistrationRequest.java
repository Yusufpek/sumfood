package com.fivesum.sumfood.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRegistrationRequest extends CustomerRegistrationRequest {
    private String taxIdentificationNumber;
    private String bussinesName;
    private String displayName;
    private String description;
}