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
