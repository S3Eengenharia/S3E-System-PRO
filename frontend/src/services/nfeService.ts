import { axiosApiService } from './axiosApi';

export interface NotaFiscal {
  id: string;
  projetoId?: string;
  empresaFiscalId?: string;
  numero: string;
  serie: string;
  tipo: 'PRODUTO' | 'SERVICO';
  natureza: string;
  cfop: string;
  valorProdutos: number;
  valorServicos: number;
  valorTotal: number;
  status: string;
  dataEmissao: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  projeto?: {
    id: string;
    titulo: string;
    cliente: {
      id: string;
      nome: string;
    };
  };
}

export interface CreateNotaFiscalData {
  projetoId?: string;
  empresaFiscalId?: string;
  numero: string;
  serie: string;
  tipo: 'PRODUTO' | 'SERVICO';
  natureza: string;
  cfop: string;
  valorProdutos: number;
  valorServicos?: number;
  observacoes?: string;
}

export interface UpdateNotaFiscalData extends Partial<CreateNotaFiscalData> {
  status?: string;
}

export interface ValidarNotaFiscalData {
  numero: string;
  cfop: string;
  valorProdutos: number;
  valorServicos?: number;
  tipo: 'PRODUTO' | 'SERVICO';
  natureza: string;
}

export interface NotaFiscalFilters {
  status?: string;
  tipo?: string;
  projetoId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface ValidacaoResponse {
  isValid: boolean;
  erros: string[];
  valorTotal: number;
}

class NFeService {
  async listar(filters?: NotaFiscalFilters) {
    return axiosApiService.get<NotaFiscal[]>('/api/nfe', filters);
  }

  async buscar(id: string) {
    return axiosApiService.get<NotaFiscal>(`/api/nfe/${id}`);
  }

  async criar(data: CreateNotaFiscalData) {
    return axiosApiService.post<NotaFiscal>('/api/nfe', data);
  }

  async atualizar(id: string, data: UpdateNotaFiscalData) {
    return axiosApiService.put<NotaFiscal>(`/api/nfe/${id}`, data);
  }

  async cancelar(id: string, motivo?: string) {
    return axiosApiService.delete<NotaFiscal>(`/api/nfe/${id}`, { motivo });
  }

  async validar(data: ValidarNotaFiscalData) {
    return axiosApiService.post<ValidacaoResponse>('/api/nfe/validar', data);
  }
}

export const nfeService = new NFeService();
