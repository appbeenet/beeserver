package com.bee.exp.web.dto;

import lombok.Data;

@Data
public class LeaderEntryResponse {

    private Long userId;
    private String fullName;
    private String email;
    private String role;

    private Integer xp;
    private Integer level;
}
