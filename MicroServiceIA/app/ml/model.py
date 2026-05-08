import joblib
import os

class ModelService:

    def train(self, matrix, similarity):

        model = {
            "matrix": matrix,
            "similarity": similarity
        }

        joblib.dump(model, "model.pkl")

        return model

    def load_model(self):

        if not os.path.exists("model.pkl"):
            raise Exception("Model not trained yet")

        return joblib.load("model.pkl")