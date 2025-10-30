import { axiosApiService, type ApiResponse } from './axiosApi';

export interface PessoaDTO {
  id?: string;
  nome: string;
  email?: string;
  funcao: 'TECNICO_1' | 'ELETRICISTA_2' | 'ENGENHEIRO' | 'AUXILIAR';
  disponivel?: boolean;
}

class PessoaService {
  async getAllPessoas(params?: { busca?: string; funcao?: string; disponivel?: boolean; ativo?: boolean }): Promise<ApiResponse<PessoaDTO[]>> {
    return axiosApiService.get<PessoaDTO[]>('/api/pessoas', params);
  }

  async getDisponiveisParaEquipe(): Promise<ApiResponse<PessoaDTO[]>> {
    return axiosApiService.get<PessoaDTO[]>('/api/pessoas/disponiveis');
  }

  async createPessoa(data: PessoaDTO): Promise<ApiResponse<PessoaDTO>> {
    return axiosApiService.post<PessoaDTO>('/api/pessoas', data);
  }

  async updatePessoa(id: string, data: Partial<PessoaDTO>): Promise<ApiResponse<PessoaDTO>> {
    return axiosApiService.put<PessoaDTO>(`/api/pessoas/${id}`, data);
  }

  async deletePessoa(id: string): Promise<ApiResponse<PessoaDTO>> {
    return axiosApiService.delete<PessoaDTO>(`/api/pessoas/${id}`);
  }
}

export const pessoaService = new PessoaService();


