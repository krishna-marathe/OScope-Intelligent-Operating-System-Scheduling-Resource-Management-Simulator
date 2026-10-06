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

- **Process:** `id`, `arrival_time`, `burst_time`, `priority`, `burst_sequence`.
- **GanttEvent:** `process_id`, `start_time`, `end_time`, `event_type`.
- **ProcessMetrics:** `completion_time`, `turnaround_time`, `waiting_time`, `response_time`, `io_time`, `blocked_time`.
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


## Advanced Scheduling Algorithms (Phase 7A)

### Multilevel Queue (MLQ)
Processes are permanently assigned to one of several queues based on their properties. Each queue can have its own scheduling algorithm (e.g., Round Robin, FCFS). Queues are strictly prioritized (inter-queue policy: FIXED_PRIORITY). A process in a lower-priority queue will only execute if all higher-priority queues are empty. It can be preempted by new arrivals in higher-priority queues.

### Multilevel Feedback Queue (MLFQ)
Similar to MLQ, but processes can move between queues. All processes start in the highest-priority queue. If a process uses its entire time quantum, it is demoted to the next lower-priority queue. An optional `boost_interval` can be configured to periodically promote all processes back to the highest-priority queue to prevent starvation.

### Context-Switch Overhead
A configurable `context_switch_cost` can be specified. This cost is incurred whenever the CPU switches execution from one process to a *different* process. It is recorded as a `CS` event in the Gantt chart and does not count as process execution time or idle time.

### UI Integration and Validation Rules
- **MLQ Validation**: When the MLQ algorithm is selected for comparison or simulation, the system strictly validates that every active process is explicitly assigned to a valid queue. If assignments are missing, the UI proactively blocks submission and displays an actionable error detailing which process IDs are unassigned.
- **Comparison Metrics**: Context switch overhead and counts are derived directly from Gantt events (CS). For consistency with older algorithms, if a history record lacks CS events, these metrics are safely omitted rather than breaking or presenting invalid data.
