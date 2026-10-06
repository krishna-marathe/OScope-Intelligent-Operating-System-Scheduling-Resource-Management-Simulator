from abc import ABC, abstractmethod
from typing import List, Tuple
from app.models.disk_schemas import DiskMovementStep

class DiskSchedulingAlgorithm(ABC):
    @abstractmethod
    def simulate(self, request_queue: List[int], initial_head_position: int, disk_size: int, direction: str = "RIGHT") -> Tuple[List[int], List[DiskMovementStep]]:
        """
        Returns a tuple of (service_order, movement_steps)
        """
        pass
