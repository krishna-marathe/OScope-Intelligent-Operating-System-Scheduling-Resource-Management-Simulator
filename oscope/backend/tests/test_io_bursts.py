import pytest
from app.models.schemas import Process
from app.scheduling.algorithms.fcfs import FCFSScheduler
from app.scheduling.algorithms.srtf import SRTFScheduler
from app.scheduling.algorithms.rr import RRScheduler
from app.scheduling.algorithms.priority_p import PriorityPScheduler

def test_single_process_cpu_io_cpu():
    scheduler = FCFSScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=10, burst_sequence=[2, 3, 4])
    ]
    result = scheduler.simulate(processes)
    # CPU: 0-2, IO: 2-5, CPU: 5-9, IDLE: 2-5
    active_events = [e for e in result.gantt_chart if e.event_type != "IDLE"]
    assert len(active_events) == 3
    assert active_events[0].event_type == "CPU"
    assert active_events[0].end_time == 2
    assert active_events[1].event_type == "IO"
    assert active_events[1].start_time == 2
    assert active_events[1].end_time == 5
    assert active_events[2].event_type == "CPU"
    assert active_events[2].start_time == 5
    assert active_events[2].end_time == 9
    
    metrics = result.metrics.process_metrics[0]
    assert metrics.completion_time == 9
    assert metrics.turnaround_time == 9
    assert metrics.waiting_time == 0
    assert metrics.blocked_time == 3
    assert metrics.io_time == 3
    assert result.metrics.cpu_utilization == (6 / 9) * 100
    assert result.metrics.io_utilization == (3 / 9) * 100

def test_two_processes_overlap_cpu_io():
    scheduler = FCFSScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=10, burst_sequence=[2, 4, 2]),
        Process(id="P2", arrival_time=1, burst_time=10, burst_sequence=[4, 1, 1])
    ]
    result = scheduler.simulate(processes)
    
    # Timeline:
    # 0: P1 arrives -> Ready. P1 runs on CPU.
    # 1: P2 arrives -> Ready.
    # 2: P1 CPU done -> IO. P1 IO starts (2-6). P2 runs on CPU (2-6).
    # 6: P1 IO done -> Ready. P2 CPU done -> IO. P2 IO starts (6-7). P1 runs on CPU (6-8).
    # 7: P2 IO done -> Ready.
    # 8: P1 CPU done -> Terminated. P2 runs on CPU (8-9).
    
    gantt = result.gantt_chart
    # We should assert the specific CPU and IO events
    cpu_events = [e for e in gantt if e.event_type == "CPU"]
    io_events = [e for e in gantt if e.event_type == "IO"]
    
    assert cpu_events[0].process_id == "P1" and cpu_events[0].start_time == 0 and cpu_events[0].end_time == 2
    assert cpu_events[1].process_id == "P2" and cpu_events[1].start_time == 2 and cpu_events[1].end_time == 6
    assert cpu_events[2].process_id == "P1" and cpu_events[2].start_time == 6 and cpu_events[2].end_time == 8
    assert cpu_events[3].process_id == "P2" and cpu_events[3].start_time == 8 and cpu_events[3].end_time == 9
    
    assert io_events[0].process_id == "P1" and io_events[0].start_time == 2 and io_events[0].end_time == 6
    assert io_events[1].process_id == "P2" and io_events[1].start_time == 6 and io_events[1].end_time == 7
    
    m1 = next(m for m in result.metrics.process_metrics if m.process_id == "P1")
    assert m1.turnaround_time == 8
    assert m1.waiting_time == 0 # never waits in ready queue
    assert m1.blocked_time == 4
    
    m2 = next(m for m in result.metrics.process_metrics if m.process_id == "P2")
    assert m2.turnaround_time == 8 # 9 - 1
    assert m2.waiting_time == 2 # arrived at 1, ran at 2 (1 unit) + IO done at 7, ran at 8 (1 unit) = 2
    assert m2.blocked_time == 1

