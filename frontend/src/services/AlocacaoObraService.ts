import { axiosApiService, type ApiResponse } from './axiosApi';

export interface AlocacaoDTO {
  id: string;
  equipe: {
    id: string;
    nome: string;
    tipo: string;
  };
  projeto: {
    id: string;
    titulo: string;
    cliente?: string;
  };
  dataInicio: string | Date;
  dataFimPrevisto: string | Date;
  dataFimReal?: string | Date | null;
  status: 'Planejada' | 'EmAndamento' | 'Concluida' | 'Cancelada' | string;
  observacoes?: string | null;
}

export interface AlocarEquipeInput {
  equipeId: string;
  projetoId: string;
  dataInicio: string | Date;
  duracaoDias: number;
  observacoes?: string;
}

class AlocacaoObraService {
  private unwrap<T>(res: ApiResponse<any>): ApiResponse<T> {
    if (!res.success) return res as unknown as ApiResponse<T>;
    const payload = res.data as any;
    const data = payload?.data ?? payload;
    return { success: true, data } as ApiResponse<T>;
  }

  async alocarEquipe(data: AlocarEquipeInput): Promise<ApiResponse<AlocacaoDTO>> {
    const res = await axiosApiService.post<any>('/api/obras/alocar', data);
    return this.unwrap<AlocacaoDTO>(res);
  }

  async getAlocacoesPorProjeto(projetoId: string): Promise<ApiResponse<AlocacaoDTO[]>> {
    const res = await axiosApiService.get<any>('/api/obras/alocacoes', { projetoId });
    return this.unwrap<AlocacaoDTO[]>(res);
  }

  async getAllAlocacoes(): Promise<ApiResponse<AlocacaoDTO[]>> {
    const res = await axiosApiService.get<any>('/api/obras/alocacoes');
    return this.unwrap<AlocacaoDTO[]>(res);
  }

  async iniciarAlocacao(id: string): Promise<ApiResponse<AlocacaoDTO>> {
    const res = await axiosApiService.put<any>(`/api/obras/alocacoes/${id}/iniciar`);
    return this.unwrap<AlocacaoDTO>(res);
  }

  async concluirAlocacao(id: string, dataFimReal?: string | Date): Promise<ApiResponse<AlocacaoDTO>> {
    const res = await axiosApiService.put<any>(`/api/obras/alocacoes/${id}/concluir`, { dataFimReal });
    return this.unwrap<AlocacaoDTO>(res);
  }

  async cancelarAlocacao(id: string, motivo?: string): Promise<ApiResponse<AlocacaoDTO>> {
    const res = await axiosApiService.put<any>(`/api/obras/alocacoes/${id}/cancelar`, { motivo });
    return this.unwrap<AlocacaoDTO>(res);
  }
}

export const alocacaoObraService = new AlocacaoObraService();


