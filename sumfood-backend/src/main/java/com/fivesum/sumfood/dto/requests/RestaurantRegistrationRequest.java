package com.fivesum.sumfood.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRegistrationRequest extends CustomerRegistrationRequest {
    private String taxIdentificationNumber;
    private String businessName;
    private String displayName;
    private String description;
    private String city;
    private String address;
}