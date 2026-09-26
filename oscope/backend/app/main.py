from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.db.database import engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OScope CPU Scheduling API",
    description="Backend API for OScope CPU Scheduling Simulator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
