from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.models.requests import HistoryCreateRequest
import datetime

router = APIRouter()

@router.post("")
def save_experiment(req: HistoryCreateRequest, db: Session = Depends(get_db)):
    db_exp = models.Experiment(
        name=req.name,
        algorithm=req.algorithm,
        time_quantum=req.time_quantum,
        processes=[p.model_dump() for p in req.processes],
        simulation_result=req.simulation_result.model_dump()
    )
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return {"id": db_exp.id, "status": "saved"}

@router.get("")
def list_experiments(db: Session = Depends(get_db)):
    exps = db.query(models.Experiment).order_by(models.Experiment.created_at.desc()).all()
    return [{
        "id": e.id,
        "name": e.name,
        "algorithm": e.algorithm,
        "created_at": e.created_at.isoformat()
    } for e in exps]

@router.get("/{exp_id}")
def get_experiment(exp_id: int, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter(models.Experiment.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {
        "id": exp.id,
        "name": exp.name,
        "algorithm": exp.algorithm,
        "time_quantum": exp.time_quantum,
        "created_at": exp.created_at.isoformat(),
        "processes": exp.processes,
        "simulation_result": exp.simulation_result
    }

@router.delete("/{exp_id}")
def delete_experiment(exp_id: int, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter(models.Experiment.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(exp)
    db.commit()
    return {"status": "deleted"}
