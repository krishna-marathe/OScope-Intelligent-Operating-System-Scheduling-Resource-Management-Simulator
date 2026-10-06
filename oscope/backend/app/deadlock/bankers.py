from typing import List, Tuple, Optional
from app.models.deadlock_schemas import DeadlockSimulationRequest, DeadlockSimulationResult, SafetyStep, ProcessState

class BankersAlgorithm:
    def __init__(self, req: DeadlockSimulationRequest):
        self.req = req
        self.need = self._calculate_need()
        
    def _calculate_need(self) -> List[List[int]]:
        need = []
        for i in range(self.req.process_count):
            row = []
            for j in range(self.req.resource_count):
                row.append(self.req.maximum[i][j] - self.req.allocation[i][j])
            need.append(row)
        return need
        
    def check_safety(self, available: List[int], allocation: List[List[int]], need: List[List[int]]) -> Tuple[bool, List[int], List[SafetyStep], List[int], List[bool]]:
        work = list(available)
        finish = [False] * self.req.process_count
        safe_sequence = []
        safety_steps = []
        
        step_number = 1
        
        while True:
            found = False
            for i in range(self.req.process_count):
                if not finish[i]:
                    can_execute = True
                    for j in range(self.req.resource_count):
                        if need[i][j] > work[j]:
                            can_execute = False
                            break
                    
                    work_before = list(work)
                    if can_execute:
                        for j in range(self.req.resource_count):
                            work[j] += allocation[i][j]
                        finish[i] = True
                        safe_sequence.append(i)
                        found = True
                        
                        safety_steps.append(SafetyStep(
                            step_number=step_number,
                            process_id=i,
                            work_before=work_before,
                            need=need[i],
                            can_execute=True,
                            work_after=list(work),
                            finish_status=list(finish)
                        ))
                        step_number += 1
                        break
            if not found:
                break
                
        is_safe = all(finish)
        return is_safe, safe_sequence, safety_steps, work, finish

    def simulate(self) -> DeadlockSimulationResult:
        request_approved = None
        request_reason = None
        
        available = list(self.req.available)
        allocation = [list(row) for row in self.req.allocation]
        need = [list(row) for row in self.need]
        
        if self.req.resource_request:
            pid = self.req.resource_request.process_id
            req_vec = self.req.resource_request.request
            
            if any(req_vec[j] > need[pid][j] for j in range(self.req.resource_count)):
                request_approved = False
                request_reason = f"Process {pid} requested more than its declared maximum demand (Request > Need)."
            elif any(req_vec[j] > available[j] for j in range(self.req.resource_count)):
                request_approved = False
                request_reason = "Sufficient resources are currently unavailable (Request > Available)."
            else:
                for j in range(self.req.resource_count):
                    available[j] -= req_vec[j]
                    allocation[pid][j] += req_vec[j]
                    need[pid][j] -= req_vec[j]
                
                is_safe, _, _, _, _ = self.check_safety(available, allocation, need)
                
                if is_safe:
                    request_approved = True
                    request_reason = "Request granted. System remains in a SAFE state."
                else:
                    request_approved = False
                    request_reason = "Request denied. Granting the request would lead to an UNSAFE state."
                    available = list(self.req.available)
                    allocation = [list(row) for row in self.req.allocation]
                    need = [list(row) for row in self.need]
        
        is_safe, safe_seq, steps, final_work, finish_status = self.check_safety(available, allocation, need)
        
        process_states = []
        for i in range(self.req.process_count):
            process_states.append(ProcessState(
                process_id=i,
                allocation=allocation[i],
                maximum=self.req.maximum[i],
                need=need[i],
                finished=finish_status[i]
            ))
            
        return DeadlockSimulationResult(
            is_safe=is_safe,
            safe_sequence=safe_seq,
            available_after_simulation=final_work,
            need_matrix=need,
            process_states=process_states,
            safety_steps=steps,
            request_approved=request_approved,
            request_reason=request_reason
        )
