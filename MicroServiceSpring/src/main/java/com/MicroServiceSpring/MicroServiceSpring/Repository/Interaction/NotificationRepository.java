package com.MicroServiceSpring.MicroServiceSpring.Repository.Interaction;

import com.MicroServiceSpring.MicroServiceSpring.Models.Notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByModuleId(Long moduleId);

    List<Notification> findByCourseId(Long courseId);
}
