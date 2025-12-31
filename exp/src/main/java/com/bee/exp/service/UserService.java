package com.bee.exp.service;

import com.bee.exp.domain.Company;
import com.bee.exp.domain.Profile;
import com.bee.exp.domain.SubscriptionTier;
import com.bee.exp.domain.User;
import com.bee.exp.domain.UserRole;
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
     * Main register method:
     *  - Accepts UserRole
     *  - Creates User + Profile
     *  - Creates Company record if UserRole is COMPANY
     */
    public User registerUser(String email,
                             String rawPassword,
                             String fullName,
                             UserRole roleEnum,
                             Long companyId) {

        if (email == null || rawPassword == null || roleEnum == null) {
            throw new IllegalArgumentException("Email, password and role are required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .email(email)
                .fullName(fullName != null ? fullName : email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(roleEnum)
                .build();
        
        // ---- Link to Existing Company if provided ----
        if (roleEnum == UserRole.COMPANY && companyId != null) {
            Company company = companyRepository.findById(companyId)
                    .orElseThrow(() -> new RuntimeException("Selected company not found"));
            user.setCompany(company);
        }

        User saved = userRepository.save(user);

        // ---- Create PROFILE ----
        Profile profile = Profile.builder()
                .user(saved)
                .xpPoints(0)
                .level(1)
                .honeyDrops(0)
                .githubHandle(null)
                .reputationScore(0.0)
                .build();
        profileRepository.save(profile);

        // ---- Create Company if role is COMPANY AND NO ID PROVIDED (Fallback/Legacy) ----
        if (roleEnum == UserRole.COMPANY && companyId == null) {
             // Opsiyonel: Eğer şirket seçilmediyse otomatik oluşturulsun mu?
             // Senin isteğine göre burayı devre dışı bırakabiliriz veya 
             // "Eğer seçmediyse yeni oluşturuyor demektir" diye varsayabiliriz.
             // Şimdilik, eski mantığı koruyarak "seçmediyse yeni oluştur" yapalım, 
             // böylece sistem esnek kalır.
            Company company = Company.builder()
                    .name(fullName != null ? fullName : email)
                    .description("Auto-created company for " + email)
                    .owner(saved)
                    .walletBalance(0L)
                    .subscriptionTier(SubscriptionTier.FREE)
                    .isVerified(false)
                    .build();

            Company savedCompany = companyRepository.save(company);
            saved.setCompany(savedCompany); // User'ı da güncelle
            userRepository.save(saved);
        }

        return saved;
    }

    /**
     * Register with String role (e.g., from generic API request)
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

        return registerUser(email, rawPassword, fullName, roleEnum, null);
    }
}