// Aligné sur CategoriesDTO.java
// POST/PUT body : { nom, description }
// GET response  : { id, nom, description }
export interface CategorieDTO {
  id?:          number;
  nom:          string;
  description?: string;
}
