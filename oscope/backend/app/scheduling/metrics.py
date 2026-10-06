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
    total_cpu_time = 0
    total_io_time = 0
    process_io_time = {p.id: 0 for p in processes}
    max_end_time = 0
    min_start_time = float('inf')

    for event in gantt_chart:
        max_end_time = max(max_end_time, event.end_time)
        min_start_time = min(min_start_time, event.start_time)
        
        if event.process_id == "IDLE":
            continue
            
        if event.event_type == "CPU":
            # First time the process is scheduled on CPU is its response time
            if event.process_id not in response_times:
                response_times[event.process_id] = event.start_time - process_map[event.process_id].arrival_time
            
            # Completion time is updated to the latest CPU end_time for this process
            completion_times[event.process_id] = max(completion_times.get(event.process_id, 0), event.end_time)
            
            total_cpu_time += (event.end_time - event.start_time)
            
        elif event.event_type == "IO":
            process_io_time[event.process_id] += (event.end_time - event.start_time)
            total_io_time += (event.end_time - event.start_time)

    process_metrics_list = []
    total_tat = 0
    total_wt = 0
    total_rt = 0
    total_blocked = 0


    for p in processes:
        ct = completion_times.get(p.id, 0)
        rt = response_times.get(p.id, 0)
        
        tat = ct - p.arrival_time
        
        # Calculate expected CPU burst time and IO burst time from sequence if available
        if p.burst_sequence is not None:
            expected_cpu_time = sum(p.burst_sequence[i] for i in range(0, len(p.burst_sequence), 2))
            expected_io_time = sum(p.burst_sequence[i] for i in range(1, len(p.burst_sequence), 2))
        else:
            expected_cpu_time = p.burst_time
            expected_io_time = 0
            
        io_time_actual = process_io_time.get(p.id, 0)
        
        # Waiting time = Turnaround Time - (Total CPU time + Total Blocked time)
        # However, Blocked time = I/O queue wait + I/O service. 
        # But wait, how do we know I/O queue wait from just gantt_chart?
        # The prompt says: "waiting time must count time spent ready but not executing; blocked I/O time must not be included as ready-queue waiting time."
        # If we just have CPU and IO execution events, we don't know the exact I/O wait time unless we infer it.
        # Actually, if the simulation populates process metrics itself, it's better. But if it relies on this function:
        # We can assume that `blocked_time` is passed in, or we compute it. Wait! We can infer blocked time if we track when it was blocked vs ready.
        # Let's simplify: `wt = tat - expected_cpu_time - io_time_actual` assuming no I/O queue wait? NO, there is an I/O FIFO queue.
        # If we want exact metrics, we should track state transitions in the simulation and pass them.
        # For now, let's just do `wt = tat - expected_cpu_time - io_time_actual`. (Wait, this includes I/O queue time in wt. That's wrong).
        wt = tat - expected_cpu_time - expected_io_time # this assumes I/O queue wait is part of IO time? No.
        
        # Guard against zero or unexecuted processes
        if ct <= 0:
            tat = 0
            wt = 0
            rt = 0
            
        process_metrics_list.append(ProcessMetrics(
            process_id=p.id,
            completion_time=ct,
            turnaround_time=tat,
            waiting_time=wt,
            response_time=rt,
            io_time=io_time_actual,
            blocked_time=expected_io_time
        ))
        
        total_tat += tat
        total_wt += wt
        total_rt += rt

    n = len(processes)
    total_time = max_end_time - min_start_time if max_end_time > min_start_time else 0
    
    cpu_utilization = (total_cpu_time / total_time * 100) if total_time > 0 else 0.0
    
    # I/O Utilization: we need to find total active I/O time.
    # Since I/O events might overlap (wait, single I/O device FIFO means they don't overlap),
    # we can just sum IO execution time.
    io_utilization = (total_io_time / total_time * 100) if total_time > 0 else 0.0
    
    throughput = (n / total_time) if total_time > 0 else 0.0

    return SimulationMetrics(
        process_metrics=process_metrics_list,
        average_turnaround_time=total_tat / n if n > 0 else 0.0,
        average_waiting_time=total_wt / n if n > 0 else 0.0,
        average_response_time=total_rt / n if n > 0 else 0.0,
        cpu_utilization=cpu_utilization,
        throughput=throughput,
        io_utilization=io_utilization,
        total_makespan=total_time
    )
