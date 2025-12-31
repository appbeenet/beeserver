package com.bee.exp.web.dto;

import com.bee.exp.domain.UserRole;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private UserRole role;
    private Long companyId;
}
