from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class PriorityNPScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        if not processes:
            return SimulationResult(gantt_chart=[], metrics=calculate_metrics([], []))
        pending = sorted(processes, key=lambda p: (p.arrival_time, p.priority, p.id))
        gantt_chart = []
        current_time = 0
        while pending:
            eligible = [p for p in pending if p.arrival_time <= current_time]
            if not eligible:
                next_arrival = pending[0].arrival_time
                gantt_chart.append(GanttEvent(process_id="IDLE", start_time=current_time, end_time=next_arrival))
                current_time = next_arrival
                continue
            eligible.sort(key=lambda p: (p.priority, p.arrival_time, p.id))
            selected = eligible[0]
            start_time = current_time
            end_time = current_time + selected.burst_time
            gantt_chart.append(GanttEvent(process_id=selected.id, start_time=start_time, end_time=end_time))
            current_time = end_time
            pending.remove(selected)
        return SimulationResult(gantt_chart=gantt_chart, metrics=calculate_metrics(processes, gantt_chart))
