import { apiService } from './api';

export interface Empresa {
  id: string;
  cnpj: string;
  inscricaoEstadual: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone?: string;
  email?: string;
  regimeTributario: string;
  certificadoPath?: string;
  certificadoSenha?: string;
  certificadoValidade?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmpresaData {
  cnpj: string;
  inscricaoEstadual: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone?: string;
  email?: string;
  regimeTributario: string;
  certificadoPath?: string;
  certificadoSenha?: string;
  certificadoValidade?: string;
}

export interface UpdateEmpresaData extends Partial<CreateEmpresaData> {
  ativo?: boolean;
}

export interface EmpresaFilters {
  ativo?: boolean;
  search?: string;
}

class EmpresasService {
  async listar(filters?: EmpresaFilters) {
    return apiService.get<Empresa[]>('/api/empresas', filters);
  }

  async buscar(id: string) {
    return apiService.get<Empresa>(`/api/empresas/${id}`);
  }

  async criar(data: CreateEmpresaData) {
    return apiService.post<Empresa>('/api/empresas', data);
  }

  async atualizar(id: string, data: UpdateEmpresaData) {
    return apiService.put<Empresa>(`/api/empresas/${id}`, data);
  }

  async desativar(id: string) {
    return apiService.delete<Empresa>(`/api/empresas/${id}`);
  }
}

export const empresasService = new EmpresasService();
