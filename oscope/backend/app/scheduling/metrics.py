from typing import List
from app.models.schemas import Process, GanttEvent, ProcessMetrics, SimulationMetrics

def calculate_metrics(processes: List[Process], gantt_chart: List[GanttEvent]) -> SimulationMetrics:
    if not processes:
        return SimulationMetrics(
            process_metrics=[],
            average_turnaround_time=0.0,
            average_waiting_time=0.0,
            average_response_time=0.0,
            cpu_utilization=0.0,
            throughput=0.0
        )

    # Process lookup
    process_map = {p.id: p for p in processes}
    
    # Track completion time, response time, and total executed time
    completion_times = {}
    response_times = {}
    total_busy_time = 0
    max_end_time = 0
    min_start_time = float('inf')

    for event in gantt_chart:
        max_end_time = max(max_end_time, event.end_time)
        min_start_time = min(min_start_time, event.start_time)
        
        if event.process_id == "IDLE":
            continue
            
        # First time the process is scheduled is its response time
        if event.process_id not in response_times:
            response_times[event.process_id] = event.start_time - process_map[event.process_id].arrival_time
            
        # Completion time is updated to the latest end_time for this process
        completion_times[event.process_id] = event.end_time
        
        total_busy_time += (event.end_time - event.start_time)

    process_metrics_list = []
    total_tat = 0
    total_wt = 0
    total_rt = 0

    for p in processes:
        ct = completion_times.get(p.id, 0)
        rt = response_times.get(p.id, 0)
        
        tat = ct - p.arrival_time
        wt = tat - p.burst_time
        
        # Guard against zero or unexecuted processes
        if ct == 0:
            tat = 0
            wt = 0
            rt = 0
            
        process_metrics_list.append(ProcessMetrics(
            process_id=p.id,
            completion_time=ct,
            turnaround_time=tat,
            waiting_time=wt,
            response_time=rt
        ))
        
        total_tat += tat
        total_wt += wt
        total_rt += rt

    n = len(processes)
    total_time = max_end_time - min_start_time if max_end_time > min_start_time else 0
    
    cpu_utilization = (total_busy_time / total_time * 100) if total_time > 0 else 0.0
    throughput = (n / total_time) if total_time > 0 else 0.0

    return SimulationMetrics(
        process_metrics=process_metrics_list,
        average_turnaround_time=total_tat / n,
        average_waiting_time=total_wt / n,
        average_response_time=total_rt / n,
        cpu_utilization=cpu_utilization,
        throughput=throughput
    )
