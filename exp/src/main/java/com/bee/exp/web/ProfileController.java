package com.bee.exp.web;

import com.bee.exp.domain.Profile;
import com.bee.exp.domain.User;
import com.bee.exp.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("Unauthenticated");
        }
        Profile p = profileService.getOrCreateProfile(currentUser);
        return ResponseEntity.ok(p);
    }
}
