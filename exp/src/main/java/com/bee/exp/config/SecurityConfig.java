package com.bee.exp.config;

import com.bee.exp.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // statik ve giriş sayfası
                        .requestMatchers("/", "/index.html", "/static/**", "/css/**", "/js/**", "/images/**")
                            .permitAll()

                        // auth endpoint'leri public
                        .requestMatchers("/api/auth/**")
                            .permitAll()

                        // görevleri listeleme public (landing için)
                        .requestMatchers(HttpMethod.GET, "/api/tasks/**")
                            .permitAll()

                        // junior’ın görev alma / submit etme kısmı -> login gerekli
                        .requestMatchers(HttpMethod.POST, "/api/tasks/**")
                            .authenticated()

                        // firma / mentor için submissions
                        .requestMatchers("/api/submissions/**")
                            .hasAnyRole("COMPANY", "MENTOR")

                        // profil / diğer her şey -> login gerekli
                        .anyRequest()
                            .authenticated()
                )
                // 🔐 JWT filtresini UsernamePasswordAuthenticationFilter'dan önce ekle
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
