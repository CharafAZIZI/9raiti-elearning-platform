package com.MicroServiceSpring.MicroServiceSpring.Services.Notifications;

import com.MicroServiceSpring.MicroServiceSpring.DTO.event.AdminBroadcastEvent;
import com.MicroServiceSpring.MicroServiceSpring.kafka.producer.EventProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminNotificationService implements IAdminNotificationService {

    private final EventProducer notificationProducer;

    @Override
    public void sendBroadcast(String message, String type, String cible) {
        notificationProducer.sendAdminBroadcast(
                new AdminBroadcastEvent(
                        "Annonce de l'administrateur",
                        message,
                        type,
                        cible
                )
        );
    }
}