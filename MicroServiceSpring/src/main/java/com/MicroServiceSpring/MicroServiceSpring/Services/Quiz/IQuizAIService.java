package com.MicroServiceSpring.MicroServiceSpring.Services.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuizDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IQuizAIService {
    QuizDTO genererQuizDepuisPdf(
            MultipartFile file,
            Long coursId,
            int nombreQuestions,
            String difficulte,
            String typeQuestions,
            String titre,
            boolean correctionInstantanee,
            boolean randomiserQuestions,
            Long enseignantId
    );
}