package com.bee.exp.service;

import com.bee.exp.domain.Profile;
import com.bee.exp.domain.Task;
import com.bee.exp.domain.TaskSubmission;
import com.bee.exp.domain.User;
import com.bee.exp.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RewardEngineService {

    private final ProfileRepository profileRepository;

    // PLATFORM / MENTOR / JUNIOR oranları
    private static final double PLATFORM_FEE_RATE = 0.20; // %20
    private static final double MENTOR_FEE_RATE   = 0.15; // %15

    /**
     * Mentor/Firma "ONAYLA" dediği anda çağrılacak hesaplama motoru.
     */
    public void processRewards(Task task,
                               TaskSubmission submission,
                               User mentorReviewer) {

        User junior = submission.getEngineer();
        if (junior == null) {
            throw new RuntimeException("Submission has no engineer assigned");
        }

        // --- 1) Girdiler ---
        int baseXp = task.getBaseXp() != null ? task.getBaseXp() : 0;
        int totalBudgetHd = task.getBudgetHd() != null ? task.getBudgetHd() : 0;

        double qualityMultiplier = submission.getQualityScore() != null
                ? submission.getQualityScore()
                : 1.0; // UI'dan henüz gelmiyorsa 1.0

        boolean speedBonus = checkSpeedBonus(task, submission);

        // --- 2) XP Hesabı ---

        double calcXp = baseXp * qualityMultiplier;
        if (speedBonus) {
            calcXp += baseXp * 0.10; // %10 hız bonusu
        }
        int finalJuniorXp = (int) Math.round(calcXp);

        int mentorRepXp = 10; // sabit inceleme puanı

        // --- 3) HD Hesabı ---

        int platformEarn = (int) Math.round(totalBudgetHd * PLATFORM_FEE_RATE);
        int mentorEarn   = (int) Math.round(totalBudgetHd * MENTOR_FEE_RATE);
        int juniorEarn   = totalBudgetHd - (platformEarn + mentorEarn);

        // --- 4) DB Commit: XP & HoneyDrops ---

        // Junior profile
        Profile juniorProfile = getOrCreateProfile(junior);
        juniorProfile.setXpPoints(
                safeInt(juniorProfile.getXpPoints()) + finalJuniorXp
        );
        juniorProfile.setHoneyDrops(
                safeInt(juniorProfile.getHoneyDrops()) + juniorEarn
        );
        levelUpIfNeeded(juniorProfile);
        juniorProfile.setUpdatedAt(Instant.now());
        profileRepository.save(juniorProfile);

        // Mentor profile (reputation + HD)
        if (mentorReviewer != null) {
            Profile mentorProfile = getOrCreateProfile(mentorReviewer);
            mentorProfile.setReputationScore(
                    safeDouble(mentorProfile.getReputationScore()) + mentorRepXp
            );
            mentorProfile.setHoneyDrops(
                    safeInt(mentorProfile.getHoneyDrops()) + mentorEarn
            );
            mentorProfile.setUpdatedAt(Instant.now());
            profileRepository.save(mentorProfile);
        }

        // Platform payı: şimdilik sadece loglayalım
        // İleride platform wallet/transactions tablosuna yazabiliriz.
        System.out.printf(
                "[REWARD] Task %d -> JuniorXP=%d, JuniorHD=%d, MentorHD=%d, PlatformHD=%d%n",
                task.getId(), finalJuniorXp, juniorEarn, mentorEarn, platformEarn
        );

        // Submission’a XP’yi yazalım ki geçmişte görülsün
        submission.setXpAwarded(finalJuniorXp);
    }

    private boolean checkSpeedBonus(Task task, TaskSubmission submission) {
        if (submission.getClaimedAt() == null || submission.getSubmittedAt() == null) {
            return false;
        }
    
        long minutes = java.time.Duration.between(
                submission.getClaimedAt(),
                submission.getSubmittedAt()
        ).toMinutes();
    
        // Örn: 24 saat (1440 dk) altındaysa hız bonusu ver
        return minutes <= 1440;
    }
    

    private Profile getOrCreateProfile(User user) {
        return profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile p = new Profile();
                    p.setUser(user);
                    p.setXpPoints(0);
                    p.setLevel(1);
                    p.setHoneyDrops(0);
                    p.setReputationScore(0.0);
                    p.setCreatedAt(Instant.now());
                    p.setUpdatedAt(Instant.now());
                    return profileRepository.save(p);
                });
    }

    private int safeInt(Integer v) {
        return v == null ? 0 : v;
    }

    private double safeDouble(Double v) {
        return v == null ? 0.0 : v;
    }

    /**
     * Basit level up mantığı:
     * Örn: her 500 XP'de level +1
     */
    private void levelUpIfNeeded(Profile profile) {
        int xp = safeInt(profile.getXpPoints());
        int currentLevel = profile.getLevel() != null ? profile.getLevel() : 1;

        int newLevel = 1 + (xp / 500); // çok basit: 0-499 => 1, 500-999 => 2, ...

        if (newLevel > currentLevel) {
            profile.setLevel(newLevel);
            // TODO: burada rozet vb. de tetikleyebilirsin.
        }
    }
}
