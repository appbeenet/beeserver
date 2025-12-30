package com.bee.exp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable()) // CSRF kapatıldı (Frontend için gerekli)
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // <-- BU SATIR ÇOK ÖNEMLİ (CORS'u aktif ettik)
                .authorizeHttpRequests(auth -> auth
                        // Statik dosyalar, Auth ve Tasks endpoint'lerine izin ver
                        .requestMatchers("/", "/index.html", "/static/**", "/css/**", "/js/**", "/images/**", "/api/auth/**", "/api/tasks/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated()
                );

        return http.build();
    }

    // 🔐 PasswordEncoder (Şifreleme Bean'i)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 🌐 CORS Ayarı (React ile Backend'in konuşması için)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // React uygulamanın adresi (Vite kullanıyorsan genelde 5173'tür)
        // Eğer 3000 kullanıyorsan burayı değiştirebilirsin veya "*" koyarak hepsine izin verebilirsin (Geliştirme için)
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}