import { axiosApiService } from './axiosApi';
import { API_CONFIG } from '../config/api';

export interface ItemOrcamento {
  id?: string;
  tipo: 'MATERIAL' | 'KIT' | 'SERVICO';
  materialId?: string;
  kitId?: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  descricao?: string;
}

export interface Orcamento {
  id: string;
  clienteId: string;
  titulo: string;
  descricao?: string;
  validade: string;
  status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado';
  bdi: number;
  custoTotal: number;
  precoVenda: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  aprovedAt?: string;
  cliente?: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
  items?: ItemOrcamento[];
}

export interface CreateOrcamentoData {
  clienteId: string;
  titulo: string;
  descricao?: string;
  validade: string;
  bdi?: number;
  observacoes?: string;
  items: ItemOrcamento[];
}

class OrcamentosServiceClass {
  /**
   * Listar todos os orçamentos
   */
  async listar(params?: {
    status?: string;
    clienteId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    return axiosApiService.get<Orcamento[]>('/api/orcamentos', params);
  }

  /**
   * Buscar orçamento por ID
   */
  async buscar(id: string) {
    return axiosApiService.get<Orcamento>(`/api/orcamentos/${id}`);
  }

  /**
   * Criar novo orçamento
   */
  async criar(data: CreateOrcamentoData) {
    return axiosApiService.post<Orcamento>('/api/orcamentos', data);
  }

  /**
   * Atualizar status do orçamento
   */
  async atualizarStatus(id: string, status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado') {
    return axiosApiService.patch<Orcamento>(`/api/orcamentos/${id}/status`, { status });
  }

  /**
   * Gerar PDF do orçamento para download
   */
  async gerarPDF(id: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pdf/orcamento/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }

    return await response.blob();
  }

  /**
   * Gerar PDF e obter URL para visualização
   */
  async gerarPDFURL(id: string) {
    return axiosApiService.get<{ url: string; dataUrl: string }>(`/api/pdf/orcamento/${id}/url`);
  }

  /**
   * Verificar se orçamento existe antes de gerar PDF
   */
  async verificarOrcamento(id: string) {
    return axiosApiService.get<{ exists: boolean; orcamento?: any }>(`/api/pdf/orcamento/${id}/check`);
  }

  /**
   * Baixar PDF do orçamento
   */
  async baixarPDF(id: string, nomeCliente: string) {
    try {
      const blob = await this.gerarPDF(id);
      
      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orcamento_${nomeCliente}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      return { success: false, error: 'Erro ao baixar PDF' };
    }
  }

  /**
   * Visualizar PDF em nova aba
   */
  async visualizarPDF(id: string) {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_CONFIG.BASE_URL}/api/pdf/orcamento/${id}/view`;
      
      window.open(`${url}?token=${token}`, '_blank');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao visualizar PDF:', error);
      return { success: false, error: 'Erro ao visualizar PDF' };
    }
  }

  /**
   * Enviar orçamento por email (se implementado no backend)
   */
  async enviarPorEmail(id: string, email: string) {
    return axiosApiService.post<{ success: boolean; message: string }>(
      `/api/orcamentos/${id}/enviar-email`,
      { email }
    );
  }
}

export const orcamentosService = new OrcamentosServiceClass();
