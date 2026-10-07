def compare_experiments(baseline: dict, experimental: dict):
    return {
        "baseline_metrics": baseline.get("metrics", {}),
        "experimental_metrics": experimental.get("metrics", {}),
        "deltas": {}
    }