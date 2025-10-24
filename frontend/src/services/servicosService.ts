import { apiService } from './api';

export interface Servico {
  id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  tipo: string;
  preco: number;
  unidade: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicoData {
  nome: string;
  codigo: string;
  descricao?: string;
  tipo: string;
  preco: number;
  unidade?: string;
}

export interface UpdateServicoData extends Partial<CreateServicoData> {
  ativo?: boolean;
}

export interface ServicoFilters {
  tipo?: string;
  ativo?: boolean;
  search?: string;
}

class ServicosService {
  async listar(filters?: ServicoFilters) {
    return apiService.get<Servico[]>('/api/servicos', filters);
  }

  async buscar(id: string) {
    return apiService.get<Servico>(`/api/servicos/${id}`);
  }

  async criar(data: CreateServicoData) {
    return apiService.post<Servico>('/api/servicos', data);
  }

  async atualizar(id: string, data: UpdateServicoData) {
    return apiService.put<Servico>(`/api/servicos/${id}`, data);
  }

  async desativar(id: string) {
    return apiService.delete<Servico>(`/api/servicos/${id}`);
  }
}

export const servicosService = new ServicosService();
