import { axiosApiService } from './axiosApi';
import { ENDPOINTS } from '../config/api';

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
    return axiosApiService.get<Movimentacao[]>(ENDPOINTS.MOVIMENTACOES, filters);
  }

  async buscar(id: string) {
    return axiosApiService.get<Movimentacao>(`${ENDPOINTS.MOVIMENTACOES}/${id}`);
  }

  async criar(data: CreateMovimentacaoData) {
    return axiosApiService.post<Movimentacao>(ENDPOINTS.MOVIMENTACOES, data);
  }

  async atualizar(id: string, data: UpdateMovimentacaoData) {
    return axiosApiService.put<Movimentacao>(`${ENDPOINTS.MOVIMENTACOES}/${id}`, data);
  }

  async deletar(id: string) {
    return axiosApiService.delete<{ message: string }>(`${ENDPOINTS.MOVIMENTACOES}/${id}`);
  }
}

export const movimentacoesService = new MovimentacoesService();
