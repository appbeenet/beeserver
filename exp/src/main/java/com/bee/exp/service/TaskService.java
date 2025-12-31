package com.bee.exp.service;

import com.bee.exp.domain.*;
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.repository.TaskRepository;
import com.bee.exp.repository.TaskSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CompanyRepository companyRepository;
    private final TaskSubmissionRepository submissionRepository;
    private final XpService xpService;              // varsa kalsın
    private final RewardEngineService rewardEngine; // 🔥 yeni ekledik

    /**
     * Firma sahibi yeni task oluşturur.
     */
    public Task createTask(Task task, User owner) {
        Company company = companyRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Company not found for owner"));

        task.setCompany(company);
        task.setStatus(TaskStatus.PUBLISHED);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());

        return taskRepository.save(task);
    }

    /**
     * GENEL: Yayında olan görevler.
     */
    public List<Task> listPublishedTasks() {
        return taskRepository.findByStatus(TaskStatus.PUBLISHED);
    }

    /**
     * JUNIOR için görev listesi:
     * - PUBLISHED / CLAIMED / SUBMITTED görevler
     * (COMPLETED, CANCELLED hariç)
     */
    public List<Task> listTasksForEngineer(User engineer) {
        return taskRepository.findAll().stream()
                .filter(t ->
                        t.getStatus() == TaskStatus.PUBLISHED
                                || t.getStatus() == TaskStatus.CLAIMED
                                || t.getStatus() == TaskStatus.SUBMITTED
                )
                .toList();
    }

    /**
     * Junior görevi üzerine alır.
     * Aynı taski birden fazla engineer alabilir.
     * Her biri için ayrı TaskSubmission kaydı oluşturuyoruz.
     */
    public Task claimTask(Long taskId, User engineer) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getStatus() == TaskStatus.CANCELLED) {
            throw new RuntimeException("Task is cancelled");
        }

        // Bu engineer aynı task için zaten kayıt açmış mı?
        Optional<TaskSubmission> existing = submissionRepository.findByTaskAndEngineer(task, engineer);
        if (existing.isPresent()) {
            throw new RuntimeException("You already claimed or submitted this task.");
        }

        // Görsel amaçlı: ilk alanı assignedTo olarak işaretleyebilirsin
        if (task.getAssignedTo() == null) {
            task.setAssignedTo(engineer);
        }

        // En az bir kişi claim ederse CLAIMED'e çekelim
        if (task.getStatus() == TaskStatus.PUBLISHED) {
            task.setStatus(TaskStatus.CLAIMED);
        }

        task.setUpdatedAt(Instant.now());
        taskRepository.save(task);

        // Claim kaydı: notes boş, attachment boş, PENDING
        TaskSubmission claim = TaskSubmission.builder()
                .task(task)
                .engineer(engineer)
                .status(SubmissionStatus.PENDING)
                .build();

        submissionRepository.save(claim);

        return task;
    }

    /**
     * Junior submit eder:
     * - İlgili TaskSubmission kayıtlarını günceller
     * - Task global status SUBMITTED olur (en az 1 submission geldiğini gösterir)
     */
    public TaskSubmission submitTask(Long taskId, User engineer, String notes, String attachmentUrl) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskSubmission submission = submissionRepository.findByTaskAndEngineer(task, engineer)
                .orElseGet(() -> TaskSubmission.builder()
                        .task(task)
                        .engineer(engineer)
                        .build()
                );

        submission.setNotes(notes);
        submission.setAttachmentUrl(attachmentUrl);
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setSubmittedAt(Instant.now());

        TaskSubmission saved = submissionRepository.save(submission);

        // En az bir submission varsa task status SUBMITTED
        if (task.getStatus() == TaskStatus.PUBLISHED || task.getStatus() == TaskStatus.CLAIMED) {
            task.setStatus(TaskStatus.SUBMITTED);
            task.setUpdatedAt(Instant.now());
            taskRepository.save(task);
        }

        return saved;
    }

    /**
     * Eski task bazlı approve (istersen kullanma, submission bazlı approve daha esnek).
     */
    public Task approveTask(Long taskId, User companyOwner) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getCompany().getOwner().getId().equals(companyOwner.getId())) {
            throw new RuntimeException("Not your task");
        }
        if (task.getStatus() != TaskStatus.SUBMITTED) {
            throw new RuntimeException("Task not in SUBMITTED status");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setUpdatedAt(Instant.now());
        taskRepository.save(task);

        if (task.getAssignedTo() != null) {
            int xp = xpService.xpForDifficulty(task.getDifficulty());
            xpService.grantXp(task.getAssignedTo(), xp);
        }

        return task;
    }

    /**
     * Firma / mentor için:
     * PENDING durumdaki tüm submission’lar (review listesi).
     * Firma ise sadece kendi task’lerini görür.
     */
    public List<TaskSubmission> listPendingSubmissions(User reviewer) {
        if (reviewer.getRole() != UserRole.COMPANY && reviewer.getRole() != UserRole.MENTOR) {
            throw new RuntimeException("Only company or mentor can list pending submissions.");
        }

        List<TaskSubmission> allPending = submissionRepository.findByStatus(SubmissionStatus.PENDING);

        if (reviewer.getRole() == UserRole.COMPANY) {
            Company company = companyRepository.findByOwner(reviewer)
                    .orElseThrow(() -> new RuntimeException("Company not found for reviewer"));

            Long companyId = company.getId();
            return allPending.stream()
                    .filter(sub -> sub.getTask() != null
                            && sub.getTask().getCompany() != null
                            && companyId.equals(sub.getTask().getCompany().getId()))
                    .toList();
        }

        // MENTOR: şimdilik tüm pending submission’ları görebilir
        return allPending;
    }

    /**
     * Firma / mentor tek bir submission’ı onaylar:
     *  - submission.status = APPROVED
     *  - approvedAt, approvedBy
     *  - xpAwarded hesaplanır
     *  - xpService.grantXp(engineer, xpAwarded)
     */
    public TaskSubmission approveSubmission(Long submissionId, User reviewer) {
        TaskSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (reviewer.getRole() != UserRole.COMPANY && reviewer.getRole() != UserRole.MENTOR) {
            throw new RuntimeException("Only company or mentor can approve submissions.");
        }

        // Firma ise: sadece kendi firmasına ait task’leri onaylayabilsin
        if (reviewer.getRole() == UserRole.COMPANY) {
            Company company = companyRepository.findByOwner(reviewer)
                    .orElseThrow(() -> new RuntimeException("Company not found for reviewer"));

            if (!submission.getTask().getCompany().getId().equals(company.getId())) {
                throw new RuntimeException("You are not allowed to approve this submission.");
            }
        }

        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new RuntimeException("Submission is not in PENDING status.");
        }

        submission.setStatus(SubmissionStatus.APPROVED);
        submission.setApprovedAt(Instant.now());
        submission.setApprovedBy(reviewer);
        submission.setQualityScore(4.0);

        Task task = submission.getTask();
        rewardEngine.processRewards(task, submission, reviewer);

        TaskSubmission saved = submissionRepository.save(submission);

        if (task != null && task.getStatus() != TaskStatus.COMPLETED) {
            task.setStatus(TaskStatus.COMPLETED);
            task.setUpdatedAt(Instant.now());
            taskRepository.save(task);
        }

        return saved;
    }

    private int calcXpForTask(Task task) {
        if (task.getPrice() != null) {
            return task.getPrice().intValue();
        }
        return xpService.xpForDifficulty(task.getDifficulty());
    }
}
