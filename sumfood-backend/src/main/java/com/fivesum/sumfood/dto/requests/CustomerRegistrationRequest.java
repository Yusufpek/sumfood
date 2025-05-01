package com.fivesum.sumfood.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRegistrationRequest {
    private String email;
    private String password;
    private String name;
    private String lastName;
    private String phoneNumber;
}