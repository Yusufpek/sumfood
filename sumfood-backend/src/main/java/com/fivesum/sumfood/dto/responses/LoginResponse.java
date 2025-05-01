package com.fivesum.sumfood.dto.responses;

import lombok.Data;

@Data
public class LoginResponse {
    public LoginResponse(String token) {
        this.token = token;
    }

    private String token;

    private long expiresIn;
}