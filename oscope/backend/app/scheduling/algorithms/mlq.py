from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class MLQScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        if not processes:
            return SimulationResult(gantt_chart=[], metrics=calculate_metrics([], []))

        mlq_config = kwargs.get("mlq_config")
        if not mlq_config:
            raise ValueError("MLQ requires mlq_config")

        # Create queues
        queues_by_id = {q.id: q for q in mlq_config.queues}
        # Sort queues by priority (lower is higher priority)
        sorted_queue_ids = sorted(queues_by_id.keys(), key=lambda q_id: queues_by_id[q_id].priority)

        # Initialize remaining burst times
        remaining_burst = {p.id: p.burst_time for p in processes}
        process_queue = {p.id: mlq_config.process_assignments.get(p.id) for p in processes}
        if any(q_id is None for q_id in process_queue.values()):
            raise ValueError("All processes must have a queue assignment")

        # Ready queues
        ready_queues = {q_id: [] for q_id in sorted_queue_ids}
        time_quanta_left = {}

        current_time = 0
        gantt_chart = []
        last_pid = None
        cs_cost = kwargs.get("context_switch_cost", 0)

        # Sort processes by arrival time
        processes_by_arrival = sorted(processes, key=lambda p: (p.arrival_time, p.id))
        arrived_idx = 0
        completed = 0
        n = len(processes)

        while completed < n:
            # Arrive processes
            while arrived_idx < n and processes_by_arrival[arrived_idx].arrival_time <= current_time:
                p = processes_by_arrival[arrived_idx]
                q_id = process_queue[p.id]
                ready_queues[q_id].append(p.id)
                time_quanta_left[p.id] = queues_by_id[q_id].time_quantum
                arrived_idx += 1

            # Select highest priority queue that is not empty
            selected_pid = None
            selected_qid = None
            
            for q_id in sorted_queue_ids:
                if ready_queues[q_id]:
                    selected_qid = q_id
                    selected_pid = ready_queues[q_id][0]
                    break

            if selected_pid is None:
                # Idle
                next_arrival = processes_by_arrival[arrived_idx].arrival_time
                gantt_chart.append(GanttEvent(process_id="IDLE", start_time=current_time, end_time=next_arrival))
                current_time = next_arrival
                last_pid = None
                continue

            # Context Switch
            if last_pid is not None and last_pid != selected_pid and cs_cost > 0:
                gantt_chart.append(GanttEvent(process_id="CS", start_time=current_time, end_time=current_time + cs_cost))
                current_time += cs_cost
                # Check for new arrivals during CS
                while arrived_idx < n and processes_by_arrival[arrived_idx].arrival_time <= current_time:
                    p = processes_by_arrival[arrived_idx]
                    q_id = process_queue[p.id]
                    ready_queues[q_id].append(p.id)
                    time_quanta_left[p.id] = queues_by_id[q_id].time_quantum
                    arrived_idx += 1
                # Must re-select after CS since higher priority might have arrived
                # For simplicity, we just continue to re-evaluate
                last_pid = None
                continue

            # Execute selected_pid
            q_policy = queues_by_id[selected_qid].policy
            time_slice = remaining_burst[selected_pid]

            # Determine preemption time by higher priority queue arrival
            next_higher_arrival = float('inf')
            for i in range(arrived_idx, n):
                p = processes_by_arrival[i]
                if queues_by_id[process_queue[p.id]].priority < queues_by_id[selected_qid].priority:
                    next_higher_arrival = p.arrival_time
                    break

            if q_policy == "RR":
                tq = time_quanta_left[selected_pid]
                time_slice = min(time_slice, tq)

            # Limit time_slice by next_higher_arrival
            if current_time + time_slice > next_higher_arrival:
                time_slice = next_higher_arrival - current_time

            start_time = current_time
            end_time = current_time + time_slice
            
            # Record execution
            # Combine contiguous execution of the same process if possible? No, we just append
            if gantt_chart and gantt_chart[-1].process_id == selected_pid:
                gantt_chart[-1].end_time = end_time
            else:
                gantt_chart.append(GanttEvent(process_id=selected_pid, start_time=start_time, end_time=end_time, queue_id=selected_qid))

            current_time = end_time
            remaining_burst[selected_pid] -= time_slice
            last_pid = selected_pid

            # Update ready queues
            # Check arrivals during execution
            while arrived_idx < n and processes_by_arrival[arrived_idx].arrival_time <= current_time:
                p = processes_by_arrival[arrived_idx]
                q_id = process_queue[p.id]
                ready_queues[q_id].append(p.id)
                time_quanta_left[p.id] = queues_by_id[q_id].time_quantum
                arrived_idx += 1

            if remaining_burst[selected_pid] == 0:
                ready_queues[selected_qid].pop(0)
                completed += 1
            else:
                if q_policy == "RR":
                    time_quanta_left[selected_pid] -= time_slice
                    if time_quanta_left[selected_pid] == 0:
                        # Time quantum expired, move to back of queue
                        ready_queues[selected_qid].pop(0)
                        ready_queues[selected_qid].append(selected_pid)
                        time_quanta_left[selected_pid] = queues_by_id[selected_qid].time_quantum
                else:
                    # FCFS doesn't preempt itself
                    pass

        metrics = calculate_metrics(processes, gantt_chart)
        return SimulationResult(gantt_chart=gantt_chart, metrics=metrics)
