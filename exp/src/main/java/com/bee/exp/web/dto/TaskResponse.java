package com.bee.exp.web.dto;

import com.bee.exp.domain.TaskDifficulty;
import com.bee.exp.domain.TaskStatus;
import lombok.Data;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskDifficulty difficulty;
    private Integer price;
    private TaskStatus status;
    private String companyName;
    private String assignedEngineerName;
}
