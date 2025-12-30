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
                        // statik ve landing
                        .requestMatchers("/", "/index.html", "/static/**", "/css/**", "/js/**", "/images/**")
                            .permitAll()

                        // auth herkese açık
                        .requestMatchers("/api/auth/**")
                            .permitAll()

                        // task list (landing için public GET)
                        .requestMatchers(HttpMethod.GET, "/api/tasks/**")
                            .permitAll()

                        // task list (landing için public GET)
                        .requestMatchers(HttpMethod.GET, "/api/leader/**")
                            .permitAll()

                        // profil: sadece login olması yeter
                        .requestMatchers("/api/profiles/**")
                            .authenticated()

                        // task create / claim / submit vs → login gerekli
                        .requestMatchers(HttpMethod.POST, "/api/tasks/**")
                            .authenticated()

                        // submissions: sadece COMPANY veya MENTOR
                        .requestMatchers("/api/submissions/**")
                            .hasAnyRole("COMPANY", "MENTOR")

                        // geri kalan her şey → login
                        .anyRequest()
                            .authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
