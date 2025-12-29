package com.bee.exp.web;

import com.bee.exp.domain.User;
import com.bee.exp.domain.UserRole;
import com.bee.exp.repository.UserRepository;
import com.bee.exp.security.JwtUtil;
import com.bee.exp.service.UserService;
import com.bee.exp.web.dto.AuthResponse;
import com.bee.exp.web.dto.LoginRequest;
import com.bee.exp.web.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {

        if (req.getEmail() == null || req.getPassword() == null || req.getRole() == null) {
            return ResponseEntity.badRequest().build();
        }

        // RegisterRequest.role:
        //  - Eğer DTO'da UserRole ise: direkt req.getRole()
        //  - Eğer String ise: valueOf ile çevir
        UserRole roleEnum;
        Object rawRole = req.getRole();

        if (rawRole instanceof UserRole) {
            roleEnum = (UserRole) rawRole;
        } else {
            // String veya başka bir şey gelirse:
            try {
                roleEnum = UserRole.valueOf(rawRole.toString().toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().build();
            }
        }

        User user = userService.registerUser(
                req.getEmail(),
                req.getPassword(),
                req.getFullName(),
                roleEnum
        );

        String token = jwtUtil.generateToken(user.getId(), roleEnum, user.getEmail());

        AuthResponse resp = new AuthResponse();
        resp.setToken(token);
        resp.setUserId(user.getId());
        resp.setRole(roleEnum);             // 🔹 UserRole
        resp.setFullName(user.getFullName());

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {

        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().build();
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).build();
        }

        // User entity role tipi: UserRole
        UserRole roleEnum = user.getRole();

        String token = jwtUtil.generateToken(user.getId(), roleEnum, user.getEmail());

        AuthResponse resp = new AuthResponse();
        resp.setToken(token);
        resp.setUserId(user.getId());
        resp.setRole(roleEnum);           // 🔹 UserRole
        resp.setFullName(user.getFullName());

        return ResponseEntity.ok(resp);
    }
}
