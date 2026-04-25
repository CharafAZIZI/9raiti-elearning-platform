package com.MicroServiceSpring.MicroServiceSpring.Models.Inscriptions;

import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "inscription",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_inscription_apprenant_module",
        columnNames = {"apprenant_id", "module_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
public class Inscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID de l'apprenant (claim NameIdentifier du JWT .NET) */
    @Column(name = "apprenant_id", nullable = false)
    private Long apprenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "date_inscription", nullable = false)
    private LocalDateTime dateInscription;

    @PrePersist
    protected void onCreate() {
        this.dateInscription = LocalDateTime.now();
    }
}
