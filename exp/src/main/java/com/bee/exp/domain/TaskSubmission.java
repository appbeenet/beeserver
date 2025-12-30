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
    private Instant submittedAt;

    /**
     * Firma / mentor review süreci için status
     *  - PENDING: Submit edilmiş, onay bekliyor
     *  - APPROVED: Onaylandı, XP verildi
     *  - REJECTED: Reddedildi (ileride kullanabiliriz)
     */
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
            status = SubmissionStatus.PENDING;
        }
    }
}
