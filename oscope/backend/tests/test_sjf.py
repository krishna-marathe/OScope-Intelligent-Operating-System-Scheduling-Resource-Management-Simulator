import sys, os; sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.schemas import Process
from app.scheduling.algorithms.sjf import SJFScheduler
def test_sjf():
    scheduler = SJFScheduler()
    processes = [Process(id="P1", arrival_time=0, burst_time=6), Process(id="P2", arrival_time=0, burst_time=2)]
    result = scheduler.simulate(processes)
    assert result.gantt_chart[0].process_id == "P2"
    assert result.gantt_chart[1].process_id == "P1"
