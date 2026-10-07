def detect_intent(message: str) -> dict:
    msg = message.lower()
    if "why" in msg or "explain" in msg:
        if "algorithm" in msg or "win" in msg or "better" in msg:
            return {"intent": "EXPLAIN_ALGORITHM", "confidence": 0.9}
        return {"intent": "EXPLAIN_RESULT", "confidence": 0.8}
    elif "what if" in msg or "what-if" in msg:
        return {"intent": "WHAT_IF", "confidence": 0.9}
    return {"intent": "UNKNOWN", "confidence": 0.5}