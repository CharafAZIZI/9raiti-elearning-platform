package com.MicroServiceSpring.MicroServiceSpring.Models;

import jakarta.persistence.*;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "module")
@Getter
@Setter
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

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categories categorie;

    @OneToMany(mappedBy = "module", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cours> cours;
}