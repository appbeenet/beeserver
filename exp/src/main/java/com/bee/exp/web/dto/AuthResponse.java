package com.bee.exp.web.dto;

import com.bee.exp.domain.UserRole;
import lombok.Data;

@Data
public class AuthResponse {
    private Long userId;
    private String token;
    private UserRole role;        // 🔹 BURADA UserRole
    private String fullName;
}
