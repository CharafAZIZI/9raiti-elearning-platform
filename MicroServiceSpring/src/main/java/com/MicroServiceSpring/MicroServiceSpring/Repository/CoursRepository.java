package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {

    List<Cours> findByModuleId(Long moduleId);

    List<Cours> findByStatut(String statut);
}
