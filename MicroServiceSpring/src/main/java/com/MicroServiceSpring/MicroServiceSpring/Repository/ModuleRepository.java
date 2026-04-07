package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    boolean existsByCode(String code);

    // Spring Data navigue la relation @ManyToOne avec underscore
    List<Module> findByCategorie_Id(Long categorieId);
}
