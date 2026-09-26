import os

base_dir = "oscope/backend"

files = {
    "requirements.txt": "fastapi\npydantic\npytest\n",
    "app/scheduling/algorithms/sjf.py": """\
from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class SJFScheduler(SchedulerInterface):
    def simulate(self, processes: List[Process], **kwargs) -> SimulationResult:
        if not processes:
            return SimulationResult(gantt_chart=[], metrics=calculate_metrics([], []))
        pending = sorted(processes, key=lambda p: (p.arrival_time, p.burst_time, p.id))
        gantt_chart = []
        current_time = 0
        while pending:
            eligible = [p for p in pending if p.arrival_time <= current_time]
            if not eligible:
                next_arrival = pending[0].arrival_time
                gantt_chart.append(GanttEvent(process_id="IDLE", start_time=current_time, end_time=next_arrival))
                current_time = next_arrival
                continue
            eligible.sort(key=lambda p: (p.burst_time, p.arrival_time, p.id))
            selected = eligible[0]
            start_time = current_time
            end_time = current_time + selected.burst_time
            gantt_chart.append(GanttEvent(process_id=selected.id, start_time=start_time, end_time=end_time))
            current_time = end_time
            pending.remove(selected)
        return SimulationResult(gantt_chart=gantt_chart, metrics=calculate_metrics(processes, gantt_chart))
""",
    "app/scheduling/algorithms/srtf.py": """\
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
""",
    "app/scheduling/algorithms/rr.py": """\
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
""",
    "app/scheduling/algorithms/priority_np.py": """\
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
""",
    "app/scheduling/algorithms/priority_p.py": """\
from typing import List
from app.models.schemas import Process, GanttEvent, SimulationResult
from app.scheduling.interface import SchedulerInterface
from app.scheduling.metrics import calculate_metrics

class PriorityPScheduler(SchedulerInterface):
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
            eligible.sort(key=lambda p: (p.priority, p.arrival_time, p.id))
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
""",
    "app/scheduling/registry.py": """\
from app.scheduling.algorithms.fcfs import FCFSScheduler
from app.scheduling.algorithms.sjf import SJFScheduler
from app.scheduling.algorithms.srtf import SRTFScheduler
from app.scheduling.algorithms.rr import RRScheduler
from app.scheduling.algorithms.priority_np import PriorityNPScheduler
from app.scheduling.algorithms.priority_p import PriorityPScheduler

class SchedulingAlgorithmRegistry:
    @staticmethod
    def get_scheduler(name: str):
        registry = {
            "FCFS": FCFSScheduler(),
            "SJF": SJFScheduler(),
            "SRTF": SRTFScheduler(),
            "RR": RRScheduler(),
            "PRIORITY_NP": PriorityNPScheduler(),
            "PRIORITY_P": PriorityPScheduler(),
        }
        name_upper = name.upper()
        if name_upper not in registry:
            raise ValueError(f"Algorithm '{name}' is not supported.")
        return registry[name_upper]
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

test_files = {
    "tests/test_sjf.py": """\
import sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.sjf import SJFScheduler
def test_sjf():
    scheduler = SJFScheduler()
    processes = [Process(id="P1", arrival_time=0, burst_time=6), Process(id="P2", arrival_time=0, burst_time=2)]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P2"
    assert result.gantt_chart[1].process_id == "P1"
""",
    "tests/test_srtf.py": """\
import sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.srtf import SRTFScheduler
def test_srtf():
    scheduler = SRTFScheduler()
    processes = [Process(id="P1", arrival_time=0, burst_time=5), Process(id="P2", arrival_time=2, burst_time=2)]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[0].end_time == 2
    assert result.gantt_chart[1].process_id == "P2"
    assert result.gantt_chart[1].end_time == 4
    assert result.gantt_chart[2].process_id == "P1"
""",
    "tests/test_rr.py": """\
import sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.rr import RRScheduler
def test_rr():
    scheduler = RRScheduler()
    processes = [Process(id="P1", arrival_time=0, burst_time=4), Process(id="P2", arrival_time=0, burst_time=3)]
    result = scheduler.simulate(processes, time_quantum=2)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[1].process_id == "P2"
    assert result.gantt_chart[2].process_id == "P1"
    assert result.gantt_chart[3].process_id == "P2"
""",
    "tests/test_priority_np.py": """\
import sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.priority_np import PriorityNPScheduler
def test_priority_np():
    scheduler = PriorityNPScheduler()
    processes = [Process(id="P1", arrival_time=0, burst_time=5, priority=2), Process(id="P2", arrival_time=0, burst_time=2, priority=1)]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P2"
    assert result.gantt_chart[1].process_id == "P1"
""",
    "tests/test_priority_p.py": """\
import sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.priority_p import PriorityPScheduler
def test_priority_p():
    scheduler = PriorityPScheduler()
    processes = [Process(id="P1", arrival_time=0, burst_time=5, priority=2), Process(id="P2", arrival_time=2, burst_time=2, priority=1)]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[0].end_time == 2
    assert result.gantt_chart[1].process_id == "P2"
"""
}

for rel_path, content in test_files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
