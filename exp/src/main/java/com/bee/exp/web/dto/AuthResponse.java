package com.bee.exp.web.dto;

import com.bee.exp.domain.Role;
import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private Long userId;
    private Role role;
    private String fullName;
}
