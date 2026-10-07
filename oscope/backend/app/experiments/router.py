from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/experiments")

class ExperimentModel(BaseModel):
    id: str
    name: str
    description: str
    domain: str
    status: str

@router.get("/")
def list_experiments():
    return {"experiments": []}

@router.post("/")
def create_experiment(exp: dict):
    return {"status": "success", "id": "exp-123"}

@router.post("/{id}/run")
def run_experiment(id: str):
    # This invokes actual simulation APIs
    return {"status": "success", "result": "Simulation triggered"}