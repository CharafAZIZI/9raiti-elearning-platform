package com.MicroServiceSpring.MicroServiceSpring.Services.Minio;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
 * Contrat du service de stockage de fichiers (MinIO / S3).
 * Injecter cette interface plutôt que MinioService directement.
 */
public interface IMinioService {

    /** Upload un fichier et retourne sa clé d'objet (objectKey). */
    String uploadFile(MultipartFile file) throws IOException;

    /** Génère une URL pré-signée valable 15 minutes. */
    String generatePresignedUrl(String objectKey);

    /** Télécharge un fichier sous forme de tableau d'octets. */
    byte[] downloadFile(String objectKey) throws IOException;

    /** Supprime un fichier. Ne lève pas d'exception si absent. */
    void deleteFile(String objectKey);
}
