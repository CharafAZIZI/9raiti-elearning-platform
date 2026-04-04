import { CoursDTO } from './cours.model';

// Aligné sur ModuleDTO.java
// Module.java a un @ManyToOne categorie → on ajoute categorieId
// GET response inclut List<CoursDTO> cours
export interface ModuleDTO {
  id?:           number;
  nom:           string;
  description:   string;
  code:          string;
  actif:         boolean;
  categorieId?:  number;
  cours?:        CoursDTO[];
}
