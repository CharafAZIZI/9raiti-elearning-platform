// ── Types énumérés ────────────────────────────────────────────────────────────
export type TypeQuestion = 'QCM' | 'VRAI_FAUX';

// ── DTOs de base ─────────────────────────────────────────────────────────────

export interface ReponseDTO {
  id?: number;
  texte: string;
  estCorrecte: boolean;
  questionId?: number;
}

export interface QuestionDTO {
  id?: number;
  texte: string;
  type: TypeQuestion;
  ordre?: number;
  quizId?: number;
  reponses: ReponseDTO[];
}

export interface ConfigQuizDTO {
  correctionInstantanee: boolean;
  tempsLimiteMinutes?: number | null;
  randomiserQuestions: boolean;
  randomiserReponses: boolean;
}

export interface QuizDTO {
  id?: number;
  titre: string;
  description?: string;
  coursId: number;
  coursTitre?: string;
  config: ConfigQuizDTO;
  questions?: QuestionDTO[];
  nombreQuestions?: number;
  dateCreation?: string;
  actif?: boolean;
}

// ── Tentatives ───────────────────────────────────────────────────────────────

export interface ReponseUtilisateurDTO {
  questionId: number;
  reponseIdSelectionnee: number;
}

export interface SoumettreQuizDTO {
  quizId: number;
  reponses: ReponseUtilisateurDTO[];
}

export interface ResultatReponseDTO {
  questionId: number;
  questionTexte: string;
  reponseSelectionneeId: number;
  reponseSelectionneeTexte: string;
  estCorrecte: boolean;
  reponseCorrecteTexte?: string;
}

export interface TentativeQuizDTO {
  id?: number;
  quizId: number;
  quizTitre?: string;
  utilisateurId?: number;
  utilisateurNom?: string;
  scoreBrut: number;
  scoreSur20: number;
  nombreQuestions: number;
  dateTentative?: string;
  resultats?: ResultatReponseDTO[];
}
