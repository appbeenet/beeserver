package com.bee.exp.web;

import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.TaskDifficulty;
import com.bee.exp.domain.TaskStatus;
import com.bee.exp.domain.User;
import com.bee.exp.service.TaskService;
import com.bee.exp.web.dto.TaskCreateRequest;
import com.bee.exp.web.dto.TaskResponse;
import com.bee.exp.web.dto.TaskSubmitRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks") 
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskResponse> list(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskDifficulty difficulty
    ) {
        List<Task> tasks = taskService.listPublishedTasks(); // MVP sadece PUBLISHED
        return tasks.stream().map(this::toResponse).toList();
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal User currentUser,
            @RequestBody TaskCreateRequest req
    ) {
        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .difficulty(req.getDifficulty())
                .price(req.getPrice())
                .build();

        Task saved = taskService.createTask(task, currentUser);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<TaskResponse> claim(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Task t = taskService.claimTask(id, currentUser);
        return ResponseEntity.ok(toResponse(t));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Long> submit(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody TaskSubmitRequest req
    ) {
        TaskSubmission s = taskService.submitTask(id, currentUser, req.getNotes(), req.getAttachmentUrl());
        return ResponseEntity.ok(s.getId());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<TaskResponse> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Task t = taskService.approveTask(id, currentUser);
        return ResponseEntity.ok(toResponse(t));
    }

    private TaskResponse toResponse(Task t) {
        TaskResponse r = new TaskResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setDifficulty(t.getDifficulty());
        r.setPrice(t.getPrice());
        r.setStatus(t.getStatus());
        if (t.getCompany() != null) r.setCompanyName(t.getCompany().getName());
        if (t.getAssignedTo() != null) r.setAssignedEngineerName(t.getAssignedTo().getFullName());
        return r;
    }
}
