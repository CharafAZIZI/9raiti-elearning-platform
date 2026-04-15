package com.MicroServiceSpring.MicroServiceSpring.MinioConfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class MinioConfig {

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.public-url}")
    private String minioPublicUrl;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    private StaticCredentialsProvider credentialsProvider() {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)
        );
    }

    private S3Configuration s3Config() {
        return S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .endpointOverride(URI.create(minioUrl))
                .region(Region.US_EAST_1)
                .credentialsProvider(credentialsProvider())
                .serviceConfiguration(s3Config())
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .build();
    }

    // Presigner interne (non utilisé pour les URLs publiques)
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(URI.create(minioUrl))
                .region(Region.US_EAST_1)
                .credentialsProvider(credentialsProvider())
                .serviceConfiguration(s3Config())
                .build();
    }

    // ✅ Presigner public : signe directement avec localhost:9002
    @Bean
    public S3Presigner s3PublicPresigner() {
        return S3Presigner.builder()
                .endpointOverride(URI.create(minioPublicUrl))
                .region(Region.US_EAST_1)
                .credentialsProvider(credentialsProvider())
                .serviceConfiguration(s3Config())
                .build();
    }
}