import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.api.auth import router as auth_router
from app.api.leads import router as leads_router
from app.api.users import router as users_router


# ==========================================================
# DATABASE
# ==========================================================

Base.metadata.create_all(bind=engine)


# ==========================================================
# APPLICATION
# ==========================================================

app = FastAPI(
    title="LeadFlow API",
    description=(
        "Lead Management Platform built for the "
        "Digital Heroes Full Stack Development Task"
    ),
    version="1.0.0",
)


# ==========================================================
# CORS
# ==========================================================

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

frontend_url = os.getenv("FRONTEND_URL")

if frontend_url:
    allowed_origins.append(
        frontend_url.rstrip("/")
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# ROUTERS
# ==========================================================

app.include_router(auth_router)
app.include_router(leads_router)
app.include_router(users_router)


# ==========================================================
# HEALTH
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "LeadFlow API is running",
        "status": "healthy",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }