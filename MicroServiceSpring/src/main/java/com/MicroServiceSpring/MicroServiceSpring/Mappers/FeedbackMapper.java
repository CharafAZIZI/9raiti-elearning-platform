package com.MicroServiceSpring.MicroServiceSpring.Mappers;
import com.MicroServiceSpring.MicroServiceSpring.DTO.FeedbackDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Feedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.StatutFeedback;
import org.springframework.stereotype.Component;

@Component
public class FeedbackMapper {

    public Feedback toEntity(FeedbackDTO dto) {
        Feedback feedback = new Feedback();
        feedback.setEmail(dto.getEmail());
        feedback.setTypeAvis(dto.getTypeAvis());
        feedback.setMessage(dto.getMessage());
        feedback.setCoursId(dto.getCoursId());
        // statut et roleAuteur sont définis côté service, jamais depuis le DTO client
        feedback.setStatut(StatutFeedback.EN_ATTENTE);
        return feedback;
    }

    public FeedbackDTO toDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setIdFeedback(feedback.getIdFeedback());
        dto.setEmail(feedback.getEmail());
        dto.setTypeAvis(feedback.getTypeAvis());
        dto.setMessage(feedback.getMessage());
        dto.setCoursId(feedback.getCoursId());
        dto.setRoleAuteur(feedback.getRoleAuteur());
        dto.setStatut(feedback.getStatut());
        dto.setReponseAdmin(feedback.getReponseAdmin());
        dto.setDateCreation(feedback.getDateCreation());
        dto.setDateTraitement(feedback.getDateTraitement());
        return dto;
    }
}
