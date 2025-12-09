package com.bee.exp.web.dto;

import com.bee.exp.domain.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private Role role;
}