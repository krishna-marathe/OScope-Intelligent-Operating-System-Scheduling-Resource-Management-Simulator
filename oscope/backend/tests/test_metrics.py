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
