package com.bee.exp.config;

import com.bee.exp.domain.Company;
import com.bee.exp.domain.Role;
import com.bee.exp.domain.User;
import com.bee.exp.repository.CompanyRepository;
import com.bee.exp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final com.bee.exp.repository.AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (adminRepository.findByEmail("admin@bee.com").isEmpty()) {
            com.bee.exp.domain.Admin admin = com.bee.exp.domain.Admin.builder()
                    .email("admin@bee.com")
                    .passwordHash(passwordEncoder.encode("admin123")) 
                    .fullName("System Admin")
                    .build();
            adminRepository.save(admin);
            System.out.println("Admin user created in admins table: admin@bee.com / admin123");
        }

        if (companyRepository.count() == 0) {
            List<Company> companies = List.of(
                    Company.builder().name("Tech Solutions Inc.").description("Innovative tech solutions provider.").build(),
                    Company.builder().name("BeeHive Systems").description("Building the future of swarming tech.").build(),
                    Company.builder().name("Global Networks").description("Connecting the world.").build()
            );
            companyRepository.saveAll(companies);
            System.out.println("Sample companies created.");
        }
    }
}
