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

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC : catalogue visible sans connexion ─────────
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/modules/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cours/**").permitAll()

                        // ── PUBLIC : soumission anonyme de feedback (page Home) ─
                        .requestMatchers(HttpMethod.POST, "/api/feedbacks/anonyme").permitAll()

                        // ── APPRENANT + ENSEIGNANT : soumettre un feedback ─────
                        .requestMatchers(HttpMethod.POST, "/api/feedbacks")
                                .hasAnyRole("APPRENANT", "ENSEIGNANT")

                        // ── ENSEIGNANT : consulter les avis sur ses cours ───────
                        .requestMatchers(HttpMethod.GET, "/api/feedbacks/cours/**")
                                .hasAnyRole("ENSEIGNANT", "ADMIN")

                        // ── ADMIN : gestion complète des feedbacks ─────────────
                        .requestMatchers("/api/feedbacks/**").hasRole("ADMIN")

                        // ── ENSEIGNANT / ADMIN : écriture catalogue ────────────
                        .requestMatchers(HttpMethod.POST,   "/api/categories/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/categories/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/modules/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/modules/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/modules/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/cours/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/cours/**").hasAnyRole("ENSEIGNANT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cours/**").hasAnyRole("ENSEIGNANT", "ADMIN")

                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"erreur\":\"Accès non autorisé\"}");
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
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:4200",
                "http://localhost:9000",
                "http://api-gateway:9000"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
