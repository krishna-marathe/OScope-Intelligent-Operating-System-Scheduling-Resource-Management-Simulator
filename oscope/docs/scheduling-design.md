# Scheduling Engine Design

## 1. Overview
The Scheduling Engine is designed using the Strategy Pattern to ensure each algorithm is independently testable, strictly decoupled, and conforms to a uniform interface.

## 2. Core Interfaces

### 2.1 `SchedulerInterface`
All algorithms must implement the `SchedulerInterface` base class.

```python
from abc import ABC, abstractmethod
from typing import List
from app.models.schemas import Process, SimulationResult

class SchedulerInterface(ABC):
    @abstractmethod
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        pass
```

### 2.2 Reusable Metrics Engine
Instead of calculating metrics individually in each algorithm, a central metrics engine will compute `waiting_time`, `turnaround_time`, etc., based on the original process list and the generated Gantt chart events.

## 3. Data Models (Pydantic)

- **Process:** `id`, `arrival_time`, `burst_time`, `priority`.
- **GanttEvent:** `process_id`, `start_time`, `end_time`.
- **ProcessMetrics:** `completion_time`, `turnaround_time`, `waiting_time`, `response_time`.
- **SimulationResult:** Combines a `List[GanttEvent]` and overall `metrics`.

## 4. Supported Algorithms (Initial)
1. First-Come, First-Served (FCFS)
2. Shortest Job First (SJF) - Non-preemptive
3. Shortest Remaining Time First (SRTF) - Preemptive
4. Round Robin (RR)
5. Priority Scheduling (Non-preemptive)
6. Priority Scheduling (Preemptive)

## 5. Tie-Breaking Rules & Behavior
To ensure deterministic execution across all simulations:
- **Simultaneous Arrivals:** Tie-broken by `id` (lexicographical order).
- **Equal Parameters (Burst Time / Priority):** Tie-broken by `arrival_time`, then `id`.
- **Round Robin:** Preempted processes are re-queued *after* newly arrived processes at that exact timestamp.
- **IDLE CPU:** Represented explicitly with `IDLE` events in the Gantt chart if no processes are ready.
