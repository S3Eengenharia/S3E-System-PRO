import { axiosApiService } from './axiosApi';

export interface ProcessedItem {
  codigo: string;
  nome: string;
  unidade: string;
  quantidade: number;
  preco_unitario: number;
  preco_atual?: number;
  diferenca_percentual?: number;
  status: 'Lower' | 'Higher' | 'Equal' | 'NoHistory';
}

export interface ProcessedCSVResult {
  fornecedor: string;
  items: ProcessedItem[];
  resumo: {
    total_itens: number;
    menores: number;
    maiores: number;
    iguais: number;
    sem_historico: number;
  };
}

class ComparacaoPrecosService {
  async uploadCSV(file: File, supplierName: string) {
    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('fornecedor', supplierName);
    
    return axiosApiService.post<ProcessedCSVResult>('/api/comparacao-precos/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async buscarHistorico(codigoMaterial: string) {
    return axiosApiService.get(`/api/comparacao-precos/historico/${codigoMaterial}`);
  }

  async atualizarPrecos(items: ProcessedItem[]) {
    return axiosApiService.post('/api/comparacao-precos/atualizar-precos', { items });
  }
}

export const comparacaoPrecosService = new ComparacaoPrecosService();
