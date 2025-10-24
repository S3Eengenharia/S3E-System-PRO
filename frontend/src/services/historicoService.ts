import { apiService } from './api';

export interface HistoryLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId?: string;
  details?: string;
  ip?: string;
  timestamp: string;
}

export interface CreateHistoryLogData {
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId?: string;
  details?: string;
  ip?: string;
}

export interface HistoryFilters {
  module?: string;
  userId?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export interface HistoryResponse {
  historico: HistoryLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class HistoricoService {
  async listar(filters?: HistoryFilters) {
    return apiService.get<HistoryResponse>('/api/historico', filters);
  }

  async listarPorModulo(modulo: string, filters?: Omit<HistoryFilters, 'module'>) {
    return apiService.get<HistoryResponse>(`/api/historico/${modulo}`, filters);
  }

  async criar(data: CreateHistoryLogData) {
    return apiService.post<HistoryLog>('/api/historico', data);
  }
}

export const historicoService = new HistoricoService();
