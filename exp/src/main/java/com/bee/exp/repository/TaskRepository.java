package com.bee.exp.repository;

import com.bee.exp.domain.Company;
import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    // Find tasks by company entity
    List<Task> findByCompany(Company company);

    // Find tasks by company ID (useful if we only have the ID)
    List<Task> findByCompanyId(Long companyId);
}