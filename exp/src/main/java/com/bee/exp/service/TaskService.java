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

    /**
     * Sadece yayınlanmış (PUBLISHED) görevler
     * Anonim kullanıcılar veya firma tarafı için kullanılabilir.
     */
    public List<Task> listPublishedTasks() {
        return taskRepository.findByStatus(TaskStatus.PUBLISHED);
    }

    /**
     * Engineer için:
     *  - Açık (PUBLISHED) görevler
     *  - O engineer'in üzerinde çalıştığı görevler (TaskSubmission'ı olanlar)
     */
    public List<Task> listTasksForEngineer(User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        // 1) Açık görevler
        List<Task> openTasks = new ArrayList<>(taskRepository.findByStatus(TaskStatus.PUBLISHED));

        // 2) Bu junior'un submission'ları
        List<TaskSubmission> mySubs = taskSubmissionRepository.findByEngineer(currentUser);

        // 3) Tekilleştirerek görev listesini birleştir
        Set<Long> seenIds = new HashSet<>();
        for (Task t : openTasks) {
            if (t.getId() != null) {
                seenIds.add(t.getId());
            }
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

    /**
     * Firma kullanıcısı görev oluşturur.
     *  - currentUser bir Company owner olmalı
     *  - Task status = PUBLISHED
     */
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

    /**
     * Engineer görevi "üstüne alır" (claim).
     *  - Aynı görevi birden fazla engineer alabilir (multi-junior).
     *  - Aynı engineer aynı görevi ikinci kez claim edemez (varsa yeniden oluşturmaz).
     *  - Task üzerinde assignedTo / status değiştirmiyoruz.
     */
    public Task claimTask(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Aynı engineer + task için daha önce submission yoksa, claim amaçlı boş submission oluştur
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

        // Task üzerinde statü değişikliği yapmıyoruz (multi-junior)
        return task;
    }

    /**
     * Engineer görev için çalışmasını submit eder.
     *  - Notlar + attachmentUrl güncellenir.
     *  - Submission tekrar "onaysız" (approved=false) yapılır.
     */
    public TaskSubmission submitTask(Long taskId,
                                     User currentUser,
                                     String notes,
                                     String attachmentUrl) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Daha önce claim/submission var mı bak
        TaskSubmission submission = taskSubmissionRepository
                .findByTaskAndEngineer(task, currentUser)
                .orElseGet(() -> TaskSubmission.builder()
                        .task(task)
                        .engineer(currentUser)
                        .build()
                );

        submission.setNotes(notes);
        submission.setAttachmentUrl(attachmentUrl);
        submission.setApproved(false);          // ✅ submit sonrası onay bekler
        submission.setApprovedAt(null);

        return taskSubmissionRepository.save(submission);
    }

    /**
     * Mentor/Firma görevi onaylar.
     *  - Bu task'a ait daha önce onaylanmamış (approved=false/null) tüm submission'ları bulur.
     *  - Her bir submission'daki engineer'a task.price kadar XP yazar.
     *  - Submission'ı approved=true, approvedAt=now yapar.
     *  - Task.status = COMPLETED olur.
     */
    public Task approveTask(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // İstersen burada: sadece ilgili company owner onaylayabilsin diye ek check yapabilirsin.
        // Örn:
        // if (task.getCompany() == null || !task.getCompany().getOwner().getId().equals(currentUser.getId())) {
        //     throw new RuntimeException("You are not allowed to approve this task");
        // }

        Integer reward = task.getPrice();
        if (reward == null) {
            reward = 0;
        }

        // Bu göreve ait tüm submission'lar
        List<TaskSubmission> submissions = taskSubmissionRepository.findByTask(task);

        for (TaskSubmission sub : submissions) {
            // Daha önce onaylanmış submission'lara tekrar XP yazma
            if (Boolean.TRUE.equals(sub.getApproved())) {
                continue;
            }

            User engineer = sub.getEngineer();
            if (engineer != null && reward > 0) {
                Integer currentXp = engineer.getXp();
                if (currentXp == null) currentXp = 0;

                engineer.setXp(currentXp + reward);   // ✅ XP arttı
                userRepository.save(engineer);
            }

            sub.setApproved(true);
            sub.setApprovedAt(Instant.now());
            taskSubmissionRepository.save(sub);
        }

        // Görevi tamamlanmış işaretle
        task.setStatus(TaskStatus.COMPLETED);
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }
}
