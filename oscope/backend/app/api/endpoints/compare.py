from fastapi import APIRouter, HTTPException
from typing import Dict
from app.models.requests import ComparisonRequest
from app.models.schemas import SimulationResult
from app.services.simulation import SimulationService

router = APIRouter()

@router.post("/compare", response_model=Dict[str, SimulationResult])
def compare(request: ComparisonRequest):
    try:
        return SimulationService.compare(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
