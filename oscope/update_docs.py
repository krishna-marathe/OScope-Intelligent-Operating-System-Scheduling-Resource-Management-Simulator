import os

docs_dir = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP\oscope\docs"

# 1. Update scheduling-design.md
sched_md = os.path.join(docs_dir, "scheduling-design.md")
if os.path.exists(sched_md):
    with open(sched_md, "a") as f:
        f.write("""

## Advanced Scheduling Algorithms (Phase 7A)

### Multilevel Queue (MLQ)
Processes are permanently assigned to one of several queues based on their properties. Each queue can have its own scheduling algorithm (e.g., Round Robin, FCFS). Queues are strictly prioritized (inter-queue policy: FIXED_PRIORITY). A process in a lower-priority queue will only execute if all higher-priority queues are empty. It can be preempted by new arrivals in higher-priority queues.

### Multilevel Feedback Queue (MLFQ)
Similar to MLQ, but processes can move between queues. All processes start in the highest-priority queue. If a process uses its entire time quantum, it is demoted to the next lower-priority queue. An optional `boost_interval` can be configured to periodically promote all processes back to the highest-priority queue to prevent starvation.

### Context-Switch Overhead
A configurable `context_switch_cost` can be specified. This cost is incurred whenever the CPU switches execution from one process to a *different* process. It is recorded as a `CS` event in the Gantt chart and does not count as process execution time or idle time.
""")

# 2. Update api-contracts.md
api_md = os.path.join(docs_dir, "api-contracts.md")
if os.path.exists(api_md):
    with open(api_md, "a") as f:
        f.write("""

## Advanced Scheduling Configurations

### MLQ Configuration
When simulating MLQ, provide an `mlq_config` object in the simulation request:
```json
{
  "algorithm": "MLQ",
  "processes": [...],
  "context_switch_cost": 1,
  "mlq_config": {
    "queues": [
      {"id": 1, "priority": 1, "policy": "RR", "time_quantum": 4},
      {"id": 2, "priority": 2, "policy": "FCFS"}
    ],
    "process_assignments": {"P1": 1, "P2": 2},
    "inter_queue_policy": "FIXED_PRIORITY"
  }
}
```

### MLFQ Configuration
When simulating MLFQ, provide an `mlfq_config` object:
```json
{
  "algorithm": "MLFQ",
  "processes": [...],
  "mlfq_config": {
    "queues": [
      {"id": 1, "priority": 1, "policy": "RR", "time_quantum": 4},
      {"id": 2, "priority": 2, "policy": "RR", "time_quantum": 8},
      {"id": 3, "priority": 3, "policy": "FCFS"}
    ],
    "boost_interval": 20
  }
}
```
""")

# 3. Update README.md
readme_md = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP\oscope\README.md"
if os.path.exists(readme_md):
    with open(readme_md, "a") as f:
        f.write("\n- **Advanced Scheduling**: Multilevel Queue (MLQ) and Multilevel Feedback Queue (MLFQ) with configurable context-switch overhead (Phase 7A).\n")
