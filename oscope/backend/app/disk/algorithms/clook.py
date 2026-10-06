from typing import List, Tuple
from app.disk.interface import DiskSchedulingAlgorithm
from app.models.disk_schemas import DiskMovementStep

class CLOOKAlgorithm(DiskSchedulingAlgorithm):
    def simulate(self, request_queue: List[int], initial_head_position: int, disk_size: int, direction: str = "RIGHT") -> Tuple[List[int], List[DiskMovementStep]]:
        service_order = []
        movement_steps = []
        
        current_head = initial_head_position
        pending = list(request_queue)
        
        while pending:
            if direction == "RIGHT":
                valid_reqs = sorted([r for r in pending if r >= current_head])
                if not valid_reqs:
                    # jump to furthest pending request on opposite side (which is minimum pending)
                    opposite = min(pending)
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
                    # jump to furthest pending request on opposite side (which is maximum pending)
                    opposite = max(pending)
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
