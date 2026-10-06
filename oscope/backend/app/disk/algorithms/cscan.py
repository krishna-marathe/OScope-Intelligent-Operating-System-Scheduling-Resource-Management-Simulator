from typing import List, Tuple
from app.disk.interface import DiskSchedulingAlgorithm
from app.models.disk_schemas import DiskMovementStep

class CSCANAlgorithm(DiskSchedulingAlgorithm):
    def simulate(self, request_queue: List[int], initial_head_position: int, disk_size: int, direction: str = "RIGHT") -> Tuple[List[int], List[DiskMovementStep]]:
        service_order = []
        movement_steps = []
        
        current_head = initial_head_position
        pending = list(request_queue)
        
        while pending:
            if direction == "RIGHT":
                valid_reqs = sorted([r for r in pending if r >= current_head])
                if not valid_reqs:
                    boundary = disk_size - 1
                    if current_head != boundary:
                        movement_steps.append(DiskMovementStep(
                            start_cylinder=current_head,
                            end_cylinder=boundary,
                            movement=boundary - current_head
                        ))
                        current_head = boundary
                    
                    # jump to opposite boundary
                    opposite = 0
                    if current_head != opposite:
                        movement_steps.append(DiskMovementStep(
                            start_cylinder=current_head,
                            end_cylinder=opposite,
                            movement=abs(current_head - opposite)
                        ))
                        current_head = opposite
                    continue
                else:
                    next_req = valid_reqs[0]
            else: # LEFT
                valid_reqs = sorted([r for r in pending if r <= current_head], reverse=True)
                if not valid_reqs:
                    boundary = 0
                    if current_head != boundary:
                        movement_steps.append(DiskMovementStep(
                            start_cylinder=current_head,
                            end_cylinder=boundary,
                            movement=current_head - boundary
                        ))
                        current_head = boundary
                    
                    # jump to opposite boundary
                    opposite = disk_size - 1
                    if current_head != opposite:
                        movement_steps.append(DiskMovementStep(
                            start_cylinder=current_head,
                            end_cylinder=opposite,
                            movement=abs(current_head - opposite)
                        ))
                        current_head = opposite
                    continue
                else:
                    next_req = valid_reqs[0]
            
            pending.remove(next_req)
            service_order.append(next_req)
            
            movement = abs(next_req - current_head)
            movement_steps.append(DiskMovementStep(
                start_cylinder=current_head,
                end_cylinder=next_req,
                movement=movement
            ))
            current_head = next_req
            
        return service_order, movement_steps
