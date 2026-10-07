import statistics

def analyze_cpu_workload(workload: list) -> dict:
    if not workload:
        return {"process_count": 0}
    
    process_count = len(workload)
    bursts = [p.get('burst_time', 0) for p in workload]
    avg_burst = sum(bursts) / process_count if process_count > 0 else 0
    min_burst = min(bursts) if bursts else 0
    max_burst = max(bursts) if bursts else 0
    
    burst_variance = statistics.variance(bursts) if len(bursts) > 1 else 0
    burst_stddev = statistics.stdev(bursts) if len(bursts) > 1 else 0
    
    labels = []
    if avg_burst < 5:
        labels.append({"label": "SHORT_BURST", "reason": "Average burst time is low.", "evidence": f"Avg burst = {avg_burst}"})
    elif avg_burst > 15:
        labels.append({"label": "LONG_BURST", "reason": "Average burst time is high.", "evidence": f"Avg burst = {avg_burst}"})
        
    return {
        "process_count": process_count,
        "average_burst": avg_burst,
        "min_burst": min_burst,
        "max_burst": max_burst,
        "burst_variance": burst_variance,
        "burst_stddev": burst_stddev,
        "labels": labels
    }