package com.MicroServiceSpring.MicroServiceSpring.Models;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "cours")
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cours")
    private Long idCours;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private Niveau niveau;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    private Integer nombreInscrits;

    @Column(name = "file_path")
    private String filePath;

    // ===== GETTERS =====

    public Long getIdCours() {
        return idCours;
    }

    public String getTitre() {
        return titre;
    }

    public String getDescription() {
        return description;
    }

    public Niveau getNiveau() {
        return niveau;
    }


    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public Integer getNombreInscrits() {
        return nombreInscrits;
    }

    public String getFilePath() {
        return filePath;
    }

    // ===== SETTERS =====

    public void setIdCours(Long idCours) {
        this.idCours = idCours;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setNiveau(Niveau niveau) {
        this.niveau = niveau;
    }


    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }


    public void setNombreInscrits(Integer nombreInscrits) {
        this.nombreInscrits = nombreInscrits;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
