from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class MemorySimulationRequest(BaseModel):
    reference_sequence: List[int]
    frame_count: int = Field(..., gt=0)
    algorithm: str

    @field_validator('reference_sequence')
    def check_sequence(cls, v):
        if len(v) == 0:
            raise ValueError("reference_sequence cannot be empty")
        if any(ref < 0 for ref in v):
            raise ValueError("reference sequence must contain non-negative integers")
        return v

class PageReferenceStep(BaseModel):
    reference: int
    is_hit: bool
    replaced_page: Optional[int] = None
    frames: List[Optional[int]]

class MemorySimulationResult(BaseModel):
    algorithm: str
    reference_sequence: List[int]
    frame_count: int
    steps: List[PageReferenceStep]
    page_faults: int
    page_hits: int
    hit_ratio: float
    fault_ratio: float
    total_references: int
