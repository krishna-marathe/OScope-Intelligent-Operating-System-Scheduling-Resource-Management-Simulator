# OScope Architecture

## 1. System Overview
OScope utilizes a modular monorepo architecture divided primarily into a frontend client and a backend service. 

## 2. Component Architecture

### 2.1 Frontend (React + TypeScript + Vite)
- **Role:** Pure presentation and interaction layer.
- **State Management:** Zustand is used for shared application state (workloads, UI state, algorithm selection) to maintain simplicity and ease of use.
- **Styling:** Tailwind CSS.
- **Constraint:** Zero scheduling computation occurs in the frontend. The backend is the single source of truth.

### 2.2 Backend (FastAPI + Python)
- **Role:** Core orchestrator, API server, and business logic execution.
- **Database:** SQLite managed via SQLAlchemy 2.0. Separated Pydantic schemas handle API validation.
- **Execution:** Synchronous REST API execution. It is modular enough to adopt asynchronous execution in the future.

### 2.3 Scheduling Engine
- **Role:** Pure computation engine located within the backend.
- **Design Pattern:** Strategy Pattern. Algorithms (FCFS, SJF, etc.) implement a common `SchedulerInterface`.
- **Reusability:** Uses a common process schema and simulation result schema for consistent input/output. A central metrics engine is reused across all algorithms.

### 2.4 ML Module
- **Role:** Workload analysis and policy recommendation via Scikit-learn.
- **Pipeline:** Offline training using generated synthetic workloads. The backend loads the serialized model (`.pkl`) for inference only. Training scripts reside in a separate directory (`backend/scripts/`) and are not part of the production inference pipeline.

## 3. Separation of Concerns
The system supports independent testing and parallel development by explicitly defining inputs and outputs between the Frontend, API, ML Module, and Scheduling Engine.
