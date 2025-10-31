import { apiService } from './api';

export interface ItemCompra {
  id: string;
  materialId: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  material?: any;
}

export interface Compra {
  id: string;
  fornecedorId: string;
  valorTotal: number;
  status: 'Pendente' | 'Aprovado' | 'Recebido' | 'Cancelado';
  dataCompra: string;
  dataEntregaPrevista?: string;
  dataEntregaReal?: string;
  notaFiscal?: string;
  observacoes?: string;
  itens?: ItemCompra[];
  fornecedor?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedXMLData {
  fornecedor: {
    cnpj: string;
    nome: string;
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  valorTotal: number;
  numeroNota: string;
  dataEmissao: string;
}

class ComprasService {
  /**
   * Listar todas as compras
   */
  async getCompras(params?: {
    status?: string;
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    const resp = await apiService.get<any>('/api/compras', params);
    // Desenvelopa: alguns endpoints retornam { success, data } ou apenas []
    if (Array.isArray(resp)) return resp as Compra[];
    if (Array.isArray((resp as any).data)) return (resp as any).data as Compra[];
    if (Array.isArray((resp as any)?.data?.data)) return (resp as any).data.data as Compra[];
    return [] as Compra[];
  }

  /**
   * Criar nova compra
   */
  async createCompra(data: any) {
    const resp = await apiService.post<any>('/api/compras', data);
    return (resp as any)?.data ?? resp;
  }

  /**
   * Atualizar status da compra
   */
  async updateCompraStatus(id: string, status: 'Pendente' | 'Aprovado' | 'Recebido' | 'Cancelado', dataEntregaReal?: string) {
    return apiService.put<Compra>(`/api/compras/${id}/status`, { 
      status,
      dataEntregaReal 
    });
  }

  /**
   * Fazer parse de XML de nota fiscal
   */
  async parseXML(file: File) {
    const formData = new FormData();
    formData.append('xml', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${apiService['baseURL']}/api/compras/parse-xml`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer parse do XML');
    }

    return await response.json();
  }
}

export const comprasService = new ComprasService();

