package com.bee.exp.web.dto;

import com.bee.exp.domain.SubmissionStatus;
import lombok.Data;

import java.time.Instant;

@Data
public class SubmissionResponse {

    private Long id;
    private Long taskId;
    private String taskTitle;

    private Long engineerId;
    private String engineerName;
    private String engineerEmail;

    private String notes;
    private String attachmentUrl;

    private SubmissionStatus status;
    private Integer xpAwarded;

    private Instant submittedAt;
    private Instant approvedAt;
}
