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