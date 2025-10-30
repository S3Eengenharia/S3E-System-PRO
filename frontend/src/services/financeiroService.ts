import { axiosApiService } from './axiosApi';
import { ENDPOINTS } from '../config/api';

export interface ContaReceber {
  id: string;
  vendaId: string;
  numeroParcela: number;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  observacoes?: string;
  cliente?: {
    id: string;
    nome: string;
  };
  venda?: {
    id: string;
    valorTotal: number;
  };
}

export interface ContaPagar {
  id: string;
  fornecedorId?: string;
  fornecedorNome?: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  numeroParcela?: number;
  totalParcelas?: number;
  compraId?: string;
  observacoes?: string;
}

export interface ResumoFinanceiro {
  receitaTotal: number;
  despesaTotal: number;
  lucroLiquido: number;
  contasReceber: number;
  contasPagar: number;
  saldoAtual: number;
  receitaMes: number;
  despesaMes: number;
  lucroMes: number;
}

export interface DadosFinanceirosMensais {
  mes: string;
  receita: number;
  despesa: number;
  lucro: number;
}

export interface FinanceiroFilters {
  dataInicio?: string;
  dataFim?: string;
  status?: string;
  tipo?: 'receber' | 'pagar';
}

class FinanceiroService {
  /**
   * Buscar resumo financeiro geral
   */
  async getResumo(): Promise<{ success: boolean; data?: ResumoFinanceiro; error?: string }> {
    try {
      console.log('📊 Carregando resumo financeiro...');
      
      const response = await axiosApiService.get<ResumoFinanceiro>(ENDPOINTS.RELATORIOS.FINANCEIRO_RESUMO);
      
      if (response.success && response.data) {
        console.log('✅ Resumo financeiro carregado:', response.data);
        return { success: true, data: response.data };
      } else {
        console.warn('⚠️ Erro ao carregar resumo:', response);
        return { success: false, error: response.error || 'Erro ao carregar resumo financeiro' };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar resumo financeiro:', error);
      return { success: false, error: 'Erro de conexão com o backend' };
    }
  }

  /**
   * Buscar dados financeiros mensais (12 meses)
   */
  async getDadosMensais(): Promise<{ success: boolean; data?: DadosFinanceirosMensais[]; error?: string }> {
    try {
      console.log('📈 Carregando dados financeiros mensais...');
      
      const response = await axiosApiService.get<DadosFinanceirosMensais[]>(ENDPOINTS.RELATORIOS.FINANCEIRO);
      
      if (response.success && response.data) {
        console.log('✅ Dados mensais carregados:', response.data);
        return { success: true, data: response.data };
      } else {
        console.warn('⚠️ Erro ao carregar dados mensais:', response);
        return { success: false, error: response.error || 'Erro ao carregar dados mensais' };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados mensais:', error);
      return { success: false, error: 'Erro de conexão com o backend' };
    }
  }

  /**
   * Listar contas a receber
   */
  async listarContasReceber(filters?: FinanceiroFilters): Promise<{ success: boolean; data?: ContaReceber[]; error?: string }> {
    try {
      console.log('📥 Carregando contas a receber...', filters);
      
      // As contas a receber vêm das vendas
      const response = await axiosApiService.get<any[]>('/api/vendas', filters);
      
      if (response.success && response.data) {
        // Extrair contas a receber das vendas
        const contas: ContaReceber[] = [];
        const vendas = Array.isArray(response.data) ? response.data : response.data?.vendas || [];
        
        vendas.forEach((venda: any) => {
          if (venda.contasReceber && Array.isArray(venda.contasReceber)) {
            contas.push(...venda.contasReceber);
          }
        });
        
        console.log(`✅ ${contas.length} contas a receber carregadas`);
        return { success: true, data: contas };
      } else {
        console.warn('⚠️ Erro ao carregar contas a receber:', response);
        return { success: false, error: response.error || 'Erro ao carregar contas a receber' };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contas a receber:', error);
      return { success: false, error: 'Erro de conexão com o backend' };
    }
  }

  /**
   * Listar contas a pagar
   */
  async listarContasPagar(filters?: FinanceiroFilters): Promise<{ success: boolean; data?: ContaPagar[]; error?: string }> {
    try {
      console.log('📤 Carregando contas a pagar...', filters);
      
      const response = await axiosApiService.get<ContaPagar[]>('/api/contas-pagar', filters);
      
      if (response.success && response.data) {
        const contas = Array.isArray(response.data) ? response.data : [];
        console.log(`✅ ${contas.length} contas a pagar carregadas`);
        return { success: true, data: contas };
      } else {
        console.warn('⚠️ Erro ao carregar contas a pagar:', response);
        return { success: false, error: response.error || 'Erro ao carregar contas a pagar' };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contas a pagar:', error);
      return { success: false, error: 'Erro de conexão com o backend' };
    }
  }

  /**
   * Pagar conta a pagar
   */
  async pagarContaPagar(id: string, data: { dataPagamento: string; valorPago: number; observacoes?: string }): Promise<{ success: boolean; data?: ContaPagar; error?: string }> {
    try {
      console.log(`💳 Pagando conta a pagar ${id}...`, data);
      
      const response = await axiosApiService.put<ContaPagar>(`/api/contas-pagar/${id}/pagar`, data);
      
      if (response.success && response.data) {
        console.log('✅ Conta paga com sucesso:', response.data);
        return { success: true, data: response.data };
      } else {
        console.warn('⚠️ Erro ao pagar conta:', response);
        return { success: false, error: response.error || 'Erro ao pagar conta' };
      }
    } catch (error) {
      console.error('❌ Erro ao pagar conta:', error);
      return { success: false, error: 'Erro de conexão com o backend' };
    }
  }

  /**
   * Criar conta a pagar
   */
  async criarContaPagar(data: {
    fornecedorId?: string;
    fornecedorNome?: string;
    descricao: string;
    valor: number;
    dataVencimento: string;
    observacoes?: string;
  }): Promise<{ success: boolean; data?: ContaPagar; error?: string }> {
    try {
      console.log('📝 Criando conta a pagar...', data);
      
      const response = await axiosApiService.post<ContaPagar>('/api/contas-pagar', data);
      
      if (response.success && response.data) {
        console.log('✅ Conta criada com sucesso:', response.data);
        return { success: true, data: response.data };
      } else {
        console.warn('⚠️ Erro ao criar conta:', response);
        return { success: false, error: response.error || 'Erro ao criar conta' };
      }
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      return { success: false, error: 'Erro de conexão com o backend' };
    }
  }
}

export const financeiroService = new FinanceiroService();

