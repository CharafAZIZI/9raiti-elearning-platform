package com.MicroServiceSpring.MicroServiceSpring.DTO;

import com.MicroServiceSpring.MicroServiceSpring.Models.StatutFeedback;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO utilisé par l'admin pour répondre à un feedback et changer son statut.
 */
@Data
public class FeedbackReponseDTO {

    @NotNull(message = "Le statut est obligatoire")
    private StatutFeedback statut;

    private String reponseAdmin;
}
