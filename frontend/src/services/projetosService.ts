import { apiService } from './api';

export interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  tipo: string;
  clienteId: string;
  responsavelId: string;
  dataInicio: string;
  dataPrevisao: string;
  dataConclusao?: string;
  orcamentoId?: string;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    id: string;
    nome: string;
  };
  responsavel?: {
    id: string;
    nome: string;
  };
  orcamento?: {
    id: string;
    titulo: string;
    precoVenda: number;
  };
}

export interface CreateProjetoData {
  titulo: string;
  descricao: string;
  tipo: string;
  clienteId: string;
  responsavelId: string;
  dataInicio: string;
  dataPrevisao: string;
  orcamentoId?: string;
}

export interface UpdateProjetoData extends Partial<CreateProjetoData> {
  status?: string;
  dataConclusao?: string;
}

export interface ProjetoFilters {
  status?: string;
  tipo?: string;
  clienteId?: string;
  responsavelId?: string;
  search?: string;
}

class ProjetosService {
  async listar(filters?: ProjetoFilters) {
    return apiService.get<Projeto[]>('/api/projetos', filters);
  }

  async buscar(id: string) {
    return apiService.get<Projeto>(`/api/projetos/${id}`);
  }

  async criar(data: CreateProjetoData) {
    return apiService.post<Projeto>('/api/projetos', data);
  }

  async atualizar(id: string, data: UpdateProjetoData) {
    return apiService.put<Projeto>(`/api/projetos/${id}`, data);
  }

  async desativar(id: string) {
    return apiService.delete<Projeto>(`/api/projetos/${id}`);
  }
}

export const projetosService = new ProjetosService();
