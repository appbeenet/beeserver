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

    // --- KRİTİK DÜZELTME BURADA ---
    private User resolveUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Oturum açılmamış (Unauthenticated).");
        }

        Object principal = authentication.getPrincipal();
        String email;

        // 1. İHTİMAL: Principal zaten bizim User nesnemizdir (Senin hatan buradaydı)
        if (principal instanceof User) {
            email = ((User) principal).getEmail();
        }
        // 2. İHTİMAL: Spring UserDetails objesidir
        else if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        }
        // 3. İHTİMAL: Doğrudan String email gelmiştir
        else if (principal instanceof String) {
            email = (String) principal;
        }
        // 4. İHTİMAL: Principal java.security.Principal tipindedir
        else if (principal instanceof Principal) {
            email = ((Principal) principal).getName();
        }
        else {
            email = principal.toString();
        }

        // Elde ettiğimiz temiz email ile veritabanından taze kayıt çekiyoruz
        String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı veritabanında bulunamadı. Aranan email: " + finalEmail));
    }
    // -----------------------------

    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }

    @GetMapping
    public List<TaskResponse> list(
            Authentication authentication,
            @RequestParam(name = "status", required = false) TaskStatus status,
            @RequestParam(name = "difficulty", required = false) TaskDifficulty difficulty
    ) {
        User currentUser = resolveUser(authentication);

        List<Task> tasks;

        // 1. Eğer Mühendis ise: Kendi aldıkları + Açık görevler
        if (currentUser != null && "ENGINEER".equalsIgnoreCase(String.valueOf(currentUser.getRole()))) {
            tasks = taskService.listTasksForEngineer(currentUser);
        }
        // 2. Eğer Şirket ise: SADECE kendi oluşturduğu görevler (YENİ EKLENEN KISIM)
        else if (currentUser != null && "COMPANY".equalsIgnoreCase(String.valueOf(currentUser.getRole()))) {
            tasks = taskService.listTasksForCompany(currentUser);
        }
        // 3. Giriş yapmamış veya başka bir rol ise: Sadece yayındaki görevler
        else {
            tasks = taskService.listPublishedTasks();
        }

        return tasks.stream()
                .map(t -> toResponse(t, currentUser))
                .toList();
    }

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

    @PostMapping("/{id}/claim")
    public ResponseEntity<TaskResponse> claim(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        Task t = taskService.claimTask(id, currentUser);
        return ResponseEntity.ok(toResponse(t));
    }

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

    @PostMapping("/{id}/approve")
    public ResponseEntity<TaskResponse> approve(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
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