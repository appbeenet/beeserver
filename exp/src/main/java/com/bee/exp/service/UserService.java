package com.bee.exp.service;

import com.bee.exp.domain.Company;
import com.bee.exp.domain.Profile;
import com.bee.exp.domain.SubscriptionTier;
import com.bee.exp.domain.User;
import com.bee.exp.domain.UserRole;   // 🔹 UserRole enum
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.repository.ProfileRepository;
import com.bee.exp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Esas register metodu:
     *  - UserRole alır
     *  - User + Profile oluşturur
     *  - UserRole.COMPANY ise Company kaydı açar
     */
    public User registerUser(String email,
                             String rawPassword,
                             String fullName,
                             UserRole roleEnum) {

        if (email == null || rawPassword == null || roleEnum == null) {
            throw new IllegalArgumentException("Email, password and role are required");
        }

        User user = User.builder()
                .email(email)
                .fullName(fullName != null ? fullName : email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(roleEnum)   // ✅ User.builder().role(UserRole)
                .build();

        User saved = userRepository.save(user);

        // ---- PROFILE oluştur ----
        Profile profile = Profile.builder()
                .user(saved)
                .xpPoints(0)
                .level(1)
                .honeyDrops(0)
                .githubHandle(null)
                .reputationScore(0.0)
                .build();
        profileRepository.save(profile);

        // ---- COMPANY rolü ise firma kaydı aç ----
        if (roleEnum == UserRole.COMPANY) {
            Company company = Company.builder()
                    .name(fullName != null ? fullName : email)
                    .description("Auto-created company for " + email)
                    .owner(saved)
                    .walletBalance(0L)
                    .subscriptionTier(SubscriptionTier.FREE)
                    .isVerified(false)
                    .build();

            companyRepository.save(company);
        }

        return saved;
    }

    /**
     * Eğer dışarıdan String role ile register almak istersen:
     * "ENGINEER", "COMPANY", "MENTOR", "ADMIN" gibi.
     */
    public User register(String email,
                         String rawPassword,
                         String fullName,
                         String roleString) {

        if (roleString == null) {
            throw new IllegalArgumentException("roleString is required");
        }

        UserRole roleEnum;
        try {
            roleEnum = UserRole.valueOf(roleString.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException(
                    "Invalid role: " + roleString +
                    ". Valid roles: " + java.util.Arrays.toString(UserRole.values())
            );
        }

        return registerUser(email, rawPassword, fullName, roleEnum);
    }
}
