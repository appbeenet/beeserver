package com.bee.exp.service;

import com.bee.exp.domain.Company;
import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskStatus;
import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.User;
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.repository.TaskRepository;
import com.bee.exp.repository.TaskSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final CompanyRepository companyRepository;
    private final XpService xpService; // sende adı farklıysa uyarlarsın

    /**
     * JUNIOR / ENGINEER:
     * - Tüm PUBLISHED görevler (marketplace)
     * - + Bu junior'un üzerinde çalıştığı görevler (TaskSubmission üzerinden)
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
     * COMPANY:
     * Bu kullanıcının sahibi olduğu şirketin görevleri.
     */
    public List<Task> listTasksForCompany(User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        return companyRepository.findByOwner(currentUser)
                .map(taskRepository::findByCompany)
                .orElse(List.of());
    }

    public List<Task> listPublishedTasks() {
        return taskRepository.findByStatus(TaskStatus.PUBLISHED);
    }

    /**
     * COMPANY:
     * Yeni task oluşturma.
     */
    public Task createTask(Task task, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }
    
        Company company = companyRepository
                .findByOwner(currentUser)
                .orElseGet(() -> {
                    // Otomatik company yarat
                    Company c = new Company();
                    c.setOwner(currentUser);
                    // fullName veya email'den default isim türet
                    String defaultName = currentUser.getFullName() != null
                            ? currentUser.getFullName() + " Company"
                            : currentUser.getEmail() + " Company";
                    c.setName(defaultName);
                    c.setDescription("Auto-created company profile for " + defaultName);
                    return companyRepository.save(c);
                });
    
        task.setCompany(company);
        task.setStatus(TaskStatus.PUBLISHED);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
    
        return taskRepository.save(task);
    }
    

    /**
     * JUNIOR:
     * Görevi üzerine alma.
     * - Task üzerinde herhangi bir kilit / status değişikliği yapmıyoruz
     * - Sadece TaskSubmission ile (task, engineer) ilişkisini kuruyoruz.
     */
    public Task claimTask(Long taskId, User currentUser) {
        // 🔴 GEÇİCİ OLARAK currentUser zorunluluğunu kaldırıyoruz
        if (currentUser == null) {
            // Burada şimdilik exception atma, sadece log yaz:
            System.out.println("[WARN] claimTask: currentUser is null, demo modunda çalışıyor.");
            // İleride JWT / Security bağlandığında burayı tekrar sıkılaştıracağız.
        }
    
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    
        // status / assignedTo kontrolü YOK (multi-junior model)
        // Sadece TaskSubmission oluşturuyoruz
    
        if (currentUser != null) {
            taskSubmissionRepository.findByTaskAndEngineer(task, currentUser)
                    .orElseGet(() -> {
                        TaskSubmission s = TaskSubmission.builder()
                                .task(task)
                                .engineer(currentUser)
                                .notes(null)
                                .attachmentUrl(null)
                                .build();
                        return taskSubmissionRepository.save(s);
                    });
        }
    
        // Task üzerinde herhangi bir değişiklik yok
        return task;
    }

    /**
     * JUNIOR:
     * Görevi yaptıktan sonra log / config / link ile SUBMIT eder.
     * Her junior için aynı task'tan ayrı bir submission tutulur.
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

        // Önce claim sırasında yaratılmış bir submission var mı bak
        TaskSubmission submission = taskSubmissionRepository
                .findByTaskAndEngineer(task, currentUser)
                .orElseGet(() -> TaskSubmission.builder()
                        .task(task)
                        .engineer(currentUser)
                        .build()
                );

        submission.setNotes(notes);
        submission.setAttachmentUrl(attachmentUrl);
        // createdAt alanı varsa entity içinde @PrePersist ile set edebilirsin

        return taskSubmissionRepository.save(submission);
    }

    /**
     * MENTOR / COMPANY:
     * Şimdilik eski modeldeki gibi Task bazlı approve bırakıyorum.
     * Multi-junior için ideal olan, submission bazlı approve (submissionId ile)
     * ama onu ayrı bir adımda tasarlayalım istersen.
     */
    public Task approveTask(Long taskId, User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Burayı multi-junior senaryoya göre yeniden tasarlamak mantıklı,
        // şimdilik sadece task'i COMPLETED yapıyoruz.
        task.setStatus(TaskStatus.COMPLETED);
        task.setUpdatedAt(Instant.now());
        taskRepository.save(task);

        // XP atama mantığını ileride submission bazlı hale getirelim.
        return task;
    }

    public Task completeTask(Long taskId, User currentUser) {
        return approveTask(taskId, currentUser);
    }
}
