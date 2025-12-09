package com.bee.exp.web.dto;

import com.bee.exp.domain.TaskDifficulty;
import lombok.Data;

@Data
public class TaskCreateRequest {
    private String title;
    private String description;
    private TaskDifficulty difficulty;
    private Integer price;
}
