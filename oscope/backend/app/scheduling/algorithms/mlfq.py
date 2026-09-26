from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class MLFQScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        if not processes:
            return SimulationResult(gantt_chart=[], metrics=calculate_metrics([], []))

        mlfq_config = kwargs.get("mlfq_config")
        if not mlfq_config:
            # Default to 3 queues (RR, RR, FCFS)
            from app.models.requests import MLFQConfig, QueueConfig
            mlfq_config = MLFQConfig(queues=[
                QueueConfig(id=1, priority=1, policy="RR", time_quantum=4),
                QueueConfig(id=2, priority=2, policy="RR", time_quantum=8),
                QueueConfig(id=3, priority=3, policy="FCFS", time_quantum=None)
            ])

        queues_by_id = {q.id: q for q in mlfq_config.queues}
        sorted_queue_ids = sorted(queues_by_id.keys(), key=lambda q_id: queues_by_id[q_id].priority)
        top_queue = sorted_queue_ids[0]

        remaining_burst = {p.id: p.burst_time for p in processes}
        process_queue = {p.id: top_queue for p in processes} # all start at top queue

        ready_queues = {q_id: [] for q_id in sorted_queue_ids}
        time_quanta_left = {}

        current_time = 0
        gantt_chart = []
        last_pid = None
        cs_cost = kwargs.get("context_switch_cost", 0)

        processes_by_arrival = sorted(processes, key=lambda p: (p.arrival_time, p.id))
        arrived_idx = 0
        completed = 0
        n = len(processes)
        
        last_boost_time = 0
        boost_interval = mlfq_config.boost_interval

        while completed < n:
            # Check boost
            if boost_interval and current_time - last_boost_time >= boost_interval:
                for q_id in sorted_queue_ids[1:]:
                    while ready_queues[q_id]:
                        pid = ready_queues[q_id].pop(0)
                        process_queue[pid] = top_queue
                        ready_queues[top_queue].append(pid)
                        time_quanta_left[pid] = queues_by_id[top_queue].time_quantum
                last_boost_time = current_time

            # Arrive processes
            while arrived_idx < n and processes_by_arrival[arrived_idx].arrival_time <= current_time:
                p = processes_by_arrival[arrived_idx]
                q_id = process_queue[p.id]
                ready_queues[q_id].append(p.id)
                time_quanta_left[p.id] = queues_by_id[q_id].time_quantum
                arrived_idx += 1

            selected_pid = None
            selected_qid = None
            
            for q_id in sorted_queue_ids:
                if ready_queues[q_id]:
                    selected_qid = q_id
                    selected_pid = ready_queues[q_id][0]
                    break

            if selected_pid is None:
                next_arrival = processes_by_arrival[arrived_idx].arrival_time
                if boost_interval:
                    next_arrival = min(next_arrival, last_boost_time + boost_interval)
                gantt_chart.append(GanttEvent(process_id="IDLE", start_time=current_time, end_time=next_arrival))
                current_time = next_arrival
                last_pid = None
                continue

            if last_pid is not None and last_pid != selected_pid and cs_cost > 0:
                gantt_chart.append(GanttEvent(process_id="CS", start_time=current_time, end_time=current_time + cs_cost))
                current_time += cs_cost
                while arrived_idx < n and processes_by_arrival[arrived_idx].arrival_time <= current_time:
                    p = processes_by_arrival[arrived_idx]
                    q_id = process_queue[p.id]
                    ready_queues[q_id].append(p.id)
                    time_quanta_left[p.id] = queues_by_id[q_id].time_quantum
                    arrived_idx += 1
                last_pid = None
                continue

            q_policy = queues_by_id[selected_qid].policy
            time_slice = remaining_burst[selected_pid]

            next_higher_arrival = float('inf')
            for i in range(arrived_idx, n):
                p = processes_by_arrival[i]
                if top_queue != selected_qid: # New arrivals go to top queue
                    next_higher_arrival = p.arrival_time
                    break

            if boost_interval:
                time_to_boost = (last_boost_time + boost_interval) - current_time
                next_higher_arrival = min(next_higher_arrival, current_time + time_to_boost)

            if q_policy == "RR":
                tq = time_quanta_left[selected_pid]
                time_slice = min(time_slice, tq)

            if current_time + time_slice > next_higher_arrival:
                time_slice = next_higher_arrival - current_time

            start_time = current_time
            end_time = current_time + time_slice
            
            if gantt_chart and gantt_chart[-1].process_id == selected_pid:
                gantt_chart[-1].end_time = end_time
            else:
                gantt_chart.append(GanttEvent(process_id=selected_pid, start_time=start_time, end_time=end_time, queue_id=selected_qid))

            current_time = end_time
            remaining_burst[selected_pid] -= time_slice
            last_pid = selected_pid

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
                    if time_quanta_left[selected_pid] <= 0:
                        ready_queues[selected_qid].pop(0)
                        # Demote
                        current_q_idx = sorted_queue_ids.index(selected_qid)
                        if current_q_idx < len(sorted_queue_ids) - 1:
                            next_q_id = sorted_queue_ids[current_q_idx + 1]
                            process_queue[selected_pid] = next_q_id
                            ready_queues[next_q_id].append(selected_pid)
                            time_quanta_left[selected_pid] = queues_by_id[next_q_id].time_quantum
                        else:
                            ready_queues[selected_qid].append(selected_pid)
                            time_quanta_left[selected_pid] = queues_by_id[selected_qid].time_quantum
                else:
                    pass

        metrics = calculate_metrics(processes, gantt_chart)
        return SimulationResult(gantt_chart=gantt_chart, metrics=metrics)
