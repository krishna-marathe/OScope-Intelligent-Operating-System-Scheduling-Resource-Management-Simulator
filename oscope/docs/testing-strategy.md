# Testing Strategy

## 1. Overview
Ensuring correctness in a CPU simulator is critical. OScope adopts a rigorous testing strategy splitting responsibilities across the frontend and backend.

## 2. Backend Testing (Pytest)
- **Framework:** Pytest.
- **Scheduling Engine (Unit Tests):** 
  - Every algorithm has a dedicated test suite covering its specific logic.
  - Expanded coverage includes: simultaneous arrivals, preemption boundaries, idle periods, invalid quantum values, and tie-breaking scenarios (SJF multiple ready, SRTF equal remaining times, RR queue ordering).
  - Centralized metrics engine is tested to rigorously verify Completion Time, Turnaround Time, Waiting Time, Response Time, CPU Utilization, and Throughput calculations.
  - Invalid inputs (negative burst time, zero quantum) trigger `ValidationError` or explicit exceptions.
- **ML Module:** 
  - Test feature extraction logic.
  - Verify that the model loads correctly and inference outputs the expected schema.
- **API (Integration Tests):** 
  - Use FastAPI's `TestClient` to validate endpoint contracts (`/simulate`, `/recommend`).
  - Validate input boundary conditions (e.g., negative burst times, empty workloads).

## 3. Frontend Testing (Vitest & React Testing Library)
- **Framework:** Vitest + RTL.
- **State Management:** 
  - Test Zustand store actions (adding processes, updating configuration).
- **Component Tests:** 
  - Render Gantt chart with mock API simulation results to ensure accurate visual layout.
  - Test form validations (preventing invalid process inputs).
- **API Integration:** 
  - Mock API responses to test how the UI handles successful simulations and network errors.

## 4. Continuous Integration (Future)
- Ensure tests are structured to seamlessly plug into GitHub Actions, enforcing tests pass before any branch is merged.
