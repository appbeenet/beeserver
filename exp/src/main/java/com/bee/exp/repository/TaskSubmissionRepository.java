package com.bee.exp.repository;

import com.bee.exp.domain.TaskSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {
}
