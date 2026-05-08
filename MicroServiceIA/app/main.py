from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="AI Recommendation Service",
    version="1.0"
)

app.include_router(router)

@app.get("/")
def home():
    return {"message": "AI Service running"}    