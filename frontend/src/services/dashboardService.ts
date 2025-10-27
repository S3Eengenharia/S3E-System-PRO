import { apiService } from './api';

export interface Estatisticas {
  clientes: {
    total: number;
    ativos: number;
  };
  fornecedores: {
    total: number;
    ativos: number;
  };
  projetos: {
    ativos: number;
    pendentes: number;
  };
  vendas: {
    mesAtual: number;
  };
  estoque: {
    materiaisBaixo: number;
  };
  equipes: {
    total: number;
    ativas: number;
  };
}

export interface GraficoVendas {
  mes: string;
  quantidade: number;
  valor: number;
}

export interface GraficoProjetos {
  status: string;
  quantidade: number;
}

export interface MaterialMaisVendido {
  materialId: string;
  nome: string;
  sku: string;
  quantidade: number;
  vendas: number;
}

export interface Graficos {
  vendasPorMes: GraficoVendas[];
  projetosPorStatus: GraficoProjetos[];
  materiaisMaisVendidos: MaterialMaisVendido[];
}

export interface AlertaEstoque {
  id: string;
  nome: string;
  sku: string;
  estoque: number;
  estoqueMinimo: number;
  diferenca: number;
}

export interface AlertaOrcamento {
  id: string;
  titulo: string;
  cliente: string;
  validade: string;
  diasRestantes: number;
}

export interface AlertaConta {
  id: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  vencimento: string;
  diasAtraso: number;
}

export interface AlertaProjeto {
  id: string;
  titulo: string;
  cliente: string;
  previsao: string;
  diasAtraso: number;
}

export interface Alertas {
  estoqueBaixo: {
    titulo: string;
    nivel: string;
    itens: AlertaEstoque[];
  };
  orcamentosVencendo: {
    titulo: string;
    nivel: string;
    itens: AlertaOrcamento[];
  };
  contasVencidas: {
    titulo: string;
    nivel: string;
    itens: AlertaConta[];
  };
  projetosAtrasados: {
    titulo: string;
    nivel: string;
    itens: AlertaProjeto[];
  };
}

class DashboardService {
  async getEstatisticas() {
    return apiService.get<Estatisticas>('/api/dashboard/estatisticas');
  }

  async getGraficos(meses?: number) {
    return apiService.get<Graficos>('/api/dashboard/graficos', { meses });
  }

  async getAlertas() {
    return apiService.get<Alertas>('/api/dashboard/alertas');
  }
}

export const dashboardService = new DashboardService();
