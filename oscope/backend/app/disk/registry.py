from app.disk.algorithms.fcfs import FCFSAlgorithm
from app.disk.algorithms.sstf import SSTFAlgorithm
from app.disk.algorithms.scan import SCANAlgorithm
from app.disk.algorithms.cscan import CSCANAlgorithm
from app.disk.algorithms.look import LOOKAlgorithm
from app.disk.algorithms.clook import CLOOKAlgorithm

DISK_ALGORITHMS = {
    "FCFS": FCFSAlgorithm(),
    "SSTF": SSTFAlgorithm(),
    "SCAN": SCANAlgorithm(),
    "C-SCAN": CSCANAlgorithm(),
    "LOOK": LOOKAlgorithm(),
    "C-LOOK": CLOOKAlgorithm(),
}

def get_disk_algorithm(name: str):
    if name not in DISK_ALGORITHMS:
        raise ValueError(f"Unknown or unsupported disk algorithm: {name}")
    return DISK_ALGORITHMS[name]
