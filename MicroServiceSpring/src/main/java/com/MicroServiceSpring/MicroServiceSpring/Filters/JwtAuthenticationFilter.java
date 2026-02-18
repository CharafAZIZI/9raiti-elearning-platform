package com.MicroServiceSpring.MicroServiceSpring.Filters;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final String jwtSecret;

    public JwtAuthenticationFilter(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        System.out.println("=== JWT Filter Debug ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + header);

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // supprime "Bearer "

            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(jwtSecret.getBytes())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                System.out.println("Claims JWT: " + claims);

                // Lecture du claim email (.NET ClaimTypes.Email)
                String email = claims.get("email", String.class);
                if (email == null) {
                    email = claims.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", String.class);
                }

                // Lecture du claim role (.NET ClaimTypes.Role)
                String role = claims.get("role", String.class);
                if (role == null) {
                    role = claims.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", String.class);
                }

                System.out.println("Email extrait: " + email);
                System.out.println("Rôle extrait: " + role);

                if (email != null && role != null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("Authentication set for user: " + email + " with role: " + role.toUpperCase());
                } else {
                    System.out.println("JWT incomplet ou rôle manquant, accès refusé.");
                }

            } catch (Exception e) {
                System.out.println("Erreur JWT: " + e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token invalide");
                return;
            }
        } else {
            System.out.println("Header Authorization manquant ou mal formé.");
        }

        filterChain.doFilter(request, response);
    }
}
