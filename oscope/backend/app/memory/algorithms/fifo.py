from typing import List, Optional
from collections import deque
from app.memory.interface import PageReplacementAlgorithm
from app.models.memory_schemas import PageReferenceStep

class FIFOAlgorithm(PageReplacementAlgorithm):
    def simulate(self, reference_sequence: List[int], frame_count: int) -> List[PageReferenceStep]:
        frames: List[Optional[int]] = []
        steps: List[PageReferenceStep] = []
        queue = deque()
        
        for ref in reference_sequence:
            is_hit = False
            replaced_page = None
            
            if ref in frames:
                is_hit = True
            else:
                if len(frames) < frame_count:
                    frames.append(ref)
                    queue.append(ref)
                else:
                    replaced_page = queue.popleft()
                    idx = frames.index(replaced_page)
                    frames[idx] = ref
                    queue.append(ref)
                    
            steps.append(PageReferenceStep(
                reference=ref,
                is_hit=is_hit,
                replaced_page=replaced_page,
                frames=list(frames)
            ))
            
        return steps
