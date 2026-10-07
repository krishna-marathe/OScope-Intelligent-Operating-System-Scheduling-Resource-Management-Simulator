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

export const useCopilotStore = create<CopilotState>(() => ({
  messages: [],
  loading: false,
  error: null,
  panelVisible: false,
}));