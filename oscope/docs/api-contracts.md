# API Contracts

## 1. Common Schemas

### 1.1 Process Schema
All endpoints accept processes in the following format:
```json
{
  "id": "string",
  "arrival_time": "integer (>= 0)",
  "burst_time": "integer (> 0, ignored if sequence is provided)",
  "priority": "integer (optional, default 0)",
  "burst_sequence": "array of int (optional, odd length, begins/ends with CPU, alternating I/O)"
}
```
*Validation:* 
- `burst_time` must be strictly positive.
- `arrival_time` cannot be negative.
- Duplicate `id` values within the same request are rejected.

### 1.2 Simulation Result Schema
Algorithms return consistent Gantt events and metrics:
```json
{
  "gantt_chart": [
    {
      "process_id": "string (or 'IDLE', 'CS')",
      "start_time": "integer",
      "end_time": "integer",
      "event_type": "string ('CPU', 'IO', 'IDLE', 'CS')"
    }
  ],
  "metrics": {
    "process_metrics": [
      {
        "process_id": "string",
        "completion_time": "integer",
        "turnaround_time": "integer",
        "waiting_time": "integer",
        "response_time": "integer",
        "io_time": "integer",
        "blocked_time": "integer"
      }
    ],
    "average_turnaround_time": "float",
    "average_waiting_time": "float",
    "average_response_time": "float",
    "cpu_utilization": "float",
    "throughput": "float",
    "io_utilization": "float",
    "total_makespan": "integer"
  }
}
```

## 2. API Endpoints (v1)

### 2.1 `GET /api/v1/health`
Health-check endpoint for application monitoring.
**Response (200 OK):**
```json
{
  "status": "ok",
  "version": "1.0",
  "scheduling_engine": "available"
}
```

### 2.2 `POST /api/v1/simulate`
Executes a scheduling simulation.

**Request Body (`SimulationRequest`):**
```json
{
  "algorithm": "string (e.g., 'FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY_NP', 'PRIORITY_P')",
  "time_quantum": "integer (optional, required if algorithm is 'RR')",
  "processes": [
    { "id": "P1", "arrival_time": 0, "burst_time": 5 }
  ]
}
```

**Response (200 OK):**
Returns the `Simulation Result Schema`.

**Error Responses:**
- `400 Bad Request`: If algorithm is unsupported, or `time_quantum` is missing/invalid for `RR`.
- `422 Unprocessable Entity`: If `processes` list is empty, contains duplicate IDs, or breaks schema validation (e.g., negative burst times).

### 2.3 `POST /api/v1/compare`
Executes the same workload against multiple scheduling algorithms simultaneously for comparison.

**Request Body (`ComparisonRequest`):**
```json
{
  "algorithms": ["FCFS", "RR", "SRTF"],
  "time_quantum": 2,
  "processes": [
    { "id": "P1", "arrival_time": 0, "burst_time": 5 }
  ]
}
```

**Response (200 OK):**
Returns a dictionary mapping the requested algorithm names to their respective `Simulation Result Schema`.
```json
{
  "FCFS": { /* Simulation Result Schema */ },
  "RR": { /* Simulation Result Schema */ },
  "SRTF": { /* Simulation Result Schema */ }
}
```
**Error Responses:**
Matches the validation and error conditions of `/api/v1/simulate`.

### 2.4 `POST /api/v1/recommend`
*(To be implemented in ML phase)*

### 2.5 `GET /api/v1/history`
*(To be implemented in DB phase)*


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
