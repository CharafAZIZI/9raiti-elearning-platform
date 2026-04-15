export interface RegisterUserVM {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  mot_de_passe: string;
  confirmation_mot_de_passe: string;
  role: string;
}
