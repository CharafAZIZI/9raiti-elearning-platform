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

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final String jwtSecret;

    /*
     * Le .NET génère ClaimTypes.NameIdentifier qui se sérialise en ce claim XML.
     * Valeur dans le JWT = user.id.ToString() → entier numérique.
     * ATTENTION : JJWT lit les entiers comme Integer/Long, pas comme String.
     * C'est pourquoi claims.get(CLAIM_NAMEID, String.class) retournait NULL.
     */
    private static final String CLAIM_NAMEID =
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

    private static final String CLAIM_EMAIL =
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

    private static final String CLAIM_ROLE =
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    public JwtAuthenticationFilter(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            Key key = new SecretKeySpec(jwtSecret.getBytes("UTF-8"), "HmacSHA256");

            Claims claims = Jwts.parser()
                    .verifyWith((SecretKey) key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // ── Email ──────────────────────────────────────────────────────────
            String email = claims.get("email", String.class);
            if (email == null) {
                email = claims.get(CLAIM_EMAIL, String.class);
            }

            // ── Rôle ───────────────────────────────────────────────────────────
            String role = claims.get("role", String.class);
            if (role == null) {
                role = claims.get(CLAIM_ROLE, String.class);
            }

            // ── ID utilisateur ─────────────────────────────────────────────────
            // CORRECTIF PRINCIPAL :
            // Le .NET sérialise user.id (int) en JSON number → JJWT le lit en Integer.
            // claims.get(CLAIM_NAMEID, String.class) retourne NULL si la valeur est un Integer.
            // Il faut lire en Object puis convertir manuellement.
            Long userId = extractUserId(claims);

            log.info("JWT → email:{} | role:{} | userId:{}", email, role, userId);

            if (userId == null) {
                log.warn("JWT: claim nameidentifier absent ou non numérique. Claims: {}", claims.keySet());
            }

            if (email != null && role != null) {
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                Collections.singletonList(
                                        new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        );
                // userId est stocké dans details → récupéré par QuizController.getUserId()
                auth.setDetails(userId);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                log.warn("JWT invalide : email={} role={}", email, role);
                sendUnauthorized(response, "JWT invalide : email ou role manquant");
                return;
            }

        } catch (Exception e) {
            log.error("Erreur JWT : {}", e.getMessage());
            sendUnauthorized(response, "Token invalide ou expiré");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrait l'ID depuis le claim nameidentifier.
     *
     * Le JWT généré par le .NET (JwtSecurityTokenHandler) place user.id.ToString()
     * dans ce claim. Lors de la sérialisation JSON du JWT, si la valeur est un
     * nombre pur ("123"), JJWT la désérialise en Integer ou Long — jamais en String.
     * Il faut donc lire avec claims.get(claim) → Object et caster.
     */
    private Long extractUserId(Claims claims) {
        Object val = claims.get(CLAIM_NAMEID);

        if (val == null) {
            // Essayer aussi le nom court (certaines versions .NET)
            val = claims.get("nameid");
        }
        if (val == null) {
            val = claims.get("sub");
        }

        if (val == null) return null;

        if (val instanceof Long)    return (Long) val;
        if (val instanceof Integer) return ((Integer) val).longValue();
        if (val instanceof String) {
            try { return Long.parseLong((String) val); }
            catch (NumberFormatException ignored) { return null; }
        }
        return null;
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"erreur\":\"" + message + "\"}");
    }
}
