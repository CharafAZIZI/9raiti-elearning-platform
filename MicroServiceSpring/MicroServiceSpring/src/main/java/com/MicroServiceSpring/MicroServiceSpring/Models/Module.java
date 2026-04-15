package com.MicroServiceSpring.MicroServiceSpring.Models;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "module")
@Getter
@Setter
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nom;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private boolean actif;

    @CreationTimestamp
    private LocalDateTime dateCreation;

    private Integer ordre;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categories categorie;

    @OneToMany(mappedBy = "module", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cours> cours;
}