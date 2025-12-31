package com.bee.exp.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tasks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskDifficulty difficulty;

    private Integer price;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    // Toplam HD bütçesi (ör: 1000 HD)
    @Column(name = "budget_hd")
    private Integer budgetHd;

    // Görevin zorluk taban XP’si (örn: Tier 2 = 250 XP)
    @Column(name = "base_xp")
    private Integer baseXp;

    // Deadline, hız bonusu için (opsiyonel ama şimdiden koymak iyi)
    @Column(name = "deadline_at")
    private Instant deadlineAt;
}

