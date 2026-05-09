import joblib
import os


class ModelService:

    MODEL_PATH = "model.pkl"

    def train(self, matrix, similarity, popularity, content):
        model = {
            "matrix":     matrix,
            "similarity": similarity,
            "popularity": popularity,   # ✅ ajouté
            "content":    content,      # ✅ ajouté
        }
        joblib.dump(model, self.MODEL_PATH)
        return model

    def load_model(self):
        if not os.path.exists(self.MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at '{self.MODEL_PATH}'. "
                "Call POST /train first."
            )
        return joblib.load(self.MODEL_PATH) 