def test_multiple_io_requests_queued():
    scheduler = FCFSScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=10, burst_sequence=[1, 5, 1]),
        Process(id="P2", arrival_time=0, burst_time=10, burst_sequence=[2, 3, 1])
    ]
    result = scheduler.simulate(processes)
    # 0: P1 CPU (0-1).
    # 1: P1 IO starts (1-6). P2 CPU starts (1-3).
    # 3: P2 CPU done -> IO queue. Wait for P1.
    # 6: P1 IO done. P2 IO starts (6-9). P1 CPU starts (6-7).
    # 7: P1 done.
    # 9: P2 IO done. P2 CPU starts (9-10).
    # 10: P2 done.
    
    io_events = [e for e in result.gantt_chart if e.event_type == "IO"]
    assert io_events[0].process_id == "P1" and io_events[0].start_time == 1 and io_events[0].end_time == 6
    assert io_events[1].process_id == "P2" and io_events[1].start_time == 6 and io_events[1].end_time == 9
    
    m2 = next(m for m in result.metrics.process_metrics if m.process_id == "P2")
    assert m2.io_time == 3
    assert m2.blocked_time == 6 # waited 3-6 (3 units), IO 6-9 (3 units)

def test_rr_quantum_expiration_cpu_burst():
    scheduler = RRScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=10, burst_sequence=[5, 2, 2])
    ]
    result = scheduler.simulate(processes, time_quantum=2)
    # CPU: P1 (0-2), P1 (2-4), P1 (4-5)
    # IO: P1 (5-7)
    # CPU: P1 (7-9)
    cpu_events = [e for e in result.gantt_chart if e.event_type == "CPU"]
    assert len(cpu_events) == 2 # 0-5 should be merged or kept separate? DES merges contiguous CPU bursts of same process!
    assert cpu_events[0].start_time == 0 and cpu_events[0].end_time == 5
    assert cpu_events[1].start_time == 7 and cpu_events[1].end_time == 9

def test_srtf_preemption_on_current_burst():
    scheduler = SRTFScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=10, burst_sequence=[10, 1, 1]),
        Process(id="P2", arrival_time=2, burst_time=10, burst_sequence=[2, 1, 1])
    ]
    result = scheduler.simulate(processes)
    # P1 CPU starts. At 2, P1 remaining is 8. P2 remaining is 2.
    # P2 preempts P1.
    cpu_events = [e for e in result.gantt_chart if e.event_type == "CPU"]
    assert cpu_events[0].process_id == "P1" and cpu_events[0].start_time == 0 and cpu_events[0].end_time == 2
    assert cpu_events[1].process_id == "P2" and cpu_events[1].start_time == 2 and cpu_events[1].end_time == 4

def test_simultaneous_events_tie_breaking():
    # priority: arrival > IO > CPU > quantum > dispatch
    scheduler = PriorityPScheduler()
    processes = [
        Process(id="P1", arrival_time=0, burst_time=10, burst_sequence=[2, 2, 1], priority=2),
        Process(id="P2", arrival_time=4, burst_time=10, burst_sequence=[1, 1, 1], priority=1)
    ]
    result = scheduler.simulate(processes)
    # 0: P1 CPU(0-2)
    # 2: P1 IO(2-4)
    # 4: Simultaneous events! P1 IO complete. P2 Arrives.
    # Arrival processed before IO complete. P2 added to ready queue.
    # Then IO complete. P1 added to ready queue.
    # Preemption check after P2 arrival? P2 preempts CPU if active (none active).
    # Then P1 IO completes. Preemption check? None active.
    # CPU Dispatch: Ready queue = [P2, P1] (P2 is higher priority). P2 runs.
    cpu_events = [e for e in result.gantt_chart if e.event_type == "CPU"]
    assert cpu_events[1].process_id == "P2" and cpu_events[1].start_time == 4 and cpu_events[1].end_time == 5
