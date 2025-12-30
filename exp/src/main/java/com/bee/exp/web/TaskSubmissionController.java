package com.bee.exp.web;

import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.User;
import com.bee.exp.service.TaskService;
import com.bee.exp.web.dto.SubmissionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskSubmissionController {

    private final TaskService taskService;

    /**
     * Firma / mentor için:
     * Onay bekleyen (PENDING) submission listesi.
     */
    @GetMapping("/pending")
    public List<SubmissionResponse> listPending(
            @AuthenticationPrincipal User currentUser
    ) {
        List<TaskSubmission> submissions = taskService.listPendingSubmissions(currentUser);
        return submissions.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Tek bir submission'ı onayla.
     * Onayladığında engineer XP alır.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<SubmissionResponse> approve(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        TaskSubmission s = taskService.approveSubmission(id, currentUser);
        return ResponseEntity.ok(toResponse(s));
    }

    private SubmissionResponse toResponse(TaskSubmission s) {
        SubmissionResponse dto = new SubmissionResponse();
        dto.setId(s.getId());

        if (s.getTask() != null) {
            dto.setTaskId(s.getTask().getId());
            dto.setTaskTitle(s.getTask().getTitle());
        }

        if (s.getEngineer() != null) {
            dto.setEngineerId(s.getEngineer().getId());
            dto.setEngineerName(s.getEngineer().getFullName());
            dto.setEngineerEmail(s.getEngineer().getEmail());
        }

        dto.setNotes(s.getNotes());
        dto.setAttachmentUrl(s.getAttachmentUrl());
        dto.setStatus(s.getStatus());
        dto.setXpAwarded(s.getXpAwarded());
        dto.setSubmittedAt(s.getSubmittedAt());
        dto.setApprovedAt(s.getApprovedAt());

        return dto;
    }
}
