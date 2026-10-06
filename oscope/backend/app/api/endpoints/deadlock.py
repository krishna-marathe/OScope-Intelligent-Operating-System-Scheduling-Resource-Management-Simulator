from fastapi import APIRouter
from app.models.deadlock_schemas import DeadlockSimulationRequest, DeadlockSimulationResult
from app.deadlock.bankers import BankersAlgorithm

router = APIRouter()

@router.post("/simulate", response_model=DeadlockSimulationResult)
def simulate_deadlock(req: DeadlockSimulationRequest):
    banker = BankersAlgorithm(req)
    return banker.simulate()
