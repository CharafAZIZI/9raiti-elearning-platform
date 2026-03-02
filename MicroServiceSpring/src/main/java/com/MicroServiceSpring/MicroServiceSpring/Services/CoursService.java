package com.MicroServiceSpring.MicroServiceSpring.Services;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CoursService {

    Cours createCours(Cours cours, MultipartFile file) throws IOException;

    List<Cours> getAllCours();

    Cours getCoursById(Long id);


}
