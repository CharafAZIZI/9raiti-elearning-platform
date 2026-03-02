package com.MicroServiceSpring.MicroServiceSpring.Services;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Repository.CoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor // Injecte automatiquement les dépendances finales
public class CoursServiceImpl implements CoursService {

    private final CoursRepository coursRepository; // Accès à la base de données
    private final String uploadDir = "uploads/"; // Dossier de stockage des fichiers

    // Pour la redéfinition des méthodes qui ont dans CoursService
    // Pour implementation dans notre fichier actuel
    @Override
    public Cours createCours(Cours cours, MultipartFile file) throws IOException {

        if (file != null && !file.isEmpty()) {

            // 1. Chemin complet du dossier uploads
            String uploadDir = System.getProperty("user.dir") + "/uploads/";

            // 2. Créer le dossier s'il n'existe pas
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 3. Générer un nom unique pour le fichier
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            // 4. Sauvegarder le fichier sur le disque
            File destination = new File(uploadDir + fileName);
            file.transferTo(destination);

            // 5. Sauvegarder le chemin du fichier dans l'entité
            cours.setFilePath(fileName);
        }

        return coursRepository.save(cours); // Enregistrer le cours en base
    }

    @Override
    public List<Cours> getAllCours() {
        return coursRepository.findAll(); // Retourner tous les cours
    }

    @Override
    public Cours getCoursById(Long id) {
        return coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé")); // Rechercher un cours par ID
    }
}

