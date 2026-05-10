package com.MicroServiceSpring.MicroServiceSpring.Models.Cours;

import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Commentaire;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Like;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Note;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutCours statut;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    private Integer dureeMinutes;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "enseignant_id")
    private Long enseignantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Commentaire> commentaires = new ArrayList<>();

    @OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    @OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Note> notes = new ArrayList<>();

    public Long getId() {
        return idCours;
    }
}