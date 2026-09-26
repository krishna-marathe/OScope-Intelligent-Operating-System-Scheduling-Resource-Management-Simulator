from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class RRScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        time_quantum = kwargs.get('time_quantum', None)
        if time_quantum is None or time_quantum <= 0:
            raise ValueError("Round Robin requires a positive time_quantum.")
        if not processes:
            return SimulationResult(gantt_chart=[], metrics=calculate_metrics([], []))
        remaining = {p.id: p.burst_time for p in processes}
        sorted_processes = sorted(processes, key=lambda p: (p.arrival_time, p.id))
        gantt_chart = []
        current_time = 0
        ready_queue = []
        unassigned = list(sorted_processes)
        while unassigned or ready_queue:
            while unassigned and unassigned[0].arrival_time <= current_time:
                ready_queue.append(unassigned.pop(0))
            if not ready_queue:
                next_arrival = unassigned[0].arrival_time
                gantt_chart.append(GanttEvent(process_id="IDLE", start_time=current_time, end_time=next_arrival))
                current_time = next_arrival
                while unassigned and unassigned[0].arrival_time <= current_time:
                    ready_queue.append(unassigned.pop(0))
            if ready_queue:
                selected = ready_queue.pop(0)
                run_time = min(remaining[selected.id], time_quantum)
                gantt_chart.append(GanttEvent(process_id=selected.id, start_time=current_time, end_time=current_time + run_time))
                current_time += run_time
                remaining[selected.id] -= run_time
                while unassigned and unassigned[0].arrival_time <= current_time:
                    ready_queue.append(unassigned.pop(0))
                if remaining[selected.id] > 0:
                    ready_queue.append(selected)
        merged_chart = []
        for event in gantt_chart:
            if not merged_chart:
                merged_chart.append(event)
            elif merged_chart[-1].process_id == event.process_id and merged_chart[-1].end_time == event.start_time:
                merged_chart[-1].end_time = event.end_time
            else:
                merged_chart.append(event)
        return SimulationResult(gantt_chart=merged_chart, metrics=calculate_metrics(processes, merged_chart))
