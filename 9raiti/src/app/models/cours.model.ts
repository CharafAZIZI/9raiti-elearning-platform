// Aligné sur CoursDTO.java + Niveau.java + StatutCours.java
export type Niveau       = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
export type StatutCours  = 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';

export interface CoursDTO {
  idCours?:        number;
  titre:           string;
  description:     string;
  niveau?:         Niveau;
  statut?:         StatutCours;
  dateCreation?:   string;
  nombreInscrits?: number;
  dureeMinutes?:   number;
  filePath?:       string;
  moduleId?:       number;
}
