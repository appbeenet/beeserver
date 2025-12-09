package com.bee.exp.web.dto;

import lombok.Data;

@Data
public class TaskSubmitRequest {
    private String notes;
    private String attachmentUrl;
}
