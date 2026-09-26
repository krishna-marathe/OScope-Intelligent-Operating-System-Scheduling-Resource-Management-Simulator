from app.scheduling.algorithms.fcfs import FCFSScheduler
from app.scheduling.algorithms.sjf import SJFScheduler
from app.scheduling.algorithms.srtf import SRTFScheduler
from app.scheduling.algorithms.rr import RRScheduler
from app.scheduling.algorithms.priority_np import PriorityNPScheduler
from app.scheduling.algorithms.priority_p import PriorityPScheduler
from app.scheduling.algorithms.mlq import MLQScheduler
from app.scheduling.algorithms.mlfq import MLFQScheduler

class SchedulingAlgorithmRegistry:
    @staticmethod
    def get_scheduler(name: str):
        registry = {
            "FCFS": FCFSScheduler(),
            "SJF": SJFScheduler(),
            "SRTF": SRTFScheduler(),
            "RR": RRScheduler(),
            "PRIORITY_NP": PriorityNPScheduler(),
            "PRIORITY_P": PriorityPScheduler(),
            "MLQ": MLQScheduler(),
            "MLFQ": MLFQScheduler(),
        }
        name_upper = name.upper()
        if name_upper not in registry:
            raise ValueError(f"Algorithm '{name}' is not supported.")
        return registry[name_upper]
