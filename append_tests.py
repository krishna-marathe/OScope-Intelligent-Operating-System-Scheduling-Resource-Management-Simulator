import os
base_dir = "oscope/backend/tests"
os.makedirs(base_dir, exist_ok=True)

with open(os.path.join(base_dir, "test_sjf.py"), "w") as f:
    f.write("""\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.sjf import SJFScheduler

def test_sjf_multiple_ready():
    scheduler = SJFScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=6),
        Process(id="P2", arrival_time=1, burst_time=2),
        Process(id="P3", arrival_time=1, burst_time=1)
    ]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[1].process_id == "P3"
    assert result.gantt_chart[2].process_id == "P2"

def test_sjf_simultaneous():
    scheduler = SJFScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=4),
        Process(id="P2", arrival_time=0, burst_time=4)
    ]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[1].process_id == "P2"
""")

with open(os.path.join(base_dir, "test_srtf.py"), "w") as f:
    f.write("""\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.srtf import SRTFScheduler

def test_srtf_preemption():
    scheduler = SRTFScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=5),
        Process(id="P2", arrival_time=1, burst_time=2)
    ]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[0].end_time == 1
    assert result.gantt_chart[1].process_id == "P2"
    assert result.gantt_chart[1].end_time == 3
    assert result.gantt_chart[2].process_id == "P1"
    assert result.gantt_chart[2].end_time == 7

def test_srtf_equal_remaining():
    scheduler = SRTFScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=4),
        Process(id="P2", arrival_time=1, burst_time=3)
    ]
    result = scheduler.simulate(processes)
    assert len(result.gantt_chart) == 2
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[0].end_time == 4
    assert result.gantt_chart[1].process_id == "P2"
""")

with open(os.path.join(base_dir, "test_rr.py"), "w") as f:
    f.write("""\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.rr import RRScheduler

def test_rr_queue_ordering():
    scheduler = RRScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=4),
        Process(id="P2", arrival_time=2, burst_time=3)
    ]
    result = scheduler.simulate(processes, time_quantum=2)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[1].process_id == "P2"
    assert result.gantt_chart[2].process_id == "P1"

def test_rr_invalid_quantum():
    scheduler = RRScheduler()
    with pytest.raises(ValueError):
        scheduler.simulate([Process(id="P1", arrival_time=0, burst_time=4)], time_quantum=0)

def test_rr_boundary_completion():
    scheduler = RRScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=2),
        Process(id="P2", arrival_time=0, burst_time=2)
    ]
    result = scheduler.simulate(processes, time_quantum=2)
    assert len(result.gantt_chart) == 2
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[1].process_id == "P2"
""")

with open(os.path.join(base_dir, "test_priority_p.py"), "w") as f:
    f.write("""\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.priority_p import PriorityPScheduler

def test_priority_p_preemption():
    scheduler = PriorityPScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=5, priority=2),
        Process(id="P2", arrival_time=2, burst_time=2, priority=1)
    ]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[0].end_time == 2
    assert result.gantt_chart[1].process_id == "P2"
    assert result.gantt_chart[1].end_time == 4
    assert result.gantt_chart[2].process_id == "P1"
    assert result.gantt_chart[2].end_time == 7

def test_priority_p_equal():
    scheduler = PriorityPScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=5, priority=1),
        Process(id="P2", arrival_time=2, burst_time=2, priority=1)
    ]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[0].end_time == 5
""")

with open(os.path.join(base_dir, "test_metrics.py"), "w") as f:
    f.write("""\
import pytest, sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.fcfs import FCFSScheduler

def test_empty_workload():
    scheduler = FCFSScheduler()
    result = scheduler.simulate([])
    assert len(result.gantt_chart) == 0
    assert result.metrics.average_waiting_time == 0.0

def test_invalid_process():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        Process(id="P1", arrival_time=-1, burst_time=5)
    with pytest.raises(ValidationError):
        Process(id="P2", arrival_time=0, burst_time=0)

def test_metric_calculations():
    scheduler = FCFSScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=5),
        Process(id="P2", arrival_time=2, burst_time=3)
    ]
    result = scheduler.simulate(processes)
    pm1 = next(p for p in result.metrics.process_metrics if p.process_id == "P1")
    pm2 = next(p for p in result.metrics.process_metrics if p.process_id == "P2")
    assert pm1.turnaround_time == 5
    assert pm2.turnaround_time == 6
    assert pm2.waiting_time == 3
    assert pm2.response_time == 3
    assert result.metrics.cpu_utilization == 100.0
    assert result.metrics.throughput == 2/8
""")
