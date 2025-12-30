package com.bee.exp.web;

import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.TaskDifficulty;
import com.bee.exp.domain.TaskStatus;
import com.bee.exp.domain.User;
import com.bee.exp.repository.TaskSubmissionRepository;
import com.bee.exp.repository.UserRepository;
import com.bee.exp.service.TaskService;
import com.bee.exp.web.dto.TaskCreateRequest;
import com.bee.exp.web.dto.TaskResponse;
import com.bee.exp.web.dto.TaskSubmitRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final UserRepository userRepository;

    // --- Kullanıcı Çözümleme Yardımcısı ---
    private User resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Oturum açılmamış (Unauthenticated).");
        }

        Object principal = authentication.getPrincipal();
        String email;

        if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        } else if (principal instanceof Principal) {
            email = ((Principal) principal).getName();
        } else {
            email = principal.toString();
        }

        String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı veritabanında bulunamadı: " + finalEmail));
    }

    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }

    // 1. Görevleri Listele
    @GetMapping
    public List<TaskResponse> list(
            Authentication authentication,
            @RequestParam(name = "status", required = false) TaskStatus status,
            @RequestParam(name = "difficulty", required = false) TaskDifficulty difficulty
    ) {
        User currentUser = resolveUser(authentication);
        List<Task> tasks;

        if (currentUser != null && "ENGINEER".equalsIgnoreCase(String.valueOf(currentUser.getRole()))) {
            tasks = taskService.listTasksForEngineer(currentUser);
        } else if (currentUser != null && "COMPANY".equalsIgnoreCase(String.valueOf(currentUser.getRole()))) {
            tasks = taskService.listTasksForCompany(currentUser);
        } else {
            tasks = taskService.listPublishedTasks();
        }

        return tasks.stream()
                .map(t -> toResponse(t, currentUser))
                .toList();
    }

    // 2. Görev Oluştur
    @PostMapping
    public ResponseEntity<TaskResponse> create(
            Authentication authentication,
            @RequestBody TaskCreateRequest req
    ) {
        User currentUser = resolveUser(authentication);

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .difficulty(req.getDifficulty())
                .price(req.getPrice())
                .build();

        Task saved = taskService.createTask(task, currentUser);
        return ResponseEntity.ok(toResponse(saved));
    }

    // 3. Görevi Sahiplen (Claim)
    @PostMapping("/{id}/claim")
    public ResponseEntity<TaskResponse> claim(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        Task t = taskService.claimTask(id, currentUser);
        return ResponseEntity.ok(toResponse(t));
    }

    // 4. Görevi Teslim Et (Submit)
    @PostMapping("/{id}/submit")
    public ResponseEntity<Long> submit(
            @PathVariable("id") Long id,
            Authentication authentication,
            @RequestBody TaskSubmitRequest req
    ) {
        User currentUser = resolveUser(authentication);
        TaskSubmission s = taskService.submitTask(id, currentUser, req.getNotes(), req.getAttachmentUrl());
        return ResponseEntity.ok(s.getId());
    }

    // 5. Görevi Onayla (Approve)
    @PostMapping("/{id}/approve")
    public ResponseEntity<TaskResponse> approve(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        Task t = taskService.approveTask(id, currentUser);
        return ResponseEntity.ok(toResponse(t));
    }

    // 6. Başvuruları Getir (Get Submissions) - EKSİK OLAN KISIM BUYDU
    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<TaskSubmission>> getSubmissions(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        // Bu metodu TaskService içinde tanımlamış olman gerekiyor.
        // Eğer TaskService'de yoksa hata verir.
        List<TaskSubmission> submissions = taskService.getSubmissionsForTask(id, currentUser);
        return ResponseEntity.ok(submissions);
    }

    // --- Helper Methods ---

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

        boolean claimed = false;
        boolean submitted = false;

        if (currentUser != null &&
                "ENGINEER".equalsIgnoreCase(String.valueOf(currentUser.getRole()))) {

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