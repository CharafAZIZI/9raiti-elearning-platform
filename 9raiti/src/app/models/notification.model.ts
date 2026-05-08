export type NotificationType =
  | 'COURS_CREE' | 'COURS_PUBLIE' | 'COURS_ARCHIVE' | 'COURS_SUPPRIME'
  | 'MODULE_CREE' | 'MODULE_SUPPRIME'
  | 'CATEGORIE_CREE' | 'CATEGORIE_SUPPRIME'
  | 'INSCRIPTION_CREE' | 'INSCRIPTION_SUPPRIMEE'
  | 'USER_VALIDE' | 'USER_REJETE' | 'USER_CREE'
  | 'INTERACTION_LIKE' | 'INTERACTION_COMMENTAIRE' | 'INTERACTION_NOTE'
  | 'MAINTENANCE' | 'ALERTE' | 'MISE_A_JOUR' | 'INFO';

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
  lue: boolean;
}

export interface BroadcastRequest {
  message: string;
  type: 'INFO' | 'MAINTENANCE' | 'ALERTE' | 'MISE_A_JOUR';
  cible: 'TOUS' | 'APPRENANTS' | 'ENSEIGNANTS';
}
