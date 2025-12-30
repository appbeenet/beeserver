package com.bee.exp.repository;

import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.User;
import com.bee.exp.domain.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {

    // Aynı task + aynı engineer için kayıt
    Optional<TaskSubmission> findByTaskAndEngineer(Task task, User engineer);

    // Firma / mentor pending liste için
    List<TaskSubmission> findByStatus(SubmissionStatus status);

    // Junior kendi geçmiş submit’lerini görmek isterse
    List<TaskSubmission> findByEngineer(User engineer);
}
