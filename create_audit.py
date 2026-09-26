import os

files = {
    ".gitignore": """\
node_modules/
dist/
venv/
__pycache__/
*.pyc
oscope.db
.pytest_cache/
coverage/
.env
""",
    "README.md": """\
# OScope: Intelligent CPU Scheduling Simulator

OScope is an educational web application for simulating, comparing, and analyzing CPU scheduling algorithms. 
It features a fast Python backend engine, a modern interactive React frontend, historical experiment persistence, and an ML-based algorithm recommender.

## 🚀 Features
- **Algorithms Supported:** FCFS, SJF (Non-preemptive), SRTF (Preemptive), Round Robin, Priority (Preemptive & Non-preemptive).
- **Interactive Gantt Chart:** Play, pause, step, and analyze process schedules.
- **Algorithm Comparison:** Compare metrics across multiple algorithms for the same workload simultaneously.
- **Experiment History:** Save completed simulations to an SQLite database and reload them later.
- **ML Recommender:** Suggests the best algorithm for your workload based on a trained scikit-learn Random Forest model.

## 🛠️ Project Structure
- `oscope/backend/` - FastAPI application, Scheduling Engine, ML Pipeline, and SQLite Database.
- `oscope/frontend/` - React, TypeScript, Vite, Zustand, and Tailwind CSS.

## 💻 Setup & Installation (Windows)

### 1. Backend (FastAPI & Python)
Open PowerShell and run:
```powershell
cd oscope\\backend
python -m venv venv
.\\venv\\Scripts\\activate
pip install fastapi uvicorn sqlalchemy pydantic pytest httpx scikit-learn joblib numpy
```

### 2. Frontend (React & Vite)
Open a separate PowerShell terminal and run:
```powershell
cd oscope\\frontend
npm install
```

## 🏃 Running the Application

### Start the Backend
```powershell
cd oscope\\backend
.\\venv\\Scripts\\activate
uvicorn app.main:app --reload
```
The backend API and Swagger Docs will be available at `http://127.0.0.1:8000/docs`.

### Start the Frontend
```powershell
cd oscope\\frontend
npm run dev
```
The application UI will be available at `http://localhost:5173`.

## 🧪 Testing

### Backend Regression Tests
Runs the entire scheduling engine validation, API endpoints, ML pipeline, and DB persistence isolated tests:
```powershell
cd oscope\\backend
.\\venv\\Scripts\\activate
python -m pytest tests/
```

### Frontend Integration Tests
Runs the Vitest suite verifying components, store states, and mock API interactions:
```powershell
cd oscope\\frontend
npm run test
```

## 🧠 ML Recommendation Model
The ML recommender is backed by an offline-trained Random Forest model stored at `oscope/backend/app/ml/model.joblib`.
To retrain the model with new synthetic workloads:
```powershell
cd oscope\\backend
.\\venv\\Scripts\\activate
python -m app.ml.train
```
*Note: The recommendation is an approximate prediction, not a mathematical guarantee of optimality.*
"""
}

for path, content in files.items():
    full_path = os.path.join("oscope", path)
    with open(full_path, "w") as f:
        f.write(content)
