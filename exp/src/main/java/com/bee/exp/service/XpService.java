package com.bee.exp.service;

import com.bee.exp.domain.TaskDifficulty;
import com.bee.exp.domain.User;
import com.bee.exp.domain.Profile;
import com.bee.exp.repository.ProfileRepository;
import com.bee.exp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class XpService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    /**
     * Task zorluğuna göre XP geri döner.
     * İstersen burada difficulty -> XP dönüşüm tablosu yapabilirsin.
     */
    public int xpForDifficulty(TaskDifficulty diff) {
        if (diff == null) return 50;

        return switch (diff) {
            case EASY   -> 50;
            case MEDIUM -> 100;
            case HARD   -> 200;
            default     -> 50;
        };
    }

    /**
     * Junior’a XP kazandırır. Profile + User.xp kolonlarını günceller
     */
    public void grantXp(User user, int xp) {
        if (xp <= 0) return;

        // --- Profile XP güncelle ---
        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No profile for user id = " + user.getId()));

        int newXp = profile.getXpPoints() + xp;
        profile.setXpPoints(newXp);

        // İstersen Level hesaplama ekleyebilirsin:
        profile.setLevel(calculateLevel(newXp));

        profileRepository.save(profile);

        // --- User tablosunda da tutuyorsan güncelle (senin modelinde xp var) ---
        user.setXp(user.getXp() + xp);
        userRepository.save(user);

        System.out.println("XP granted: +" + xp + " -> user " + user.getEmail());
    }

    /**
     * Basit level formülü:
     * her 500 xp’de 1 level
     * (İstersen sonra logaritmik / quadratic progression yaparız)
     */
    private int calculateLevel(int xp) {
        return Math.max(1, xp / 500 + 1);
    }
}
