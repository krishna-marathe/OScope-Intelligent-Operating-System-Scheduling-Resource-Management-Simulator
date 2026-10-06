from typing import List, Tuple
from app.disk.interface import DiskSchedulingAlgorithm
from app.models.disk_schemas import DiskMovementStep

class SCANAlgorithm(DiskSchedulingAlgorithm):
    def simulate(self, request_queue: List[int], initial_head_position: int, disk_size: int, direction: str = "RIGHT") -> Tuple[List[int], List[DiskMovementStep]]:
        service_order = []
        movement_steps = []
        
        current_head = initial_head_position
        pending = list(request_queue)
        
        current_dir = direction
        
        while pending:
            # Find requests in current direction
            if current_dir == "RIGHT":
                # find all requests >= current_head, sort ascending
                valid_reqs = sorted([r for r in pending if r >= current_head])
                if not valid_reqs:
                    # Move to boundary if needed, but only if there are pending requests on the other side
                    boundary = disk_size - 1
                    if current_head != boundary:
                        movement = boundary - current_head
                        movement_steps.append(DiskMovementStep(
                            start_cylinder=current_head,
                            end_cylinder=boundary,
                            movement=movement
                        ))
                        current_head = boundary
                    current_dir = "LEFT"
                    continue
                else:
                    # Service the next one
                    next_req = valid_reqs[0]
            else: # LEFT
                # find all requests <= current_head, sort descending
                valid_reqs = sorted([r for r in pending if r <= current_head], reverse=True)
                if not valid_reqs:
                    boundary = 0
                    if current_head != boundary:
                        movement = current_head - boundary
                        movement_steps.append(DiskMovementStep(
                            start_cylinder=current_head,
                            end_cylinder=boundary,
                            movement=movement
                        ))
                        current_head = boundary
                    current_dir = "RIGHT"
                    continue
                else:
                    next_req = valid_reqs[0]
            
            # Service next_req
            # NOTE: if there are duplicates of next_req, we service ONE of them here,
            # and the next loop iteration will service the next one since it's at the same position.
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
