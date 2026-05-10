package com.example.microservice_notification.Repository;

import com.example.microservice_notification.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdIsNullOrderByCreatedAtDesc();

    // Broadcast ciblé par rôle (APPRENANTS ou ENSEIGNANTS)
    List<Notification> findByUserIdIsNullAndCibleOrderByCreatedAtDesc(String cible);

    // Broadcast global TOUS (cible = 'TOUS' ou null)
    List<Notification> findByUserIdIsNullAndCibleIsNullOrderByCreatedAtDesc();

    void deleteByUserId(Long userId);
}