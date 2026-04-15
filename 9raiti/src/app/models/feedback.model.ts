// src/app/models/feedback.model.ts

export type TypeAvis =
  | 'RECLAMATION'
  | 'AVIS_COURS'
  | 'FEEDBACK_PLATEFORME'
  | 'SUGGESTION'
  | 'BUG'
  | 'AUTRE';

export type StatutFeedback =
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'RESOLU'
  | 'REJETE';

export const TYPE_AVIS_LABELS: Record<TypeAvis, string> = {
  RECLAMATION:          'Réclamation',
  AVIS_COURS:           'Avis sur un cours',
  FEEDBACK_PLATEFORME:  'Feedback sur la plateforme',
  SUGGESTION:           "Suggestion d'amélioration",
  BUG:                  'Signalement de bug',
  AUTRE:                'Autre'
};

export const STATUT_LABELS: Record<StatutFeedback, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS:   'En cours',
  RESOLU:     'Résolu',
  REJETE:     'Rejeté'
};

export const STATUT_BADGE: Record<StatutFeedback, string> = {
  EN_ATTENTE: 'badge-warning',
  EN_COURS:   'badge-info',
  RESOLU:     'badge-success',
  REJETE:     'badge-danger'
};

export interface FeedbackDTO {
  idFeedback?: number;
  email: string;
  typeAvis: TypeAvis;
  message: string;
  coursId?: number | null;
  roleAuteur?: string;
  statut?: StatutFeedback;
  reponseAdmin?: string;
  dateCreation?: string;
  dateTraitement?: string;
}

export interface FeedbackReponseDTO {
  statut: StatutFeedback;
  reponseAdmin?: string;
}
