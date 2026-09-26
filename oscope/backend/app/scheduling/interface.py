from abc import ABC, abstractmethod
from typing import List
from app.models.schemas import Process, SimulationResult

class SchedulerInterface(ABC):
    @abstractmethod
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        """
        Simulate the scheduling of processes.
        Must return a valid SimulationResult with complete gantt chart and metrics.
        """
        pass
