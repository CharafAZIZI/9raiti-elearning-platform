package com.MicroServiceSpring.MicroServiceSpring.Models.Modules;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cetagories.Categories;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Cours;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "module")
@Getter
@Setter
@NoArgsConstructor
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private boolean actif;

    /**
     * ID de l'enseignant propriétaire (claim NameIdentifier du JWT .NET).
     */
    @Column(name = "enseignant_id")
    private Long enseignantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categories categorie;

    @OneToMany(mappedBy = "module", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cours> cours = new ArrayList<>();
}
