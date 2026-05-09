from app.services.dataset_service import DatasetService
from app.ml.model import ModelService
from app.services.cold_start_service import ColdStartService
from app.services.hybrid_service import HybridService
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class RecommendationService:

    def __init__(self):
        self.dataset_service = DatasetService()
        self.model_service = ModelService()
        self.cold_start = ColdStartService()
        self.hybrid = HybridService()

    # ───────────────────────── TRAIN ─────────────────────────
    def train_model(self):
        df = self.dataset_service.fetch_dataset()

        # user-item matrix
        matrix = df.pivot_table(
            index="userId",
            columns="coursId",
            values="score"
        ).fillna(0)

        # ✅ FIX: vraie cosine similarity (normalisée), pas produit scalaire brut
        similarity = cosine_similarity(matrix.values)

        # Popularité par cours (somme des scores normalisée 0-1)
        popularity = df.groupby("coursId")["score"].sum()
        popularity = (popularity - popularity.min()) / (popularity.max() - popularity.min() + 1e-9)

        # Score de contenu : moyenne par cours (proxy simple)
        content = df.groupby("coursId")["score"].mean()
        content = (content - content.min()) / (content.max() - content.min() + 1e-9)

        self.model_service.train(matrix, similarity, popularity, content)

        return {
            "message": "Model trained successfully",
            "users": int(len(matrix)),
            "courses": int(len(matrix.columns))
        }

    # ───────────────────── RECOMMEND ─────────────────────────
    def get_recommendations(self, user_id: int, top_n: int = 5):
        try:
            model = self.model_service.load_model()
        except Exception:
            # Auto-train si le modèle n'existe pas encore
            self.train_model()
            model = self.model_service.load_model()

        matrix     = model["matrix"]
        similarity = model["similarity"]
        popularity = model["popularity"]
        content    = model["content"]

        # ❄ Cold start : utilisateur inconnu
        if user_id not in matrix.index:
            df = self.dataset_service.fetch_dataset()
            return {
                "userId": user_id,
                "type": "cold_start",
                "recommendations": self.cold_start.recommend(df, top_n)
            }

        user_idx = matrix.index.get_loc(user_id)

        # Cours déjà consultés par l'utilisateur (score > 0) → à exclure
        already_seen = set(matrix.columns[matrix.iloc[user_idx] > 0])

        sim_scores   = similarity[user_idx]
        # top 10 voisins les plus proches (excluant l'utilisateur lui-même)
        neighbor_idxs = np.argsort(sim_scores)[::-1][1:11]

        collab_scores: dict[int, float] = {}
        for n_idx in neighbor_idxs:
            neighbor_id = matrix.index[n_idx]
            weight      = sim_scores[n_idx]
            for course_id, score in matrix.loc[neighbor_id].items():
                if score > 0 and course_id not in already_seen:
                    collab_scores[course_id] = collab_scores.get(course_id, 0.0) + weight * score

        if not collab_scores:
            # Fallback popularité si aucun voisin n'a de nouveaux cours
            df = self.dataset_service.fetch_dataset()
            return {
                "userId": user_id,
                "type": "popularity_fallback",
                "recommendations": self.cold_start.recommend(df, top_n)
            }

        # Normaliser les scores collaboratifs
        max_collab = max(collab_scores.values()) or 1.0

        result = []
        for course_id, collab in collab_scores.items():
            c_norm = collab / max_collab
            p_norm = float(popularity.get(course_id, 0.0))
            cnt_norm = float(content.get(course_id, 0.0))

            # ✅ Hybrid scoring (HybridService enfin utilisé !)
            final_score = self.hybrid.compute(c_norm, cnt_norm, p_norm)

            result.append({
                "coursId": int(course_id),
                "score": round(final_score, 4),
                "details": {
                    "collaborative": round(c_norm, 4),
                    "content":       round(cnt_norm, 4),
                    "popularity":    round(p_norm, 4)
                }
            })

        result.sort(key=lambda x: x["score"], reverse=True)

        return {
            "userId": user_id,
            "type": "hybrid",
            "recommendations": result[:top_n]
        }