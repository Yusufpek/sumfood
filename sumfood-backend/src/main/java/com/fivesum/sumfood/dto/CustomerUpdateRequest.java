package com.fivesum.sumfood.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerUpdateRequest {
    private String password;
    private String name;
    private String lastName;
    private String phoneNumber;
}