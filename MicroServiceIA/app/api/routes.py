from fastapi import APIRouter
from app.services.recommendation_service import RecommendationService

router = APIRouter()
service = RecommendationService()

@router.post("/train")
def train_model():
    return service.train_model()

@router.get("/recommend/{user_id}")
def recommend(user_id: int):
    return service.get_recommendations(user_id)