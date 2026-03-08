package com.MicroServiceSpring.MicroServiceSpring.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "cours")
@Getter
@Setter
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cours")
    private Long idCours;

    @Column(nullable = false, length = 150)
    private String titre;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Niveau niveau;

    @Enumerated(EnumType.STRING)
    private StatutCours statut;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    private Integer nombreInscrits;

    private Integer dureeMinutes;

    @Column(name = "file_path")
    private String filePath;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private Module module;
}