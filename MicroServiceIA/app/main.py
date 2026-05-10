from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.services.recommendation_service import RecommendationService

app = FastAPI(
    title="AI Recommendation Service",
    version="2.0",
    description="Hybrid collaborative-filtering recommendation engine for e-learning courses"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[""],
    allow_credentials=True,
    allow_methods=[""],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {"message": "AI Recommendation Service v2 running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def startup_train():
    try:
        service = RecommendationService()
        service.train_model()
        print("✅ Model trained successfully on startup")
    except Exception as e:
        print(f"⚠️ Auto-train failed: {e}")