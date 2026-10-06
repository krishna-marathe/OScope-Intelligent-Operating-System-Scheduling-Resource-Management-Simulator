from app.memory.algorithms.fifo import FIFOAlgorithm
from app.memory.algorithms.lru import LRUAlgorithm
from app.memory.algorithms.optimal import OptimalAlgorithm

MEMORY_ALGORITHMS = {
    "FIFO": FIFOAlgorithm(),
    "LRU": LRUAlgorithm(),
    "OPTIMAL": OptimalAlgorithm(),
}

def get_memory_algorithm(name: str):
    if name not in MEMORY_ALGORITHMS:
        raise ValueError(f"Unknown memory algorithm: {name}")
    return MEMORY_ALGORITHMS[name]
