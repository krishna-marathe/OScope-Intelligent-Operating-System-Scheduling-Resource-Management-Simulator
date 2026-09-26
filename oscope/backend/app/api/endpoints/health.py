from fastapi import APIRouter
from app.scheduling.registry import SchedulingAlgorithmRegistry

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0",
        "scheduling_engine": "available"
    }
