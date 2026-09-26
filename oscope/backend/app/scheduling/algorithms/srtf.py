from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class SRTFScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        if not processes:
            return SimulationResult(gantt_chart=[], metrics=calculate_metrics([], []))
        remaining = {p.id: p.burst_time for p in processes}
        pending = sorted(processes, key=lambda p: (p.arrival_time, p.id))
        gantt_chart = []
        current_time = 0
        running_process_id = None
        start_time = 0
        arrival_times = sorted(list(set([p.arrival_time for p in processes])))
        while pending:
            eligible = [p for p in pending if p.arrival_time <= current_time]
            if not eligible:
                next_arrival = pending[0].arrival_time
                if running_process_id:
                    gantt_chart.append(GanttEvent(process_id=running_process_id, start_time=start_time, end_time=current_time))
                    running_process_id = None
                gantt_chart.append(GanttEvent(process_id="IDLE", start_time=current_time, end_time=next_arrival))
                current_time = next_arrival
                continue
            eligible.sort(key=lambda p: (remaining[p.id], p.arrival_time, p.id))
            selected = eligible[0]
            if running_process_id != selected.id:
                if running_process_id is not None and current_time > start_time:
                    gantt_chart.append(GanttEvent(process_id=running_process_id, start_time=start_time, end_time=current_time))
                running_process_id = selected.id
                start_time = current_time
            future_arrivals = [t for t in arrival_times if t > current_time]
            next_arrival = future_arrivals[0] if future_arrivals else float('inf')
            run_time = min(remaining[selected.id], next_arrival - current_time)
            current_time += run_time
            remaining[selected.id] -= run_time
            if remaining[selected.id] == 0:
                gantt_chart.append(GanttEvent(process_id=selected.id, start_time=start_time, end_time=current_time))
                running_process_id = None
                pending.remove(selected)
        if running_process_id is not None and current_time > start_time:
             gantt_chart.append(GanttEvent(process_id=running_process_id, start_time=start_time, end_time=current_time))
        merged_chart = []
        for event in gantt_chart:
            if not merged_chart:
                merged_chart.append(event)
            elif merged_chart[-1].process_id == event.process_id and merged_chart[-1].end_time == event.start_time:
                merged_chart[-1].end_time = event.end_time
            else:
                merged_chart.append(event)
        return SimulationResult(gantt_chart=merged_chart, metrics=calculate_metrics(processes, merged_chart))
