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
    try {
      console.log('📋 Carregando orçamentos...', params);
      
      const response = await axiosApiService.get<Orcamento[]>('/api/orcamentos', params);
      
      if (response.success && response.data) {
        const orcamentosData = Array.isArray(response.data) ? response.data : [];
        console.log(`✅ ${orcamentosData.length} orçamentos carregados`);
        
        return {
          success: true,
          data: orcamentosData,
          message: `${orcamentosData.length} orçamentos carregados`
        };
      } else {
        console.warn('⚠️ Resposta inválida da API de orçamentos:', response);
        return {
          success: false,
          error: response.error || 'Erro ao carregar orçamentos',
          data: []
        };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar orçamentos:', error);
      return {
        success: false,
        error: 'Erro de conexão ao carregar orçamentos',
        data: []
      };
    }
  }

  /**
   * Buscar orçamento por ID
   */
  async buscar(id: string) {
    try {
      console.log(`📋 Buscando orçamento ${id}...`);
      
      const response = await axiosApiService.get<Orcamento>(`/api/orcamentos/${id}`);
      
      if (response.success && response.data) {
        console.log('✅ Orçamento encontrado:', response.data);
        return {
          success: true,
          data: response.data
        };
      } else {
        console.warn('⚠️ Orçamento não encontrado:', response);
        return {
          success: false,
          error: response.error || 'Orçamento não encontrado'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao buscar orçamento:', error);
      return {
        success: false,
        error: 'Erro de conexão ao buscar orçamento'
      };
    }
  }

  /**
   * Criar novo orçamento
   */
  async criar(data: CreateOrcamentoData) {
    try {
      console.log('➕ Criando novo orçamento...', data);
      
      // Validações básicas
      if (!data.clienteId || !data.titulo || !data.validade) {
        return {
          success: false,
          error: 'Cliente, título e validade são obrigatórios'
        };
      }

      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: 'Adicione pelo menos um item ao orçamento'
        };
      }

      const response = await axiosApiService.post<Orcamento>('/api/orcamentos', data);
      
      if (response.success && response.data) {
        console.log('✅ Orçamento criado com sucesso:', response.data);
        return {
          success: true,
          data: response.data,
          message: 'Orçamento criado com sucesso'
        };
      } else {
        console.warn('⚠️ Erro ao criar orçamento:', response);
        return {
          success: false,
          error: response.error || 'Erro ao criar orçamento'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao criar orçamento:', error);
      return {
        success: false,
        error: 'Erro de conexão ao criar orçamento'
      };
    }
  }

  /**
   * Atualizar orçamento completo
   */
  async atualizar(id: string, data: CreateOrcamentoData) {
    try {
      console.log(`✏️ Atualizando orçamento ${id}...`, data);
      
      const response = await axiosApiService.put<Orcamento>(`/api/orcamentos/${id}`, data);
      
      if (response.success && response.data) {
        console.log('✅ Orçamento atualizado com sucesso:', response.data);
        return {
          success: true,
          data: response.data,
          message: 'Orçamento atualizado com sucesso'
        };
      } else {
        console.warn('⚠️ Erro ao atualizar orçamento:', response);
        return {
          success: false,
          error: response.error || 'Erro ao atualizar orçamento'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar orçamento:', error);
      return {
        success: false,
        error: 'Erro de conexão ao atualizar orçamento'
      };
    }
  }

  /**
   * Atualizar status do orçamento
   */
  async atualizarStatus(id: string, status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado') {
    try {
      console.log(`🔄 Atualizando status do orçamento ${id} para ${status}...`);
      
      const response = await axiosApiService.patch<Orcamento>(`/api/orcamentos/${id}/status`, { status });
      
      if (response.success && response.data) {
        console.log('✅ Status atualizado com sucesso:', response.data);
        return {
          success: true,
          data: response.data,
          message: `Status alterado para ${status}`
        };
      } else {
        console.warn('⚠️ Erro ao atualizar status:', response);
        return {
          success: false,
          error: response.error || 'Erro ao atualizar status'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return {
        success: false,
        error: 'Erro de conexão ao atualizar status'
      };
    }
  }

  /**
   * Excluir orçamento
   */
  async excluir(id: string) {
    try {
      console.log(`🗑️ Excluindo orçamento ${id}...`);
      
      const response = await axiosApiService.delete<void>(`/api/orcamentos/${id}`);
      
      if (response.success) {
        console.log('✅ Orçamento excluído com sucesso');
        return {
          success: true,
          message: 'Orçamento excluído com sucesso'
        };
      } else {
        console.warn('⚠️ Erro ao excluir orçamento:', response);
        return {
          success: false,
          error: response.error || 'Erro ao excluir orçamento'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir orçamento:', error);
      return {
        success: false,
        error: 'Erro de conexão ao excluir orçamento'
      };
    }
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
