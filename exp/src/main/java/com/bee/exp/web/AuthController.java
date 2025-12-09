package com.bee.exp.web;

import com.bee.exp.domain.User;
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
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        User user = userService.registerUser(req.getEmail(), req.getPassword(), req.getFullName(), req.getRole());
        String token = jwtUtil.generateToken(user.getId(), user.getRole(), user.getEmail());

        AuthResponse resp = new AuthResponse();
        resp.setToken(token);
        resp.setUserId(user.getId());
        resp.setRole(user.getRole());
        resp.setFullName(user.getFullName());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole(), user.getEmail());

        AuthResponse resp = new AuthResponse();
        resp.setToken(token);
        resp.setUserId(user.getId());
        resp.setRole(user.getRole());
        resp.setFullName(user.getFullName());
        return ResponseEntity.ok(resp);
    }
}
