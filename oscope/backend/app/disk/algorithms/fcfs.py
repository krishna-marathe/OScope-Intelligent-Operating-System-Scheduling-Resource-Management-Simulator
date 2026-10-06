from typing import List, Tuple
from app.disk.interface import DiskSchedulingAlgorithm
from app.models.disk_schemas import DiskMovementStep

class FCFSAlgorithm(DiskSchedulingAlgorithm):
    def simulate(self, request_queue: List[int], initial_head_position: int, disk_size: int, direction: str = "RIGHT") -> Tuple[List[int], List[DiskMovementStep]]:
        service_order = []
        movement_steps = []
        
        current_head = initial_head_position
        
        for req in request_queue:
            service_order.append(req)
            movement = abs(req - current_head)
            movement_steps.append(DiskMovementStep(
                start_cylinder=current_head,
                end_cylinder=req,
                movement=movement
            ))
            current_head = req
            
        return service_order, movement_steps
