from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional, Literal

class DiskSimulationRequest(BaseModel):
    request_queue: List[int]
    initial_head_position: int = Field(..., ge=0)
    disk_size: int = Field(..., gt=0)
    algorithm: str
    direction: Optional[Literal["LEFT", "RIGHT"]] = "RIGHT"

    @field_validator('request_queue')
    def check_queue(cls, v):
        if len(v) == 0:
            raise ValueError("request_queue cannot be empty")
        if any(req < 0 for req in v):
            raise ValueError("request_queue cannot contain negative cylinders")
        return v
        
    @model_validator(mode='after')
    def check_bounds(self):
        if self.initial_head_position >= self.disk_size:
            raise ValueError("initial_head_position must be within disk bounds")
        if any(req >= self.disk_size for req in self.request_queue):
            raise ValueError("all requests must be within disk bounds")
        return self

class DiskMovementStep(BaseModel):
    start_cylinder: int
    end_cylinder: int
    movement: int

class DiskSimulationResult(BaseModel):
    algorithm: str
    initial_head_position: int
    request_queue: List[int]
    service_order: List[int]
    movement_steps: List[DiskMovementStep]
    total_head_movement: int
    average_head_movement: float
