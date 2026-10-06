
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any, Dict

class Process(BaseModel):
    id: str
    arrival_time: int = Field(..., ge=0)
    burst_time: int = Field(..., gt=0)
    priority: int = 0  # Lower number = higher priority by convention
    burst_sequence: Optional[List[int]] = None

    @field_validator('burst_sequence')
    def check_burst_sequence(cls, v):
        if v is not None:
            if len(v) == 0:
                raise ValueError("burst_sequence cannot be empty if provided")
            if len(v) % 2 == 0:
                raise ValueError("burst_sequence must start and end with a CPU burst (odd length)")
            if any(b <= 0 for b in v):
                raise ValueError("All burst durations must be positive")
        return v

class LifecycleEvent(BaseModel):
    process_id: str
    state: str
    start_time: int
    end_time: int
    duration: int
    transition_reason: str = ""

class GanttEvent(BaseModel):
    process_id: str
    start_time: int
    end_time: int
    queue_id: Optional[int] = None
    event_type: str = "CPU"

class ProcessMetrics(BaseModel):
    process_id: str
    completion_time: int
    turnaround_time: int
    waiting_time: int
    response_time: int
    io_time: int = 0
    blocked_time: int = 0

class SimulationMetrics(BaseModel):
    process_metrics: List[ProcessMetrics]
    average_turnaround_time: float
    average_waiting_time: float
    average_response_time: float
    cpu_utilization: float
    throughput: float
    io_utilization: float = 0.0
    total_makespan: int = 0

class SimulationResult(BaseModel):
    gantt_chart: List[GanttEvent]
    metrics: SimulationMetrics
    lifecycles: Optional[List[LifecycleEvent]] = None
