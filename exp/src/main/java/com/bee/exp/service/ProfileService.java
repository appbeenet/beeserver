package com.bee.exp.service;

import com.bee.exp.domain.Profile;
import com.bee.exp.domain.User;
import com.bee.exp.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    public Profile getOrCreateProfile(User user) {
        if (user == null) {
            throw new RuntimeException("Unauthenticated");
        }

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
}
