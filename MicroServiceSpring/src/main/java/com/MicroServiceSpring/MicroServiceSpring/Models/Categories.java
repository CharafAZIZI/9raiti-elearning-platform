package com.MicroServiceSpring.MicroServiceSpring.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
public class Categories {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String description;

    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    private List<Module> modules;
}