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
