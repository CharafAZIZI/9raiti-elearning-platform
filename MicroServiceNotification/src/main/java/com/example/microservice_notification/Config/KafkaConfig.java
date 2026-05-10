package com.example.microservice_notification.Config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {
    // ObjectMapper est autoconfigurée par Spring Boot (jackson-datatype-jsr310 est dans le pom.xml)
    // Pas besoin de déclarer un bean manuel
}
