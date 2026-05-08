from app.services.dataset_service import DatasetService
from app.ml.model import ModelService
from app.services.cold_start_service import ColdStartService
import pandas as pd
import numpy as np

class RecommendationService:

    def __init__(self):
        self.dataset_service = DatasetService()
        self.model_service = ModelService()
        self.cold_start = ColdStartService()

    # ───────────────────────── TRAIN ─────────────────────────
    def train_model(self):

        df = self.dataset_service.fetch_dataset()

        # user-item matrix
        matrix = df.pivot_table(
            index="userId",
            columns="coursId",
            values="score"
        ).fillna(0)

        # similarity (cosine simple)
        similarity = np.dot(matrix.values, matrix.values.T)

        self.model_service.train(matrix, similarity)

        return {
            "message": "Model trained successfully",
            "users": len(matrix),
            "courses": len(matrix.columns)
        }

    # ───────────────────── RECOMMEND ─────────────────────
    def get_recommendations(self, user_id: int):

        model = self.model_service.load_model()

        matrix = model["matrix"]
        similarity = model["similarity"]

        # ❄ cold start
        if user_id not in matrix.index:
            df = self.dataset_service.fetch_dataset()
            return self.cold_start.recommend(df)

        user_idx = matrix.index.get_loc(user_id)

        sim_scores = similarity[user_idx]
        similar_users = np.argsort(sim_scores)[::-1]

        recommendations = {}

        for u in similar_users[1:5]:

            similar_user_id = matrix.index[u]

            for course_id, score in matrix.loc[similar_user_id].items():

                if score > 0:

                    recommendations[course_id] = (
                        recommendations.get(course_id, 0)
                        + sim_scores[u]
                    )

        result = [
            {"coursId": int(k), "score": float(v)}
            for k, v in recommendations.items()
        ]

        result.sort(key=lambda x: x["score"], reverse=True)

        return result[:5]