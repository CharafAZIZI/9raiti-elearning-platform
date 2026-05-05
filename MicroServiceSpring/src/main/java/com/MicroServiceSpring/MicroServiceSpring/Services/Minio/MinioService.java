package com.MicroServiceSpring.MicroServiceSpring.Services.Minio;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
public class MinioService implements IMinioService {

    private final S3Client s3Client;
    private final S3Presigner s3PublicPresigner;

    @Value("${minio.bucket}")
    private String bucketName;

    public MinioService(S3Client s3Client,
                        @Qualifier("s3PublicPresigner") S3Presigner s3PublicPresigner) {
        this.s3Client = s3Client;
        this.s3PublicPresigner = s3PublicPresigner;
    }

    /**
     * Upload un fichier (PDF ou vidéo) vers MinIO.
     */
    public String uploadFile(MultipartFile file) throws IOException {
        ensureBucketExists();

        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        String folder = detectFolder(contentType);
        String safeOriginalName = sanitizeFileName(file.getOriginalFilename());
        String objectKey = folder + "/" + UUID.randomUUID() + "_" + safeOriginalName;

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        return objectKey;
    }

    /**
     * Génère une URL pré-signée valable 15 minutes.
     * Signée directement avec l'URL publique → pas de problème de signature.
     */
    public String generatePresignedUrl(String objectKey) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(r -> r.bucket(bucketName).key(objectKey))
                .build();

        return s3PublicPresigner.presignGetObject(presignRequest).url().toString();
    }

    /**
     * Télécharge un fichier.
     */
    public byte[] downloadFile(String objectKey) throws IOException {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();
        return s3Client.getObject(request).readAllBytes();
    }

    /**
     * Supprime un fichier de MinIO.
     */
    public void deleteFile(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return;
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build());
        } catch (Exception e) {
            System.err.println("[MinioService] Impossible de supprimer : " + objectKey + " - " + e.getMessage());
        }
    }

    // ──────────────── Helpers ────────────────

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
        }
    }

    private String detectFolder(String contentType) {
        if (contentType.startsWith("video/")) return "videos";
        if (contentType.equals("application/pdf")) return "pdfs";
        return "autres";
    }

    private String sanitizeFileName(String originalName) {
        if (originalName == null || originalName.isBlank()) return "fichier";
        return originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}