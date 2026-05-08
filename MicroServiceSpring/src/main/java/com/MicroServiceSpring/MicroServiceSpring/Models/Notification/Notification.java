package com.MicroServiceSpring.MicroServiceSpring.Models.Notification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long recipientId; // utilisateur cible (student/teacher)

    private String title;

    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private Long courseId;

    private Long moduleId;

    private boolean readStatus = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
