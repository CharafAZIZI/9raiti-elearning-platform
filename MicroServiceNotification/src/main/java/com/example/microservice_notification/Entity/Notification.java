package com.example.microservice_notification.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;  // null = broadcast global

    private String title;
    private String message;
    private String type;  // COURS_CREE, INTERACTION_LIKE, INFO, MAINTENANCE, etc.

    @Column(name = "is_read")
    private boolean isRead;

    @Column(name = "cible")
    private String cible;  // TOUS | APPRENANTS | ENSEIGNANTS (null = ciblé userId spécifique)

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}