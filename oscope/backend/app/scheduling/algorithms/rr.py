from typing import List
from app.models.schemas import Process, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.des_simulator import simulate_des

class RRScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        return simulate_des(processes, "RR", **kwargs)
