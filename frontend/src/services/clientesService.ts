import { apiService } from './api';

export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: 'PF' | 'PJ';
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteData {
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: 'PF' | 'PJ';
}

export interface UpdateClienteData extends Partial<CreateClienteData> {
  ativo?: boolean;
}

export interface ClienteFilters {
  tipo?: string;
  ativo?: boolean;
  search?: string;
}

class ClientesService {
  async listar(filters?: ClienteFilters) {
    return apiService.get<Cliente[]>('/api/clientes', filters);
  }

  async buscar(id: string) {
    return apiService.get<Cliente>(`/api/clientes/${id}`);
  }

  async criar(data: CreateClienteData) {
    return apiService.post<Cliente>('/api/clientes', data);
  }

  async atualizar(id: string, data: UpdateClienteData) {
    return apiService.put<Cliente>(`/api/clientes/${id}`, data);
  }

  async desativar(id: string) {
    return apiService.delete<Cliente>(`/api/clientes/${id}`);
  }
}

export const clientesService = new ClientesService();
