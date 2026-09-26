from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from app.models.schemas import Process

class SimulationRequest(BaseModel):
    algorithm: str = Field(..., description="Algorithm identifier (e.g., FCFS, SJF, SRTF, RR, PRIORITY_NP, PRIORITY_P)")
    processes: List[Process] = Field(..., min_length=1, description="List of processes to simulate")
    time_quantum: Optional[int] = Field(default=None, description="Time quantum for Round Robin")

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v

class ComparisonRequest(BaseModel):
    algorithms: List[str] = Field(..., min_length=1, description="List of algorithms to compare")
    processes: List[Process] = Field(..., min_length=1, description="List of processes to simulate")
    time_quantum: Optional[int] = Field(default=None, description="Time quantum for Round Robin")

    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v
