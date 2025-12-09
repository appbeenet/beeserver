package com.bee.exp.service;

import com.bee.exp.domain.TaskDifficulty;
import com.bee.exp.domain.User;
import com.bee.exp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class XpService {

    private final UserRepository userRepository;

    public int xpForDifficulty(TaskDifficulty diff) {
        return switch (diff) {
            case EASY -> 10;
            case MEDIUM -> 25;
            case HARD -> 50;
        };
    }

    public void grantXp(User user, int amount) {
        int newXp = (user.getXp() == null ? 0 : user.getXp()) + amount;
        user.setXp(newXp);
        user.setLevel(calcLevel(newXp));
        userRepository.save(user);
    }

    private int calcLevel(int xp) {
        if (xp < 100) return 1;
        if (xp < 250) return 2;
        if (xp < 500) return 3;
        return 4;
    }
}
