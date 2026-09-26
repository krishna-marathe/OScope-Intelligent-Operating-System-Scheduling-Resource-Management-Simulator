from fastapi import APIRouter, HTTPException
from app.models.requests import RecommendRequest
from app.ml.predict import recommend

router = APIRouter()

@router.post("")
def get_recommendation(req: RecommendRequest):
    try:
        res = recommend(req.processes)
        return {
            "algorithm": res["algorithm"],
            "objective": req.objective,
            "version": "1.0",
            "confidence": res["confidence"],
            "explanation": res["explanation"]
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
