package com.bee.exp.service;

import com.bee.exp.domain.Profile;
import com.bee.exp.domain.User;
import com.bee.exp.repository.ProfileRepository;
import com.bee.exp.web.dto.LeaderEntryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final ProfileRepository profileRepository;

    public List<LeaderEntryResponse> getTop10Leaders() {
        List<Profile> profiles = profileRepository.findTop10ByOrderByXpPointsDesc();

        return profiles.stream()
                .map(this::toDto)
                .toList();
    }

    private LeaderEntryResponse toDto(Profile p) {
        LeaderEntryResponse dto = new LeaderEntryResponse();

        User u = p.getUser();
        if (u != null) {
            dto.setUserId(u.getId());
            dto.setFullName(u.getFullName());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole() != null ? u.getRole().name() : null);
        }

        dto.setXp(p.getXpPoints());
        dto.setLevel(p.getLevel());

        return dto;
    }
}
