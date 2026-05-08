package com.MicroServiceSpring.MicroServiceSpring.kafka.producer;

import com.MicroServiceSpring.MicroServiceSpring.DTO.event.AdminBroadcastEvent;
import com.MicroServiceSpring.MicroServiceSpring.DTO.event.CourseContentAddedEvent;
import com.MicroServiceSpring.MicroServiceSpring.DTO.event.CourseInteractionEvent;

public interface EventProducer {
    void sendCourseContent(CourseContentAddedEvent event);
    void sendCourseInteraction(CourseInteractionEvent event);
    void sendAdminBroadcast(AdminBroadcastEvent event);
}