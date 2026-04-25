import { ModuleDTO } from './module.model';

export interface InscriptionDTO {
  id: number;
  apprenantId: number;
  module: ModuleDTO;
  dateInscription: string; // ISO 8601 — ex: "2025-04-25T10:30:00"
}
