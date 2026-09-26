from fastapi import APIRouter
from app.api.endpoints import health, simulate, compare, history, recommend

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(simulate.router, tags=["Simulation"])
api_router.include_router(compare.router, tags=["Comparison"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
api_router.include_router(recommend.router, prefix="/recommend", tags=["Recommend"])
