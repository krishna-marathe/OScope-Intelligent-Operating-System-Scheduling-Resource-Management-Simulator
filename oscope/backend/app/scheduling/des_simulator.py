from typing import List, Optional
import heapq
from collections import deque
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.metrics import ProcessMetrics, SimulationMetrics

class SimProcess:
    def __init__(self, p: Process):
        self.p = p
        self.id = p.id
        self.arrival_time = p.arrival_time
        self.priority = p.priority
        if p.burst_sequence is not None:
            self.bursts = list(p.burst_sequence)
        else:
            self.bursts = [p.burst_time]
        
        self.burst_index = 0
        self.remaining_time = self.bursts[0] if self.bursts else 0
        
        self.first_response_time: Optional[int] = None
        self.completion_time = 0
        
        self.ready_entry_time = self.arrival_time
        self.waiting_time = 0
        
        self.io_queue_entry_time = 0
        self.io_wait_time = 0
        self.io_service_time = 0
        self.cpu_service_time = 0

    def is_done(self):
        return self.burst_index >= len(self.bursts)

def simulate_des(processes: List[Process], policy: str, **kwargs) -> SimulationResult:
    if not processes:
        return SimulationResult(gantt_chart=[], metrics=SimulationMetrics(
            process_metrics=[], average_turnaround_time=0.0, average_waiting_time=0.0,
            average_response_time=0.0, cpu_utilization=0.0, throughput=0.0,
            io_utilization=0.0, total_makespan=0
        ))

    time_quantum = kwargs.get('time_quantum', None)
    if policy == "RR" and (time_quantum is None or time_quantum <= 0):
        raise ValueError("Round Robin requires a positive time_quantum")
        
    context_switch_cost = kwargs.get('context_switch_cost', 0)
    
    sim_procs = [SimProcess(p) for p in processes]
    process_map = {sp.id: sp for sp in sim_procs}
    
    events = [] # (time, type, p_id)
    # Types: 1: Arrival, 2: IO Complete, 3: CPU Complete, 4: Quantum Expire
    for sp in sim_procs:
        heapq.heappush(events, (sp.arrival_time, 1, sp.id))
        
    current_time = 0
    ready_queue: List[SimProcess] = []
    io_queue: deque[SimProcess] = deque()
    
    cpu_active: Optional[SimProcess] = None
    cpu_quantum_start = 0
    
    io_active: Optional[SimProcess] = None
    
    gantt_chart: List[GanttEvent] = []
    
    def sort_ready_queue():
        if policy == "FCFS" or policy == "RR":
            pass
        elif policy == "SJF" or policy == "SRTF":
            ready_queue.sort(key=lambda sp: (sp.remaining_time, sp.arrival_time, sp.id))
        elif policy == "Priority_NP" or policy == "Priority_P":
            ready_queue.sort(key=lambda sp: (sp.priority, sp.arrival_time, sp.id))
            
    def check_preemption(new_proc: SimProcess):
        if not cpu_active:
            return False
        if policy == "SRTF":
            return new_proc.remaining_time < cpu_active.remaining_time
        if policy == "Priority_P":
            return new_proc.priority < cpu_active.priority
        return False
        
    def add_to_ready_queue(sp: SimProcess):
        sp.ready_entry_time = current_time
        ready_queue.append(sp)
        sort_ready_queue()
        
    expected_io_event_time = {}
    
    def schedule_io():
        nonlocal io_active
        if not io_active and io_queue:
            sp = io_queue.popleft()
            io_active = sp
            sp.io_wait_time += (current_time - sp.io_queue_entry_time)
            io_duration = sp.remaining_time
            io_busy_until = current_time + io_duration
            sp.io_service_time += io_duration
            expected_io_event_time[sp.id] = io_busy_until
            heapq.heappush(events, (io_busy_until, 2, sp.id))
            gantt_chart.append(GanttEvent(
                process_id=sp.id,
                start_time=current_time,
                end_time=io_busy_until,
                event_type="IO"
            ))

    expected_cpu_event_time = {}
    
    def preempt_cpu():
        nonlocal cpu_active
        if cpu_active:
            run_time = current_time - cpu_quantum_start
            cpu_active.remaining_time -= run_time
            cpu_active.cpu_service_time += run_time
            
            # Truncate the Gantt chart event for the preempted process
            for i in range(len(gantt_chart)-1, -1, -1):
                if gantt_chart[i].process_id == cpu_active.id and gantt_chart[i].event_type == "CPU" and gantt_chart[i].start_time == cpu_quantum_start:
                    gantt_chart[i].end_time = current_time
                    if gantt_chart[i].end_time == gantt_chart[i].start_time:
                        gantt_chart.pop(i)
                    break
                    
            if cpu_active.remaining_time > 0:
                add_to_ready_queue(cpu_active)
            cpu_active = None

    last_idle_start = 0

    while events:
        batch = []
        ev_time = events[0][0]
        while events and events[0][0] == ev_time:
            batch.append(heapq.heappop(events))
            
        if ev_time > current_time:
            if not cpu_active and last_idle_start < ev_time:
                idle_start = max(current_time, last_idle_start)
                if idle_start < ev_time:
                    gantt_chart.append(GanttEvent(
                        process_id="IDLE", start_time=idle_start, end_time=ev_time, event_type="IDLE"
                    ))
                last_idle_start = ev_time
            current_time = ev_time

        batch.sort(key=lambda x: x[1])

        for _, ev_type, p_id in batch:
            sp = process_map[p_id]
            
            if ev_type == 1:
                add_to_ready_queue(sp)
                if check_preemption(sp):
                    preempt_cpu()
            elif ev_type == 2:
                if expected_io_event_time.get(p_id) == current_time and io_active == sp:
                    io_active = None
                    sp.burst_index += 1
                    if not sp.is_done():
                        sp.remaining_time = sp.bursts[sp.burst_index]
                        add_to_ready_queue(sp)
                        if check_preemption(sp):
                            preempt_cpu()
                    else:
                        sp.completion_time = current_time
                    schedule_io()
            elif ev_type == 3:
                if expected_cpu_event_time.get(p_id) == current_time and cpu_active == sp:
                    run_time = current_time - cpu_quantum_start
                    sp.remaining_time -= run_time
                    sp.cpu_service_time += run_time
                    cpu_active = None
                    sp.burst_index += 1
                    if not sp.is_done():
                        sp.remaining_time = sp.bursts[sp.burst_index]
                        sp.io_queue_entry_time = current_time
                        io_queue.append(sp)
                        schedule_io()
                    else:
                        sp.completion_time = current_time
            elif ev_type == 4:
                if expected_cpu_event_time.get(p_id) == current_time and cpu_active == sp:
                    run_time = current_time - cpu_quantum_start
                    sp.remaining_time -= run_time
                    sp.cpu_service_time += run_time
                    cpu_active = None
                    if sp.remaining_time > 0:
                        add_to_ready_queue(sp)

        if not cpu_active and ready_queue:
            if context_switch_cost > 0:
                cs_end = current_time + context_switch_cost
                gantt_chart.append(GanttEvent(
                    process_id="CS", start_time=current_time, end_time=cs_end, event_type="CS"
                ))
                current_time = cs_end
                last_idle_start = current_time
                
                # Reschedule any events that occur during CS
                while events and events[0][0] <= current_time:
                    _, et, ep = heapq.heappop(events)
                    # We push them back at current_time so they get processed immediately after CS
                    heapq.heappush(events, (current_time, et, ep))

            sp = ready_queue.pop(0)
            sp.waiting_time += (current_time - sp.ready_entry_time)
            if sp.first_response_time is None:
                sp.first_response_time = current_time - sp.arrival_time
                
            cpu_active = sp
            cpu_quantum_start = current_time
            
            run_duration = sp.remaining_time
            if policy == "RR" and time_quantum and time_quantum < run_duration:
                expected_cpu_event_time[sp.id] = current_time + time_quantum
                heapq.heappush(events, (current_time + time_quantum, 4, sp.id))
            else:
                expected_cpu_event_time[sp.id] = current_time + run_duration
                heapq.heappush(events, (current_time + run_duration, 3, sp.id))
                
            gantt_chart.append(GanttEvent(
                process_id=sp.id, start_time=current_time,
                end_time=expected_cpu_event_time[sp.id], event_type="CPU"
            ))

    process_metrics_list = []
    total_tat = 0
    total_wt = 0
    total_rt = 0
    
    total_cpu_time = 0
    total_io_time = sum(sp.io_service_time for sp in sim_procs)
    
    for sp in sim_procs:
        tat = sp.completion_time - sp.arrival_time
        total_tat += tat
        total_wt += sp.waiting_time
        total_rt += (sp.first_response_time or 0)
        total_cpu_time += sp.cpu_service_time
        
        process_metrics_list.append(ProcessMetrics(
            process_id=sp.id,
            completion_time=sp.completion_time,
            turnaround_time=tat,
            waiting_time=sp.waiting_time,
            response_time=(sp.first_response_time or 0),
            io_time=sp.io_service_time,
            blocked_time=(sp.io_service_time + sp.io_wait_time)
        ))

    n = len(sim_procs)
    total_time = current_time
    
    cpu_utilization = (total_cpu_time / total_time * 100) if total_time > 0 else 0.0
    io_utilization = (total_io_time / total_time * 100) if total_time > 0 else 0.0
    throughput = (n / total_time) if total_time > 0 else 0.0

    # Merge contiguous events of the same process and type
    merged_chart = []
    for event in gantt_chart:
        if event.start_time == event.end_time:
            continue
        if not merged_chart:
            merged_chart.append(event)
        elif merged_chart[-1].process_id == event.process_id and merged_chart[-1].event_type == event.event_type and merged_chart[-1].end_time == event.start_time:
            merged_chart[-1].end_time = event.end_time
        else:
            merged_chart.append(event)

    metrics = SimulationMetrics(
        process_metrics=process_metrics_list,
        average_turnaround_time=total_tat / n if n > 0 else 0.0,
        average_waiting_time=total_wt / n if n > 0 else 0.0,
        average_response_time=total_rt / n if n > 0 else 0.0,
        cpu_utilization=cpu_utilization,
        throughput=throughput,
        io_utilization=io_utilization,
        total_makespan=total_time
    )

    return SimulationResult(gantt_chart=merged_chart, metrics=metrics)
