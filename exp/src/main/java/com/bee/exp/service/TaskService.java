package com.bee.exp.service;

import com.bee.exp.domain.*;
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.repository.TaskRepository;
import com.bee.exp.repository.TaskSubmissionRepository;
import com.bee.exp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final XpService xpService;

    public List<Task> listPublishedTasks() {
        return taskRepository.findByStatus(TaskStatus.PUBLISHED);
    }

    public List<Task> listTasksForEngineer(User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        List<Task> openTasks = new ArrayList<>(taskRepository.findByStatus(TaskStatus.PUBLISHED));
        List<TaskSubmission> mySubs = taskSubmissionRepository.findByEngineer(currentUser);

        Set<Long> seenIds = new HashSet<>();
        for (Task t : openTasks) {
            if (t.getId() != null) seenIds.add(t.getId());
        }

        for (TaskSubmission sub : mySubs) {
            Task t = sub.getTask();
            if (t != null && t.getId() != null && !seenIds.contains(t.getId())) {
                openTasks.add(t);
                seenIds.add(t.getId());
            }
        }

        return openTasks;
    }

    public Task createTask(Task task, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Company company = companyRepository
                .findByOwner(currentUser)
                .orElseThrow(() ->
                        new RuntimeException("No company for this user. Please create/update it via POST /api/companies/me first.")
                );

        task.setCompany(company);
        task.setStatus(TaskStatus.PUBLISHED);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());

        return taskRepository.save(task);
    }

    public Task claimTask(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        taskSubmissionRepository.findByTaskAndEngineer(task, currentUser)
                .orElseGet(() -> {
                    TaskSubmission s = TaskSubmission.builder()
                            .task(task)
                            .engineer(currentUser)
                            .notes(null)
                            .attachmentUrl(null)
                            .approved(false)
                            .build();
                    return taskSubmissionRepository.save(s);
                });

        return task;
    }

    public TaskSubmission submitTask(Long taskId,
                                     User currentUser,
                                     String notes,
                                     String attachmentUrl) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskSubmission submission = taskSubmissionRepository
                .findByTaskAndEngineer(task, currentUser)
                .orElseGet(() -> TaskSubmission.builder()
                        .task(task)
                        .engineer(currentUser)
                        .build()
                );

        submission.setNotes(notes);
        submission.setAttachmentUrl(attachmentUrl);
        submission.setApproved(false);
        submission.setApprovedAt(null);

        return taskSubmissionRepository.save(submission);
    }

    /**
     * Mentor/Firma görevi onaylar:
     *  - Bu task'a ait onaysız submission'ları bul
     *  - Her bir engineer için XpService üzerinden XP yaz
     *  - Submission'ları approved=true yap
     *  - Task.status = COMPLETED
     */
    public Task approveTask(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // İstersen burada sadece company owner onaylayabilsin diye check eklersin.

        List<TaskSubmission> submissions = taskSubmissionRepository.findByTask(task);

        for (TaskSubmission sub : submissions) {
            if (Boolean.TRUE.equals(sub.getApproved())) {
                continue;
            }

            User engineer = sub.getEngineer();
            if (engineer != null) {
                // ✅ XP'yi merkezi servis üzerinden yaz
                xpService.addXpForTaskCompletion(engineer, task);
            }

            sub.setApproved(true);
            sub.setApprovedAt(Instant.now());
            taskSubmissionRepository.save(sub);
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }
}
