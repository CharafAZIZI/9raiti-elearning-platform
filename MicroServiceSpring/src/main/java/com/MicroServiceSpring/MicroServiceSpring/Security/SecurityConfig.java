package com.MicroServiceSpring.MicroServiceSpring.Security;

import com.MicroServiceSpring.MicroServiceSpring.Filters.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC : catalogue ────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/modules/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cours/**").permitAll()

                        // ── APPRENANT : inscriptions ──────────────────────────────────
                        .requestMatchers(HttpMethod.GET,    "/api/inscriptions/mes-inscriptions").hasRole("APPRENANT")
                        .requestMatchers(HttpMethod.GET,    "/api/inscriptions/status/**").hasRole("APPRENANT")
                        .requestMatchers(HttpMethod.POST,   "/api/inscriptions/**").hasRole("APPRENANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/inscriptions/**").hasRole("APPRENANT")

                        // ── ENSEIGNANT : voir ses apprenants ──────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/inscriptions/mes-apprenants")
                        .hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/inscriptions/module/*/apprenants")
                        .hasAnyRole("ENSEIGNANT", "ADMIN")

                        // ── ENSEIGNANT : gestion catalogue ────────────────────────────
                        .requestMatchers(HttpMethod.GET,    "/api/modules/mes-modules").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/cours/mes-cours").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/categories/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/categories/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/modules/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/modules/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/modules/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/cours/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/cours/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cours/**").hasAnyRole("ENSEIGNANT", "ADMIN")

                        // ── QUIZ AI : génération par IA ───────────────────────────────
                        .requestMatchers(HttpMethod.GET,  "/api/quiz-ai/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/quiz-ai/generate").hasAnyRole("ENSEIGNANT", "ADMIN")

                        // ── QUIZ : routes publiques (lecture par apprenant) ───────────
                        .requestMatchers(HttpMethod.GET, "/api/quiz/cours/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/quiz/*/disponibles").authenticated()

                        // ── QUIZ : enseignant (CRUD quiz + questions) ─────────────────
                        .requestMatchers(HttpMethod.POST,   "/api/quiz").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/quiz/mes-quiz").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/quiz/*").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/quiz/*").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/quiz/*/questions").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/quiz/questions/*").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/quiz/questions/*").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/quiz/*/tentatives").hasAnyRole("ENSEIGNANT", "ADMIN")

                        // ── QUIZ : apprenant (passer un quiz, voir ses tentatives) ────
                        .requestMatchers(HttpMethod.POST,   "/api/quiz/soumettre").hasRole("APPRENANT")
                        .requestMatchers(HttpMethod.GET,    "/api/quiz/mes-tentatives").hasRole("APPRENANT")
                        .requestMatchers(HttpMethod.GET,    "/api/quiz/tentatives/*").authenticated()

                        // ── QUIZ : lecture quiz par ID (enseignant + apprenant) ───────
                        .requestMatchers(HttpMethod.GET, "/api/quiz/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/quiz").authenticated()

                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setContentType("application/json");
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.getWriter().write("{\"erreur\":\"Accès non autorisé\"}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setContentType("application/json");
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.getWriter().write("{\"erreur\":\"Accès refusé.\"}");
                        })
                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtSecret),
                        UsernamePasswordAuthenticationFilter.class
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(
                "http://localhost:4200",
                "http://localhost:9000",
                "http://api-gateway:9000"
        ));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}