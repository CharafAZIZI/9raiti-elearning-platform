export interface CommentaireDTO {
  id?: number;
  coursId: number;
  auteurId?: number;
  auteurNom?: string;
  contenu: string;
  dateCreation?: string;
  note?: number;
}

export interface LikeDTO {
  coursId: number;
  userId?: number;
  liked: boolean;
  totalLikes: number;
}

export interface NoteDTO {
  coursId: number;
  userId?: number;
  note: number;       // 1-5
  moyenneNotes?: number;
  totalNotes?: number;
}

export interface InteractionCoursDTO {
  coursId: number;
  totalLikes: number;
  userALike: boolean;
  noteUtilisateur?: number;
  moyenneNotes?: number;
  totalNotes?: number;
  commentaires: CommentaireDTO[];
}
