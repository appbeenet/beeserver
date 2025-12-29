package com.bee.exp.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Her user için 1 profile
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // Toplam XP (task/ review / etkinlik vs ile artar)
    @Column(name = "xp_points")
    private Integer xpPoints;

    // Lvl 1 – Lvl 50
    private Integer level;

    // Harcanabilir AppBee parası
    @Column(name = "honey_drops")
    private Integer honeyDrops;

    // GitHub handle
    private String githubHandle;

    // Mentor güvenilirlik puanı (1.0 – 5.0)
    private Double reputationScore;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (xpPoints == null) xpPoints = 0;
        if (level == null) level = 1;
        if (honeyDrops == null) honeyDrops = 0;
        if (reputationScore == null) reputationScore = 0.0;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
