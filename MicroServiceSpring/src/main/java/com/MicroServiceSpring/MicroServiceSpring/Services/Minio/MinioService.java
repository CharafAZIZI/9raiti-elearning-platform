package com.MicroServiceSpring.MicroServiceSpring.Services.Minio;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class MinioService {

    private final S3Client s3Client;

    @Value("${minio.bucket}")
    private String bucketName;

    /**
     * Upload un fichier vers MinIO.
     * @return le nom unique du fichier stocké (à sauvegarder dans Cours.filePath)
     */
    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build(),
            RequestBody.fromBytes(file.getBytes())
        );

        return fileName;
    }

    /**
     * Télécharge un fichier depuis MinIO.
     * @return les bytes du fichier
     */
    public byte[] downloadFile(String fileName) throws IOException {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        return s3Client.getObject(request).readAllBytes();
    }
}
