from fastapi import APIRouter
from pydantic import BaseModel
from .intent import detect_intent

router = APIRouter(prefix="/api/v1/copilot")

class QueryRequest(BaseModel):
    message: str
    context: dict
    selected_entity: str | None = None

@router.post("/query")
def query_copilot(req: QueryRequest):
    intent_data = detect_intent(req.message)
    intent = intent_data["intent"]
    
    if intent == "UNKNOWN":
        return {"response": [{"type": "text", "content": "I don't have enough simulation evidence to answer that reliably."}]}
    elif intent == "WHAT_IF":
        return {"response": [{"type": "what-if", "content": "Proposed scenario requires isolated simulation execution."}]}
    
    return {"response": [{"type": "text", "content": f"Determined intent: {intent}. Evidence supports this."}]}