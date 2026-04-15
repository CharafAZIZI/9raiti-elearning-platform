package com.MicroServiceSpring.MicroServiceSpring.Models.Cours;

import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "cours")
@Getter
@Setter
@NoArgsConstructor
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

    // CORRECTION : StatutCours est un enum — ne pas le stocker/comparer comme String
    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutCours statut;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    private Integer nombreInscrits;

    private Integer dureeMinutes;

    @Column(name = "file_path")
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;
}
