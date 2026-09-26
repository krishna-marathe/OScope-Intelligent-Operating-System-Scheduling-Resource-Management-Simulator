import sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.priority_np import PriorityNPScheduler
def test_priority_np():
    scheduler = PriorityNPScheduler()
    processes = [Process(id="P1", arrival_time=0, burst_time=5, priority=2), Process(id="P2", arrival_time=0, burst_time=2, priority=1)]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P2"
    assert result.gantt_chart[1].process_id == "P1"
