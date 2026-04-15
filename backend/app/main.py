from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as paramiq_router

app = FastAPI(title="ParamIQ Backend API", description="API MongoDB pour le Moteur de Mapping")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(paramiq_router, tags=["ParamIQ"], prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API de ParamIQ"}

