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

                // Lecture : ENSEIGNANT + APPRENANT
                .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAnyRole("ENSEIGNANT", "APPRENANT")
                .requestMatchers(HttpMethod.GET, "/api/modules/**").hasAnyRole("ENSEIGNANT", "APPRENANT")
                .requestMatchers(HttpMethod.GET, "/api/cours/**").hasAnyRole("ENSEIGNANT", "APPRENANT")

                // Écriture : ENSEIGNANT uniquement
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.PUT,  "/api/categories/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.POST, "/api/modules/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.PUT,  "/api/modules/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.DELETE, "/api/modules/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.POST, "/api/cours/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.PUT,  "/api/cours/**").hasRole("ENSEIGNANT")
                .requestMatchers(HttpMethod.DELETE, "/api/cours/**").hasRole("ENSEIGNANT")

                .anyRequest().permitAll()
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
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
