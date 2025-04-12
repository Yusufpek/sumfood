package com.fivesum.sumfood.responses;

import lombok.Data;

@Data
public class LoginResponse {
    public LoginResponse(String token) {
        this.token = token;
    }

    private String token;

    private long expiresIn;
}