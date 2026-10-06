import pytest
from app.models.schemas import Process
from app.scheduling.des_simulator import simulate_des

def test_cpu_only_lifecycle():
    p1 = Process(id="P1", arrival_time=0, burst_time=5)
    res = simulate_des([p1], policy="FCFS")
    
    assert res.lifecycles is not None
    lc = res.lifecycles
    
    assert len(lc) == 4
    assert lc[0].state == "NEW"
    assert lc[0].duration == 0
    assert lc[1].state == "READY"
    assert lc[1].duration == 0
    assert lc[2].state == "RUNNING"
    assert lc[2].start_time == 0
    assert lc[2].end_time == 5
    assert lc[3].state == "TERMINATED"

def test_cpu_io_cpu_lifecycle():
    p1 = Process(id="P1", arrival_time=0, burst_time=10, burst_sequence=[3, 4, 3])
    res = simulate_des([p1], policy="FCFS")
    lc = res.lifecycles
    
    states = [e.state for e in lc]
    # NEW -> READY -> RUNNING (3) -> BLOCKED (4) -> READY (0) -> RUNNING (3) -> TERMINATED
    assert states == ["NEW", "READY", "RUNNING", "BLOCKED", "READY", "RUNNING", "TERMINATED"]
    assert lc[3].duration == 4 # BLOCKED for 4
    assert lc[5].duration == 3 # RUNNING for 3

def test_multiple_io_bursts():
    p1 = Process(id="P1", arrival_time=0, burst_time=15, burst_sequence=[2, 2, 2, 2, 2])
    res = simulate_des([p1], policy="FCFS")
    lc = res.lifecycles
    
    blocked = [e for e in lc if e.state == "BLOCKED"]
    running = [e for e in lc if e.state == "RUNNING"]
    
    assert len(blocked) == 2
    assert len(running) == 3

def test_ready_waiting_periods():
    p1 = Process(id="P1", arrival_time=0, burst_time=5)
    p2 = Process(id="P2", arrival_time=1, burst_time=5)
    res = simulate_des([p1, p2], policy="FCFS")
    lc = res.lifecycles
    
    p2_ready = [e for e in lc if e.process_id == "P2" and e.state == "READY"][0]
    assert p2_ready.duration == 4 # Arrives at 1, starts running at 5
    assert p2_ready.start_time == 1
    assert p2_ready.end_time == 5

def test_simultaneous_events_and_ordering():
    p1 = Process(id="P1", arrival_time=0, burst_time=5, burst_sequence=[2, 2, 2])
    p2 = Process(id="P2", arrival_time=2, burst_time=5, burst_sequence=[2, 2, 2])
    res = simulate_des([p1, p2], policy="FCFS")
    
    # At t=2, P1 goes to IO, P2 arrives.
    # Check that events for both are ordered properly.
    assert sorted(res.lifecycles, key=lambda x: (x.process_id, x.start_time)) == res.lifecycles

def test_backward_compatibility():
    # Ensure it works with old RR / context switch
    p1 = Process(id="P1", arrival_time=0, burst_time=5)
    res = simulate_des([p1], policy="RR", time_quantum=2, context_switch_cost=1)
    
    assert res.lifecycles is not None
    lc = res.lifecycles
    # NEW -> READY -> RUNNING (2) -> READY (CS + rest) -> RUNNING (2) -> READY -> RUNNING (1) -> TERMINATED
    states = [e.state for e in lc]
    assert "NEW" in states
    assert "READY" in states
    assert "RUNNING" in states
    assert "TERMINATED" in states
