package com.fivesum.sumfood.dto.requests;

import com.fivesum.sumfood.model.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
    private Role role;
}