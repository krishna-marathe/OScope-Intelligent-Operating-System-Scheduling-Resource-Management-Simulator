import os

WORKSPACE_DIR = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP"
FRONTEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "frontend")
BACKEND_DIR = os.path.join(WORKSPACE_DIR, "oscope", "backend")

# Frontend Dirs
COPILOT_FE_DIR = os.path.join(FRONTEND_DIR, "src", "features", "copilot")
DIRS_FE = [
    os.path.join(COPILOT_FE_DIR, "components"),
    os.path.join(COPILOT_FE_DIR, "context"),
    os.path.join(COPILOT_FE_DIR, "intent"),
    os.path.join(COPILOT_FE_DIR, "actions"),
    os.path.join(COPILOT_FE_DIR, "reasoning"),
    os.path.join(COPILOT_FE_DIR, "store"),
    os.path.join(COPILOT_FE_DIR, "api")
]
for d in DIRS_FE:
    os.makedirs(d, exist_ok=True)

# Frontend Files
with open(os.path.join(COPILOT_FE_DIR, "store", "useCopilotStore.ts"), "w", encoding="utf-8") as f:
    f.write("""
import { create } from 'zustand';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  content: string;
  blocks?: any[];
}

interface CopilotState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  panelVisible: boolean;
}

export const useCopilotStore = create<CopilotState>((set) => ({
  messages: [],
  loading: false,
  error: null,
  panelVisible: false,
}));
""".strip())

with open(os.path.join(COPILOT_FE_DIR, "components", "CopilotPanel.tsx"), "w", encoding="utf-8") as f:
    f.write("""
import React from 'react';
import { useCopilotStore } from '../store/useCopilotStore';

export const CopilotPanel: React.FC = () => {
  const { messages, loading, panelVisible } = useCopilotStore();
  if (!panelVisible) return null;

  return (
    <div className="copilot-panel">
      <h2>OScope AI Copilot</h2>
      <div className="messages">
         {messages.map(m => <div key={m.id}>{m.sender}: {m.content}</div>)}
         {loading && <div>Thinking...</div>}
      </div>
      <div className="input-area">
        <input type="text" placeholder="Ask about the simulation..." />
        <button>Send</button>
      </div>
    </div>
  );
};
""".strip())

# Backend Dirs
COPILOT_BE_DIR = os.path.join(BACKEND_DIR, "app", "copilot")
DIRS_BE = [
    os.path.join(COPILOT_BE_DIR, "services")
]
for d in DIRS_BE:
    os.makedirs(d, exist_ok=True)

# Backend Files
with open(os.path.join(COPILOT_BE_DIR, "intent.py"), "w", encoding="utf-8") as f:
    f.write("""
def detect_intent(message: str) -> dict:
    msg = message.lower()
    if "why" in msg or "explain" in msg:
        if "algorithm" in msg or "win" in msg or "better" in msg:
            return {"intent": "EXPLAIN_ALGORITHM", "confidence": 0.9}
        return {"intent": "EXPLAIN_RESULT", "confidence": 0.8}
    elif "what if" in msg or "what-if" in msg:
        return {"intent": "WHAT_IF", "confidence": 0.9}
    return {"intent": "UNKNOWN", "confidence": 0.5}
""".strip())

with open(os.path.join(COPILOT_BE_DIR, "router.py"), "w", encoding="utf-8") as f:
    f.write("""
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
""".strip())

print("Phase 13.8 files created successfully!")
