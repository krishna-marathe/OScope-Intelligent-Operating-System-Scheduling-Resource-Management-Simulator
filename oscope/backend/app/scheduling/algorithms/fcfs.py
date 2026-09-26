from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class FCFSScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        if not processes:
            return SimulationResult(gantt_chart=[], metrics=calculate_metrics([], []))

        # Tie-breaking rules: Sort by arrival_time, then by id
        sorted_processes = sorted(processes, key=lambda p: (p.arrival_time, p.id))
        
        gantt_chart: List[GanttEvent] = []
        current_time = 0

        for p in sorted_processes:
            if current_time < p.arrival_time:
                # CPU is IDLE
                gantt_chart.append(GanttEvent(
                    process_id="IDLE",
                    start_time=current_time,
                    end_time=p.arrival_time
                ))
                current_time = p.arrival_time

            start_time = current_time
            end_time = current_time + p.burst_time
            gantt_chart.append(GanttEvent(
                process_id=p.id,
                start_time=start_time,
                end_time=end_time
            ))
            current_time = end_time

        metrics = calculate_metrics(processes, gantt_chart)
        return SimulationResult(gantt_chart=gantt_chart, metrics=metrics)
