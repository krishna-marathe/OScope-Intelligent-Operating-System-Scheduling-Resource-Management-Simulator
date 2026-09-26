
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any, Dict

class Process(BaseModel):
    id: str
    arrival_time: int = Field(..., ge=0)
    burst_time: int = Field(..., gt=0)
    priority: int = 0  # Lower number = higher priority by convention

class GanttEvent(BaseModel):
    process_id: str
    start_time: int
    end_time: int
    queue_id: Optional[int] = None

class ProcessMetrics(BaseModel):
    process_id: str
    completion_time: int
    turnaround_time: int
    waiting_time: int
    response_time: int

class SimulationMetrics(BaseModel):
    process_metrics: List[ProcessMetrics]
    average_turnaround_time: float
    average_waiting_time: float
    average_response_time: float
    cpu_utilization: float
    throughput: float

class SimulationResult(BaseModel):
    gantt_chart: List[GanttEvent]
    metrics: SimulationMetrics
