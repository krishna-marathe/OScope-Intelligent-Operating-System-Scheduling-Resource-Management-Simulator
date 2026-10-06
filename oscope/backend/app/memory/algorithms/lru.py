from typing import List, Optional
from collections import OrderedDict
from app.memory.interface import PageReplacementAlgorithm
from app.models.memory_schemas import PageReferenceStep

class LRUAlgorithm(PageReplacementAlgorithm):
    def simulate(self, reference_sequence: List[int], frame_count: int) -> List[PageReferenceStep]:
        frames: List[Optional[int]] = []
        steps: List[PageReferenceStep] = []
        cache = OrderedDict()
        
        for ref in reference_sequence:
            is_hit = False
            replaced_page = None
            
            if ref in frames:
                is_hit = True
                cache.move_to_end(ref)
            else:
                if len(frames) < frame_count:
                    frames.append(ref)
                    cache[ref] = True
                else:
                    replaced_page, _ = cache.popitem(last=False)
                    idx = frames.index(replaced_page)
                    frames[idx] = ref
                    cache[ref] = True
                    
            steps.append(PageReferenceStep(
                reference=ref,
                is_hit=is_hit,
                replaced_page=replaced_page,
                frames=list(frames)
            ))
            
        return steps
