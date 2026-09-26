import axios from 'axios';
import { SimulationRequest, SimulationResult, ExperimentSummary, ExperimentDetails } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`
});

export const api = {
  health: () => client.get('/health'),
  simulate: (req: SimulationRequest) => client.post<SimulationResult>('/simulate', req),
  compare: (req: any) => client.post('/compare', req),
  saveHistory: (req: any) => client.post('/history', req),
  listHistory: () => client.get<ExperimentSummary[]>('/history'),
  getHistory: (id: number) => client.get<ExperimentDetails>(`/history/${id}`),
  deleteHistory: (id: number) => client.delete(`/history/${id}`),
  recommend: (req: any) => client.post('/recommend', req)
};
