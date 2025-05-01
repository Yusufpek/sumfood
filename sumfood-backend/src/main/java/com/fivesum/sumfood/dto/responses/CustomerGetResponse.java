package com.fivesum.sumfood.dto.responses;

import lombok.Data;

@Data
public class CustomerGetResponse {

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    public CustomerGetResponse(String firstName, String lastName, String email, String phoneNumber) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }
}