from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="AI Recommendation Service",
    version="2.0",
    description="Hybrid collaborative-filtering recommendation engine for e-learning courses"
)

# ✅ CORS pour Angular (et l'API Gateway)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {"message": "AI Recommendation Service v2 running"}


# ✅ Healthcheck pour Docker Compose
@app.get("/health")
def health():
    return {"status": "ok"}