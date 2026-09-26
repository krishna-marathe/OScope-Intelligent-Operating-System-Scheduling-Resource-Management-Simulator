from typing import Dict, Any
import copy
from app.models.requests import SimulationRequest, ComparisonRequest
from app.models.schemas import SimulationResult
from app.scheduling.registry import SchedulingAlgorithmRegistry

class SimulationService:
    @staticmethod
    def simulate(request: SimulationRequest) -> SimulationResult:
        scheduler = SchedulingAlgorithmRegistry.get_scheduler(request.algorithm)
        if request.algorithm.upper() == "RR" and (request.time_quantum is None or request.time_quantum <= 0):
            raise ValueError("Round Robin requires a positive time_quantum.")
        
        return scheduler.simulate(
            request.processes, 
            time_quantum=request.time_quantum,
            context_switch_cost=request.context_switch_cost,
            mlq_config=request.mlq_config,
            mlfq_config=request.mlfq_config
        )

    @staticmethod
    def compare(request: ComparisonRequest) -> Dict[str, SimulationResult]:
        results = {}
        for algo in request.algorithms:
            scheduler = SchedulingAlgorithmRegistry.get_scheduler(algo)
            if algo.upper() == "RR" and (request.time_quantum is None or request.time_quantum <= 0):
                raise ValueError(f"Algorithm {algo} requires a positive time_quantum.")
            processes_copy = copy.deepcopy(request.processes)
            results[algo.upper()] = scheduler.simulate(
                processes_copy, 
                time_quantum=request.time_quantum,
                context_switch_cost=request.context_switch_cost,
                mlq_config=request.mlq_config,
                mlfq_config=request.mlfq_config
            )
        return results
