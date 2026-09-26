# API Contracts

## 1. Common Schemas

### 1.1 Process Schema
```json
{
  "id": "string",
  "arrival_time": "integer",
  "burst_time": "integer",
  "priority": "integer (optional, default 0)"
}
```

### 1.2 Simulation Result Schema
```json
{
  "gantt_chart": [
    {
      "process_id": "string (or 'IDLE')",
      "start_time": "integer",
      "end_time": "integer"
    }
  ],
  "metrics": {
    "process_metrics": [
      {
        "process_id": "string",
        "completion_time": "integer",
        "turnaround_time": "integer",
        "waiting_time": "integer",
        "response_time": "integer"
      }
    ],
    "average_turnaround_time": "float",
    "average_waiting_time": "float",
    "average_response_time": "float",
    "cpu_utilization": "float",
    "throughput": "float"
  }
}
```

## 2. Endpoints

### 2.1 `POST /api/v1/simulate`
Executes a scheduling simulation.

**Request Body:**
```json
{
  "algorithm": "string (e.g., 'FCFS', 'SRTF', 'RR')",
  "time_quantum": "integer (optional, required for RR)",
  "processes": [ /* Array of Process Schema */ ]
}
```

**Response (200 OK):**
Returns the `Simulation Result Schema`.

### 2.2 `POST /api/v1/recommend`
Provides an ML-based recommendation for the given workload.

**Request Body:**
```json
{
  "objective": "string (e.g., 'minimize_waiting_time')",
  "processes": [ /* Array of Process Schema */ ]
}
```

**Response (200 OK):**
```json
{
  "recommended_algorithm": "string",
  "confidence_score": "float",
  "features_extracted": { /* object */ },
  "disclaimer": "This recommendation is based on ML prediction and is not universally optimal."
}
```

### 2.3 `GET /api/v1/history`
Retrieves past simulation experiments.
**(To be detailed in Phase 1)**
