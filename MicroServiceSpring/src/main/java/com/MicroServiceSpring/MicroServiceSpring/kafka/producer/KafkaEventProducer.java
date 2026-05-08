package com.MicroServiceSpring.MicroServiceSpring.kafka.producer;

import com.MicroServiceSpring.MicroServiceSpring.DTO.event.AdminBroadcastEvent;
import com.MicroServiceSpring.MicroServiceSpring.DTO.event.CourseContentAddedEvent;
import com.MicroServiceSpring.MicroServiceSpring.DTO.event.CourseInteractionEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaEventProducer implements EventProducer{

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendCourseContent(CourseContentAddedEvent event) {
        kafkaTemplate.send(Topics.COURSE_CONTENT, event);
    }

    public void sendCourseInteraction(CourseInteractionEvent event) {
        kafkaTemplate.send(Topics.COURSE_INTERACTION, event);
    }

    public void sendAdminBroadcast(AdminBroadcastEvent event) {
        kafkaTemplate.send(Topics.ADMIN_BROADCAST, event);
    }
}