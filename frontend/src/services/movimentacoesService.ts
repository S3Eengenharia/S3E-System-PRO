import { apiService } from './api';

export interface Movimentacao {
  id: string;
  materialId: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  motivo: string;
  referencia?: string;
  observacoes?: string;
  data: string;
  createdAt: string;
  material?: {
    id: string;
    nome: string;
    sku: string;
    estoque: number;
  };
}

export interface CreateMovimentacaoData {
  materialId: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  motivo: string;
  referencia?: string;
  observacoes?: string;
}

export interface UpdateMovimentacaoData {
  quantidade?: number;
  motivo?: string;
  observacoes?: string;
}

export interface MovimentacaoFilters {
  tipo?: string;
  materialId?: string;
  dataInicio?: string;
  dataFim?: string;
}

class MovimentacoesService {
  async listar(filters?: MovimentacaoFilters) {
    return apiService.get<Movimentacao[]>('/api/movimentacoes', filters);
  }

  async buscar(id: string) {
    return apiService.get<Movimentacao>(`/api/movimentacoes/${id}`);
  }

  async criar(data: CreateMovimentacaoData) {
    return apiService.post<Movimentacao>('/api/movimentacoes', data);
  }

  async atualizar(id: string, data: UpdateMovimentacaoData) {
    return apiService.put<Movimentacao>(`/api/movimentacoes/${id}`, data);
  }

  async deletar(id: string) {
    return apiService.delete<{ message: string }>(`/api/movimentacoes/${id}`);
  }
}

export const movimentacoesService = new MovimentacoesService();
