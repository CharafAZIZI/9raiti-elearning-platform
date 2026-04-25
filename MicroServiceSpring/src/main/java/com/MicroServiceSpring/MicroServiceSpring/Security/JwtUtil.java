package com.MicroServiceSpring.MicroServiceSpring.Security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilitaire pour extraire l'ID et le rôle de l'utilisateur connecté
 * depuis le SecurityContext (peuplé par JwtAuthenticationFilter).
 */
public class JwtUtil {

    private JwtUtil() {}

    /**
     * Retourne l'ID de l'utilisateur connecté (stocké dans auth.getDetails() par le filtre).
     * Retourne null si non authentifié ou si l'ID n'est pas disponible.
     */
    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object details = auth.getDetails();
        if (details instanceof Long) return (Long) details;
        return null;
    }

    /**
     * Vérifie si l'utilisateur connecté a le rôle ADMIN.
     */
    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
