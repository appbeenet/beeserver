package com.bee.exp.security;

import com.bee.exp.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;

import java.util.Date;

@Component
public class JwtUtil {

    private static final byte[] SECRET =
    "this-is-a-long-secret-key-32+chars".getBytes(StandardCharsets.UTF_8);  
    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 24;

    @SuppressWarnings("deprecation")
    public String generateToken(Long userId, UserRole role, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("role", role.name())
                .claim("email", email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    @SuppressWarnings("deprecation")
    public Claims getClaims(String token) {
        return Jwts.parser()                 // JwtParserBuilder
                .setSigningKey(SECRET)
                .build()                     // 👈 BURASI EKSİKTİ
                .parseClaimsJws(token)       // Artık JwtParser üstünde çağrılıyor
                .getBody();
    }
    

    public Long getUserId(String token) {
        return Long.valueOf(getClaims(token).getSubject());
    }

    public UserRole getRole(String token) {
        return UserRole.valueOf(getClaims(token).get("role", String.class));
    }

    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }
}
