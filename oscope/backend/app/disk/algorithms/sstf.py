from typing import List, Tuple
from app.disk.interface import DiskSchedulingAlgorithm
from app.models.disk_schemas import DiskMovementStep

class SSTFAlgorithm(DiskSchedulingAlgorithm):
    def simulate(self, request_queue: List[int], initial_head_position: int, disk_size: int, direction: str = "RIGHT") -> Tuple[List[int], List[DiskMovementStep]]:
        service_order = []
        movement_steps = []
        
        current_head = initial_head_position
        pending = list(request_queue)
        
        while pending:
            # Find closest request
            closest_idx = -1
            min_dist = float('inf')
            
            for i, req in enumerate(pending):
                dist = abs(req - current_head)
                if dist < min_dist:
                    min_dist = dist
                    closest_idx = i
            
            selected_req = pending.pop(closest_idx)
            service_order.append(selected_req)
            
            movement = abs(selected_req - current_head)
            movement_steps.append(DiskMovementStep(
                start_cylinder=current_head,
                end_cylinder=selected_req,
                movement=movement
            ))
            current_head = selected_req
            
        return service_order, movement_steps
