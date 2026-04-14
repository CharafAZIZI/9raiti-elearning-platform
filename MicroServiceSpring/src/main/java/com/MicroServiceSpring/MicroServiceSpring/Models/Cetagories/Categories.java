package com.MicroServiceSpring.MicroServiceSpring.Models.Cetagories;

import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Categories {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String description;

    // CORRECTION : initialisation à ArrayList pour éviter NullPointerException
    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    private List<Module> modules = new ArrayList<>();
}
