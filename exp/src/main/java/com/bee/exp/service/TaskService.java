package com.bee.exp.service;

import com.bee.exp.domain.*;
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.repository.TaskRepository;
import com.bee.exp.repository.TaskSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CompanyRepository companyRepository;
    private final TaskSubmissionRepository submissionRepository;
    private final XpService xpService;

    public Task createTask(Task task, User owner) {
        Company company = companyRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("Company not found for owner"));

        task.setCompany(company);
        task.setStatus(TaskStatus.PUBLISHED);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }

    public List<Task> listPublishedTasks() {
        return taskRepository.findByStatus(TaskStatus.PUBLISHED);
    }

    public Task claimTask(Long taskId, User engineer) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (task.getStatus() != TaskStatus.PUBLISHED || task.getAssignedTo() != null) {
            throw new RuntimeException("Task not available");
        }
        task.setAssignedTo(engineer);
        task.setStatus(TaskStatus.CLAIMED);
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }

    public TaskSubmission submitTask(Long taskId, User engineer, String notes, String attachmentUrl) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (!engineer.equals(task.getAssignedTo())) {
            throw new RuntimeException("Not assigned to this task");
        }
        if (task.getStatus() != TaskStatus.CLAIMED) {
            throw new RuntimeException("Task not in CLAIMED status");
        }
        task.setStatus(TaskStatus.SUBMITTED);
        task.setUpdatedAt(Instant.now());
        taskRepository.save(task);

        TaskSubmission sub = TaskSubmission.builder()
                .task(task)
                .engineer(engineer)
                .notes(notes)
                .attachmentUrl(attachmentUrl)
                .build();
        return submissionRepository.save(sub);
    }

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
}
