package com.bee.exp.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "companies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Şirket adı
    private String name;

    @Column(length = 2000)
    private String description;

    // Kovan sahibini User üzerinden tut
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    private User owner;

    // Task bütçesi
    @Column(name = "wallet_balance")
    private Long walletBalance;

    // Abonelik tipi (FREE / SCOUT / ENTERPRISE)
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier")
    private SubscriptionTier subscriptionTier;

    // Şirket onaylı mı?
    @Column(name = "is_verified")
    private Boolean isVerified;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (walletBalance == null) walletBalance = 0L;
        if (subscriptionTier == null) subscriptionTier = SubscriptionTier.FREE;
        if (isVerified == null) isVerified = false;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
