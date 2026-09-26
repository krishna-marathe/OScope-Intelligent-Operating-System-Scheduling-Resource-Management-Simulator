from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from app.models.schemas import Process, SimulationResult

class SimulationRequest(BaseModel):
    algorithm: str = Field(..., description="Algorithm identifier")
    processes: List[Process] = Field(..., min_length=1)
    time_quantum: Optional[int] = Field(default=None)

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v

class ComparisonRequest(BaseModel):
    algorithms: List[str] = Field(..., min_length=1)
    processes: List[Process] = Field(..., min_length=1)
    time_quantum: Optional[int] = Field(default=None)

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v

class HistoryCreateRequest(BaseModel):
    name: str = "Untitled Experiment"
    algorithm: str
    time_quantum: Optional[int] = None
    processes: List[Process]
    simulation_result: SimulationResult
