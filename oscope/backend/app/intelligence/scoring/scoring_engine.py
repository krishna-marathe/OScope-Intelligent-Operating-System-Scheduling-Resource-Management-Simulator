def rank_algorithms(results: list, weights: dict) -> list:
    if not results:
        return []
        
    ranked = []
    for res in results:
        # Example naive scoring based on waiting time (lower is better)
        waiting = res.get('average_waiting_time', 100)
        score = 1.0 / (1.0 + waiting) # Normalize
        
        ranked.append({
            "algorithm": res.get("algorithm", "Unknown"),
            "score": score,
            "evidence": ["Based on waiting time inversion"]
        })
        
    ranked.sort(key=lambda x: x['score'], reverse=True)
    return ranked