package com.bee.exp.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "task_submissions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Hangi task için submission
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    // Hangi engineer (junior) submit etti
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "engineer_id")
    private User engineer;

    @Column(length = 4000)
    private String notes;

    private String attachmentUrl;

    private Instant createdAt;

    // ✅ Onay durumu (mentor/firma)
    private Boolean approved;      // null/false: onaysız, true: onaylı

    private Instant approvedAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (approved == null) {
            approved = false;
        }
    }
}
