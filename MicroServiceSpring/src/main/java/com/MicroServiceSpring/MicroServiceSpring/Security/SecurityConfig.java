package com.MicroServiceSpring.MicroServiceSpring.Security;

import com.MicroServiceSpring.MicroServiceSpring.Filters.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/cours/**").hasRole("ENSEIGNANT")
                        .requestMatchers(HttpMethod.PUT, "/api/cours/**").hasRole("ENSEIGNANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/cours/**").hasRole("ENSEIGNANT")
                        .requestMatchers(HttpMethod.GET, "/api/cours/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtSecret),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
