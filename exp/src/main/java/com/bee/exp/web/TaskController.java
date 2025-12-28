package com.bee.exp.web;

import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.TaskDifficulty;
import com.bee.exp.domain.TaskStatus;
import com.bee.exp.domain.User;
import com.bee.exp.repository.TaskSubmissionRepository;
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
    private final TaskSubmissionRepository taskSubmissionRepository; 

    @GetMapping("/ping")
    public String ping() {
        System.out.println("PING /api/tasks/ping hit");
        return "ok";
    }

    @GetMapping
    public List<TaskResponse> list(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(name = "status", required = false) TaskStatus status,
            @RequestParam(name = "difficulty", required = false) TaskDifficulty difficulty
    ) {
        List<Task> tasks;
    
        // Eğer engineer login ise: kendi görevleri + açık görevler
        if (currentUser != null && "ENGINEER".equalsIgnoreCase(String.valueOf(currentUser.getRole()))) {
            tasks = taskService.listTasksForEngineer(currentUser);
        } else {
            // anonim veya firma → sadece yayınlanmış görevler
            tasks = taskService.listPublishedTasks();
        }
    
        return tasks.stream()
                .map(t -> toResponse(t, currentUser))
                .toList();
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
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Task t = taskService.claimTask(id, currentUser);
        return ResponseEntity.ok(toResponse(t));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Long> submit(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody TaskSubmitRequest req
    ) {
        TaskSubmission s = taskService.submitTask(id, currentUser, req.getNotes(), req.getAttachmentUrl());
        return ResponseEntity.ok(s.getId());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<TaskResponse> approve(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Task t = taskService.approveTask(id, currentUser);
        return ResponseEntity.ok(toResponse(t));
    }

    private TaskResponse toResponse(Task t) {
        return toResponse(t, null);
    }
    
    private TaskResponse toResponse(Task t, User currentUser) {
        TaskResponse r = new TaskResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setDifficulty(t.getDifficulty());
        r.setPrice(t.getPrice());
        r.setStatus(t.getStatus());
        if (t.getCompany() != null) r.setCompanyName(t.getCompany().getName());
        if (t.getAssignedTo() != null) r.setAssignedEngineerName(t.getAssignedTo().getFullName());
    
        // 👇 burada claimedByMe / submittedByMe hesaplıyoruz
        boolean claimed = false;
        boolean submitted = false;
    
        if (currentUser != null &&
                "ENGINEER".equalsIgnoreCase(String.valueOf(currentUser.getRole()))) {
    
            taskSubmissionRepository.findByTaskAndEngineer(t, currentUser)
                    .ifPresent(sub -> {
                        // varlığı → claimed
                        // notes veya attachmentUrl doluysa → submitted
                    });
            var opt = taskSubmissionRepository.findByTaskAndEngineer(t, currentUser);
            if (opt.isPresent()) {
                claimed = true;
                TaskSubmission sub = opt.get();
                if ((sub.getNotes() != null && !sub.getNotes().isBlank())
                        || (sub.getAttachmentUrl() != null && !sub.getAttachmentUrl().isBlank())) {
                    submitted = true;
                }
            }
        }
    
        r.setClaimedByMe(claimed);
        r.setSubmittedByMe(submitted);
    
        return r;
    }
}
