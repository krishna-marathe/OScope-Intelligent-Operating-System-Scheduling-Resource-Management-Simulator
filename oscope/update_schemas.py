import os

backend_dir = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP\oscope\backend"

schemas_code = """
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
"""

requests_code = """
from pydantic import BaseModel, Field, field_validator, root_validator, model_validator
from typing import List, Optional, Any, Dict
from app.models.schemas import Process, SimulationResult

class QueueConfig(BaseModel):
    id: int
    priority: int
    policy: str = Field(..., pattern="^(RR|FCFS)$")
    time_quantum: Optional[int] = None

    @model_validator(mode='after')
    def check_rr_quantum(self):
        if self.policy == "RR" and (self.time_quantum is None or self.time_quantum <= 0):
            raise ValueError("RR policy requires a positive time_quantum")
        return self

class MLQConfig(BaseModel):
    queues: List[QueueConfig] = Field(..., min_length=1)
    process_assignments: Dict[str, int]
    inter_queue_policy: str = "FIXED_PRIORITY"

    @model_validator(mode='after')
    def validate_assignments(self):
        q_ids = {q.id for q in self.queues}
        for p_id, q_id in self.process_assignments.items():
            if q_id not in q_ids:
                raise ValueError(f"Process {p_id} assigned to invalid queue {q_id}")
        return self

class MLFQConfig(BaseModel):
    queues: List[QueueConfig] = Field(..., min_length=2)
    boost_interval: Optional[int] = None

class SimulationRequest(BaseModel):
    algorithm: str = Field(..., description="Algorithm identifier")
    processes: List[Process] = Field(..., min_length=1)
    time_quantum: Optional[int] = Field(default=None)
    context_switch_cost: Optional[int] = Field(default=0)
    mlq_config: Optional[MLQConfig] = Field(default=None)
    mlfq_config: Optional[MLFQConfig] = Field(default=None)

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
    context_switch_cost: Optional[int] = Field(default=0)
    mlq_config: Optional[MLQConfig] = Field(default=None)
    mlfq_config: Optional[MLFQConfig] = Field(default=None)

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

class RecommendRequest(BaseModel):
    processes: List[Process] = Field(..., min_length=1)
    objective: str = Field("awt", description="Optimization objective, e.g. awt")
    
    @field_validator('processes')
    def check_duplicate_ids(cls, v):
        ids = [p.id for p in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Duplicate process IDs are not allowed')
        return v
"""

with open(os.path.join(backend_dir, "app/models/schemas.py"), "w") as f:
    f.write(schemas_code)

with open(os.path.join(backend_dir, "app/models/requests.py"), "w") as f:
    f.write(requests_code)
