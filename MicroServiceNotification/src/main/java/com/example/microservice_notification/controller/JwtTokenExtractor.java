package com.example.microservice_notification.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Slf4j
@Component
public class JwtTokenExtractor {

    @Value("${jwt.secret}")
    private String jwtSecret;

    /** Extrait l'userId (accepte les tokens expirés si signature valide) */
    public Long extractUserId(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        try {
            return extractId(Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody());
        } catch (ExpiredJwtException e) {
            log.info("[JWT] Token expiré mais signature valide.");
            return extractId(e.getClaims());
        } catch (Exception e) {
            log.warn("[JWT] Token invalide : {}", e.getMessage());
            return null;
        }
    }

    /** Extrait le rôle (APPRENANT, ENSEIGNANT, ADMIN...) */
    public String extractRole(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        try {
            return extractRoleFromClaims(Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody());
        } catch (ExpiredJwtException e) {
            return extractRoleFromClaims(e.getClaims());
        } catch (Exception e) {
            return null;
        }
    }

    /** Extrait l'userId depuis le header Authorization: Bearer xxx */
    public Long extractUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return extractUserId(authHeader.substring(7));
    }

    private Long extractId(Claims claims) {
        Object sub = claims.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        if (sub == null) sub = claims.get("nameid");
        if (sub == null) sub = claims.getSubject();
        try { return sub != null ? Long.parseLong(sub.toString()) : null; }
        catch (NumberFormatException e) { return null; }
    }

    private String extractRoleFromClaims(Claims claims) {
        Object role = claims.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
        if (role == null) role = claims.get("role");
        return role != null ? role.toString().toUpperCase() : null;
    }
}