from fastapi import APIRouter, Query, HTTPException
from app.services.recommendation_service import RecommendationService

router = APIRouter()
service = RecommendationService()


@router.post("/train", summary="Entraîne le modèle de recommandation")
def train_model():
    try:
        return service.train_model()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/recommend/{user_id}",
    summary="Retourne les N cours recommandés pour un utilisateur"
)
def recommend(
    user_id: int,
    top_n: int = Query(default=5, ge=1, le=20, description="Nombre de recommandations")
):
    try:
        return service.get_recommendations(user_id, top_n=top_n)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))