package com.bee.exp.service;

import com.bee.exp.domain.Profile;
import com.bee.exp.domain.Task;
import com.bee.exp.domain.User;
import com.bee.exp.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class XpService {

    private final ProfileRepository profileRepository;

    /**
     * Bir task tamamlandığında junior'a XP yazar.
     * Formülü burada merkezi tutuyoruz.
     */
    public void addXpForTaskCompletion(User junior, Task task) {
        if (junior == null || task == null) return;

        Profile profile = profileRepository.findByUser(junior)
                .orElseGet(() -> createProfileForUser(junior));

        int currentXp = profile.getXpPoints() != null ? profile.getXpPoints() : 0;

        // Basit formül: bounty + (difficulty * 10)
        Integer bounty = task.getPrice(); // ileride bountyAmount'a geçersin
        if (bounty == null) bounty = 0;

        int difficultyBonus = 0;
        if (task.getDifficulty() != null) {
            // EASY / MEDIUM / HARD → puanlama istersen enum ordinal / ayrı mapping ile
            switch (task.getDifficulty()) {
                case EASY -> difficultyBonus = 5;
                case MEDIUM -> difficultyBonus = 10;
                case HARD -> difficultyBonus = 20;
                default -> difficultyBonus = 0;
            }
        }

        int gained = bounty + difficultyBonus;
        int newXp = currentXp + gained;

        profile.setXpPoints(newXp);
        profile.setLevel(calculateLevel(newXp));

        profileRepository.save(profile);
    }

    private Profile createProfileForUser(User user) {
        Profile p = Profile.builder()
                .user(user)
                .xpPoints(0)
                .level(1)
                .honeyDrops(0)
                .githubHandle(null)
                .reputationScore(0.0)
                .build();
        return profileRepository.save(p);
    }

    /**
     * Basit seviye hesaplama:
     * 0-99 → Level 1,
     * 100-199 → Level 2,
     * ...
     */
    private int calculateLevel(int xp) {
        int base = xp / 100;
        return Math.max(1, base + 1);
    }
}
