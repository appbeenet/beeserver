package com.bee.exp.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "task_submissions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TaskSubmission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne
    @JoinColumn(name = "engineer_id")
    private User engineer;

    @Column(length = 4000)
    private String notes;

    private String attachmentUrl;

    private Instant submittedAt;

    @PrePersist
    public void prePersist() {
        submittedAt = Instant.now();
    }
}
