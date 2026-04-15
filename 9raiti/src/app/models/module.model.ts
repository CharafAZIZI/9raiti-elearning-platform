import { CoursDTO } from './cours.model';

export type StatutModule = 'ACTIF' | 'BROUILLON' | 'ARCHIVE';

// Aligné sur ModuleDTO.java
export interface ModuleDTO {
  id?:           number;
  nom:           string;
  description:   string;
  code:          string;
  actif:         boolean;       // true = ACTIF côté backend (rétrocompatibilité)
  statut?:       StatutModule;  // ACTIF | BROUILLON | ARCHIVE
  categorieId?:  number;
  cours?:        CoursDTO[];
}
