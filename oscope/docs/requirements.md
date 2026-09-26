# OScope Requirements

## 1. Product Overview
OScope is an Intelligent CPU Scheduling Simulator with Workload Analysis and ML-Based Scheduling Recommendations, designed as an educational tool.

## 2. Functional Requirements
### 2.1 Scheduling Simulator
- Support multiple scheduling algorithms: FCFS, Non-preemptive SJF, Preemptive SJF (SRTF), Round Robin, Preemptive Priority, Non-preemptive Priority.
- Accept workload configurations containing multiple processes with properties: Arrival Time, Burst Time, Priority (optional).
- Compute scheduling execution timelines (Gantt charts) and detailed performance metrics (Waiting Time, Turnaround Time, CPU Utilization, Throughput).

### 2.2 Workload Analysis & ML Recommendations
- Analyze user-provided workloads to extract features (e.g., burst time variance, average arrival rate).
- Provide an ML-based recommendation (trained offline via Scikit-learn) for the optimal scheduling algorithm based on specific objectives (e.g., minimizing average waiting time).
- Clearly state that ML recommendations are not universally optimal and must be evaluated against actual simulation results.

### 2.3 Experiment History
- Store historical workload configurations, algorithm parameters, and computed results for future retrieval.

## 3. Non-Functional Requirements
- **Performance:** Handle standard educational workloads (relatively small number of processes) using synchronous REST API execution.
- **Modularity:** The scheduling logic, API, ML inference, and frontend UI must be strictly decoupled.
- **Maintainability:** The project must be structured to allow a four-member team to work in parallel independently.

## 4. Constraints
- The frontend must contain absolutely no scheduling computation logic.
- Do not introduce asynchronous task queues (e.g., Celery) at this stage.
- Use SQLite with SQLAlchemy 2.0 for data persistence.
