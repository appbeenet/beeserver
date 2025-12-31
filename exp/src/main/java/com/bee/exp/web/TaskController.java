package com.bee.exp.web;

import com.bee.exp.domain.*;
import com.bee.exp.service.TaskService;
import com.bee.exp.web.dto.TaskCreateRequest;
import com.bee.exp.web.dto.TaskResponse;
import com.bee.exp.web.dto.TaskSubmitRequest;
import com.bee.exp.repository.TaskSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final TaskSubmissionRepository submissionRepository;

    @GetMapping("/ping")
    public String ping() {
        System.out.println("PING /api/tasks/ping hit");
        return "ok";
    }

    /**
     * Junior login ise kendi görev durumlarını görebilsin
     * Diğer roller sadece yayınlanmış görevleri görür
     */
    @GetMapping
    public List<TaskResponse> list(
            @AuthenticationPrincipal User currentUser
    ) {
        List<Task> tasks;
        if (currentUser != null && currentUser.getRole() == UserRole.ENGINEER) {
            tasks = taskService.listTasksForEngineer(currentUser);
        } else {
            tasks = taskService.listPublishedTasks();
        }

        return tasks.stream()
                .map(t -> toResponse(t, currentUser))
                .toList();
    }
    
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<Void> withdraw(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        taskService.withdrawSubmission(id, currentUser);
        return ResponseEntity.ok().build();
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
            .budgetHd(req.getPrice() != null ? req.getPrice().intValue() : 0)
            .baseXp(250) // xpService varsa
            .build();

        Task saved = taskService.createTask(task, currentUser);
        return ResponseEntity.ok(toResponse(saved, currentUser));
    }

    /** GÖREVİ AL — multi-engineer destekli */
    @PostMapping("/{id}/claim")
    public ResponseEntity<TaskResponse> claim(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Task task = taskService.claimTask(id, currentUser);
        return ResponseEntity.ok(toResponse(task, currentUser));
    }

    /** GÖREV SUBMIT — Junior çözüm gönderir */
    @PostMapping("/{id}/submit")
    public ResponseEntity<Long> submit(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody TaskSubmitRequest req
    ) {
        TaskSubmission submission = taskService.submitTask(id, currentUser, req.getNotes(), req.getAttachmentUrl());
        return ResponseEntity.ok(submission.getId());
    }

    /** TASK BASED APPROVE — legacy destek */
    @PostMapping("/{id}/approve")
    public ResponseEntity<TaskResponse> approve(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Task task = taskService.approveTask(id, currentUser);
        return ResponseEntity.ok(toResponse(task, currentUser));
    }

    /**
     * Task → DTO
     * + junior login ise claimedByMe & submittedByMe hesaplama
     */
    private TaskResponse toResponse(Task t, User currentUser) {
        TaskResponse r = new TaskResponse();

        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setDifficulty(t.getDifficulty());
        r.setStatus(t.getStatus());

        if (t.getPrice() != null) {
            r.setPrice(BigDecimal.valueOf(t.getPrice()));
        }

        if (t.getCompany() != null) {
            r.setCompanyName(t.getCompany().getName());
        }
        if (t.getAssignedTo() != null) {
            r.setAssignedEngineerName(t.getAssignedTo().getFullName());
        }

        // 👇 Sadece engineer girişi varsa kendi durumunu göster
        if (currentUser != null && currentUser.getRole() == UserRole.ENGINEER) {
            Optional<TaskSubmission> subOpt =
                    submissionRepository.findByTaskAndEngineer(t, currentUser);

            boolean claimedByMe = subOpt.isPresent();
            boolean submittedByMe = subOpt.isPresent()
                    && subOpt.get().getNotes() != null
                    && !subOpt.get().getNotes().isBlank();

            r.setClaimedByMe(claimedByMe);
            r.setSubmittedByMe(submittedByMe);
        }

        return r;
    }
}
