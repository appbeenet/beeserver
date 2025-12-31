package com.bee.exp.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "task_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Task task;

    @ManyToOne(optional = false)
    private User engineer;

    @Column(length = 4000)
    private String notes;

    private String attachmentUrl;

    /**
     * Junior’ın submit ettiği zaman.
     * Claim aşamasında da kayıt açarsak, ilk persist’te dolacak.
     */
    @Column(name = "claimed_at")
    private Instant claimedAt;

    private Instant submittedAt;

    /**
     * Firma / mentor review süreci için status
     *  - PENDING: Submit edilmiş, onay bekliyor
     *  - APPROVED: Onaylandı, XP verildi
     *  - REJECTED: Reddedildi (ileride kullanabiliriz)
     */
    // 👇 Claim → Submit arası toplam süre (dakika)
    @Column(name = "completion_minutes")
    private Integer completionMinutes;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    /**
     * Onay bilgileri
     */
    private Instant approvedAt;

    @ManyToOne
    private User approvedBy;

    /**
     * Bu submission için verilen XP (onayda hesaplanır)
     */
    private Integer xpAwarded;

    @PrePersist
    public void prePersist() {
        if (submittedAt == null) {
            submittedAt = Instant.now();
        }
        if (status == null) {
            status = SubmissionStatus.DRAFT;
        }
    }

    // Mentor kalite puanı (1.0 - 5.0)
    @Column(name = "quality_score")
    private Double qualityScore;

    // Mentor inceleme yorumu
    @Column(length = 2000)
    private String mentorComment;
}
