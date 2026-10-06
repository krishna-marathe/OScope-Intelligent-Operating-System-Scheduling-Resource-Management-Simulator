from typing import List
from abc import ABC, abstractmethod
from app.models.memory_schemas import PageReferenceStep

class PageReplacementAlgorithm(ABC):
    @abstractmethod
    def simulate(self, reference_sequence: List[int], frame_count: int) -> List[PageReferenceStep]:
        pass
