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
