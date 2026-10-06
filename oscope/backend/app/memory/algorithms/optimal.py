from typing import List, Optional
from app.memory.interface import PageReplacementAlgorithm
from app.models.memory_schemas import PageReferenceStep

class OptimalAlgorithm(PageReplacementAlgorithm):
    def simulate(self, reference_sequence: List[int], frame_count: int) -> List[PageReferenceStep]:
        frames: List[Optional[int]] = []
        steps: List[PageReferenceStep] = []
        
        for i, ref in enumerate(reference_sequence):
            is_hit = False
            replaced_page = None
            
            if ref in frames:
                is_hit = True
            else:
                if len(frames) < frame_count:
                    frames.append(ref)
                else:
                    farthest_idx = -1
                    page_to_replace = None
                    frame_idx_to_replace = -1
                    
                    for f_idx, page in enumerate(frames):
                        next_use = float('inf')
                        for j in range(i + 1, len(reference_sequence)):
                            if reference_sequence[j] == page:
                                next_use = j
                                break
                                
                        if next_use > farthest_idx:
                            farthest_idx = next_use
                            page_to_replace = page
                            frame_idx_to_replace = f_idx
                            
                    replaced_page = page_to_replace
                    frames[frame_idx_to_replace] = ref
                    
            steps.append(PageReferenceStep(
                reference=ref,
                is_hit=is_hit,
                replaced_page=replaced_page,
                frames=list(frames)
            ))
            
        return steps
