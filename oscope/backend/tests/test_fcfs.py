import os
import sys

# Ensure backend directory is in path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.schemas import Process
from app.scheduling.algorithms.fcfs import FCFSScheduler

def test_fcfs_basic():
    scheduler = FCFSScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=5),
        Process(id="P2", arrival_time=1, burst_time=3),
        Process(id="P3", arrival_time=2, burst_time=8)
    ]
    result = scheduler.simulate(processes)
    
    assert len(result.gantt_chart) == 3
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[0].start_time == 0
    assert result.gantt_chart[0].end_time == 5
    
    assert result.gantt_chart[1].process_id == "P2"
    assert result.gantt_chart[1].start_time == 5
    assert result.gantt_chart[1].end_time == 8
    
    assert result.gantt_chart[2].process_id == "P3"
    assert result.gantt_chart[2].start_time == 8
    assert result.gantt_chart[2].end_time == 16

    assert result.metrics.cpu_utilization == 100.0
    assert result.metrics.throughput == 3 / 16

def test_fcfs_idle():
    scheduler = FCFSScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=2),
        Process(id="P2", arrival_time=5, burst_time=2)
    ]
    result = scheduler.simulate(processes)
    
    assert len(result.gantt_chart) == 3
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[1].process_id == "IDLE"
    assert result.gantt_chart[1].start_time == 2
    assert result.gantt_chart[1].end_time == 5
    assert result.gantt_chart[2].process_id == "P2"
    assert result.gantt_chart[2].start_time == 5
    assert result.gantt_chart[2].end_time == 7
    
    # 4 units of busy time out of 7 total time
    assert round(result.metrics.cpu_utilization, 2) == round((4 / 7) * 100, 2)

def test_fcfs_simultaneous_arrival():
    scheduler = FCFSScheduler()
    processes = [
        Process(id="P2", arrival_time=0, burst_time=3),
        Process(id="P1", arrival_time=0, burst_time=4)
    ]
    result = scheduler.simulate(processes)
    
    # P1 should go first due to ID tie-breaking
    assert result.gantt_chart[0].process_id == "P1"
    assert result.gantt_chart[1].process_id == "P2"
