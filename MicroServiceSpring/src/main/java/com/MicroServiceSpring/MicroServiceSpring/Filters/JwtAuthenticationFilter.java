package com.MicroServiceSpring.MicroServiceSpring.Filters;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final String jwtSecret;

    // Claim .NET pour l'ID utilisateur
    private static final String CLAIM_NAME_ID =
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

    public JwtAuthenticationFilter(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                Key key = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");

                Claims claims = Jwts.parser()
                        .verifyWith((SecretKey) key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // Extraire l'email
                String email = claims.get("email", String.class);
                if (email == null) {
                    email = claims.get(
                        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
                        String.class);
                }

                // Extraire le rôle
                String role = claims.get("role", String.class);
                if (role == null) {
                    role = claims.get(
                        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
                        String.class);
                }

                // Extraire l'ID utilisateur (NameIdentifier du JWT .NET)
                String userIdStr = claims.get(CLAIM_NAME_ID, String.class);
                Long userId = null;
                if (userIdStr != null) {
                    try { userId = Long.parseLong(userIdStr); } catch (NumberFormatException ignored) {}
                }

                if (email != null && role != null) {
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(
                                new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        );
                    // Stocker l'userId dans les détails pour JwtUtil
                    auth.setDetails(userId);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.info("Utilisateur authentifié : {} | rôle : {} | id : {}", email, role.toUpperCase(), userId);
                } else {
                    logger.warn("JWT invalide : email ou role manquant");
                    sendUnauthorized(response, "JWT invalide : email ou role manquant");
                    return;
                }

            } catch (Exception e) {
                logger.error("Erreur JWT : {}", e.getMessage());
                sendUnauthorized(response, "Token invalide ou expiré");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"erreur\":\"" + message + "\"}");
    }
}
