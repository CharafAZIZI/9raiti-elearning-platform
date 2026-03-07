package com.MicroServiceSpring.MicroServiceSpring.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "cours")
@Getter
@Setter // Lombok génère tous les getters et setters
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

    @ManyToOne
    @JoinColumn(name = "module_id") // Clé étrangère
    private Module module;
}