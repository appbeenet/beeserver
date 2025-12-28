package com.bee.exp.repository;

import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {

    Optional<TaskSubmission> findByTaskAndEngineer(Task task, User engineer);

    List<TaskSubmission> findByEngineer(User engineer);

    List<TaskSubmission> findByTask(Task task);
}
