from pydantic import BaseModel, Field, model_validator
from typing import List, Optional

class ResourceRequest(BaseModel):
    process_id: int
    request: List[int]

class DeadlockSimulationRequest(BaseModel):
    process_count: int = Field(..., gt=0)
    resource_count: int = Field(..., gt=0)
    available: List[int]
    allocation: List[List[int]]
    maximum: List[List[int]]
    resource_request: Optional[ResourceRequest] = None

    @model_validator(mode='after')
    def validate_matrices(self):
        if len(self.available) != self.resource_count:
            raise ValueError("Available array size must match resource_count")
        
        if len(self.allocation) != self.process_count:
            raise ValueError("Allocation matrix must have process_count rows")
        if len(self.maximum) != self.process_count:
            raise ValueError("Max matrix must have process_count rows")
            
        for i in range(self.process_count):
            if len(self.allocation[i]) != self.resource_count:
                raise ValueError(f"Allocation row {i} must have resource_count columns")
            if len(self.maximum[i]) != self.resource_count:
                raise ValueError(f"Max row {i} must have resource_count columns")
                
            for j in range(self.resource_count):
                if self.allocation[i][j] < 0:
                    raise ValueError("Allocation values must be non-negative")
                if self.maximum[i][j] < 0:
                    raise ValueError("Max values must be non-negative")
                if self.allocation[i][j] > self.maximum[i][j]:
                    raise ValueError(f"Allocation cannot exceed Max for process {i}, resource {j}")
                    
        for r in self.available:
            if r < 0:
                raise ValueError("Available values must be non-negative")
                
        if self.resource_request:
            if self.resource_request.process_id < 0 or self.resource_request.process_id >= self.process_count:
                raise ValueError("Invalid process_id in resource_request")
            if len(self.resource_request.request) != self.resource_count:
                raise ValueError("Resource request size must match resource_count")
            for r in self.resource_request.request:
                if r < 0:
                    raise ValueError("Resource request values must be non-negative")
                    
        return self

class SafetyStep(BaseModel):
    step_number: int
    process_id: int
    work_before: List[int]
    need: List[int]
    can_execute: bool
    work_after: List[int]
    finish_status: List[bool]

class ProcessState(BaseModel):
    process_id: int
    allocation: List[int]
    maximum: List[int]
    need: List[int]
    finished: bool

class DeadlockSimulationResult(BaseModel):
    is_safe: bool
    safe_sequence: List[int]
    available_after_simulation: List[int]
    need_matrix: List[List[int]]
    process_states: List[ProcessState]
    safety_steps: List[SafetyStep]
    request_approved: Optional[bool] = None
    request_reason: Optional[str] = None
