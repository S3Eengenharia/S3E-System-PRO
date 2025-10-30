import { axiosApiService } from './axiosApi';
import { ENDPOINTS } from '../config/api';
import { type Project, type MaterialItem } from '../types';

export interface DashboardEstatisticas {
    clientes: { total: number; ativos: number };
    fornecedores: { total: number; ativos: number };
    projetos: { ativos: number; pendentes: number };
    vendas: { mesAtual: number };
    estoque: { materiaisBaixo: number };
    equipes: { total: number; ativas: number };
}

export interface DashboardGraficos {
    vendasPorMes: Array<{
        mes: string;
        quantidade: number;
        valor: number;
    }>;
    projetosPorStatus: Array<{
        status: string;
        quantidade: number;
    }>;
    materiaisMaisVendidos: Array<{
        materialId: string;
        nome: string;
        sku: string;
        quantidade: number;
        vendas: number;
    }>;
}

export interface DashboardAlertas {
    estoqueBaixo: {
        titulo: string;
        nivel: string;
        itens: Array<{
            id: string;
            nome: string;
            sku: string;
            estoque: number;
            estoqueMinimo: number;
            diferenca: number;
        }>;
    };
    orcamentosVencendo: {
        titulo: string;
        nivel: string;
        itens: Array<{
            id: string;
            titulo: string;
            cliente: string;
            validade: string;
            diasRestantes: number;
        }>;
    };
    contasVencidas: {
        titulo: string;
        nivel: string;
        itens: Array<{
            id: string;
            descricao: string;
            fornecedor: string;
            valor: number;
            vencimento: string;
            diasAtraso: number;
        }>;
    };
    projetosAtrasados: {
        titulo: string;
        nivel: string;
        itens: Array<{
            id: string;
            titulo: string;
            cliente: string;
            previsao: string;
            diasAtraso: number;
        }>;
    };
}

export interface DashboardCompleto {
    estatisticas: DashboardEstatisticas;
    graficos: DashboardGraficos;
    alertas: DashboardAlertas;
    materiais: MaterialItem[];
    projetos: Project[];
    movimentacoes: any[];
}

class DashboardService {
    /**
     * Carrega todas as estatísticas do dashboard
     */
    async getEstatisticas(): Promise<{ success: boolean; data?: DashboardEstatisticas; error?: string }> {
        try {
            console.log('📊 Carregando estatísticas do dashboard...');
            
            const response = await axiosApiService.get(ENDPOINTS.DASHBOARD.ESTATISTICAS);
            
            if (response.success && response.data) {
                console.log('✅ Estatísticas carregadas:', response.data);
                return { success: true, data: response.data };
            } else {
                console.warn('⚠️ Resposta inválida da API:', response);
                return { success: false, error: 'Dados inválidos recebidos da API' };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            return { success: false, error: 'Erro de conexão com o backend' };
        }
    }

    /**
     * Carrega dados para gráficos do dashboard
     */
    async getGraficos(): Promise<{ success: boolean; data?: DashboardGraficos; error?: string }> {
        try {
            console.log('📈 Carregando dados de gráficos...');
            
            const response = await axiosApiService.get(ENDPOINTS.DASHBOARD.GRAFICOS);
            
            if (response.success && response.data) {
                console.log('✅ Dados de gráficos carregados:', response.data);
                return { success: true, data: response.data };
            } else {
                console.warn('⚠️ Resposta inválida da API de gráficos:', response);
                return { success: false, error: 'Dados de gráficos inválidos' };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados de gráficos:', error);
            return { success: false, error: 'Erro ao carregar gráficos' };
        }
    }

    /**
     * Carrega alertas críticos do sistema
     */
    async getAlertas(): Promise<{ success: boolean; data?: DashboardAlertas; error?: string }> {
        try {
            console.log('🚨 Carregando alertas críticos...');
            
            const response = await axiosApiService.get(ENDPOINTS.DASHBOARD.ALERTAS);
            
            if (response.success && response.data) {
                console.log('✅ Alertas carregados:', response.data);
                return { success: true, data: response.data };
            } else {
                console.warn('⚠️ Resposta inválida da API de alertas:', response);
                return { success: false, error: 'Dados de alertas inválidos' };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar alertas:', error);
            return { success: false, error: 'Erro ao carregar alertas' };
        }
    }

    /**
     * Carrega materiais do estoque
     */
    async getMateriais(): Promise<{ success: boolean; data?: MaterialItem[]; error?: string }> {
        try {
            console.log('📦 Carregando materiais...');
            
            const response = await axiosApiService.get(ENDPOINTS.MATERIAIS);
            
            if (response.success && response.data) {
                const materiaisData = Array.isArray(response.data) ? response.data : [];
                console.log(`✅ ${materiaisData.length} materiais carregados`);
                return { success: true, data: materiaisData };
            } else {
                console.warn('⚠️ Resposta inválida da API de materiais:', response);
                return { success: false, error: 'Dados de materiais inválidos' };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar materiais:', error);
            return { success: false, error: 'Erro ao carregar materiais' };
        }
    }

    /**
     * Carrega projetos ativos
     */
    async getProjetos(): Promise<{ success: boolean; data?: Project[]; error?: string }> {
        try {
            console.log('🏗️ Carregando projetos...');
            
            const response = await axiosApiService.get(ENDPOINTS.PROJETOS);
            
            if (response.success && response.data) {
                const projetosData = Array.isArray(response.data) ? response.data : [];
                console.log(`✅ ${projetosData.length} projetos carregados`);
                return { success: true, data: projetosData };
            } else {
                console.warn('⚠️ Resposta inválida da API de projetos:', response);
                return { success: false, error: 'Dados de projetos inválidos' };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar projetos:', error);
            return { success: false, error: 'Erro ao carregar projetos' };
        }
    }

    /**
     * Carrega movimentações recentes
     */
    async getMovimentacoes(): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            console.log('🔄 Carregando movimentações...');
            
            const response = await axiosApiService.get(ENDPOINTS.MOVIMENTACOES);
            
            if (response.success && response.data) {
                const movimentacoesData = Array.isArray(response.data) ? response.data : [];
                console.log(`✅ ${movimentacoesData.length} movimentações carregadas`);
                return { success: true, data: movimentacoesData };
            } else {
                console.warn('⚠️ Resposta inválida da API de movimentações:', response);
                return { success: false, error: 'Dados de movimentações inválidos' };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar movimentações:', error);
            return { success: false, error: 'Erro ao carregar movimentações' };
        }
    }

    /**
     * Carrega todos os dados do dashboard de uma vez
     */
    async getDashboardCompleto(): Promise<{ success: boolean; data?: DashboardCompleto; errors?: string[] }> {
        try {
            console.log('🔄 Carregando dashboard completo...');
            
            const [
                estatisticasResult,
                graficosResult,
                alertasResult,
                materiaisResult,
                projetosResult,
                movimentacoesResult
            ] = await Promise.allSettled([
                this.getEstatisticas(),
                this.getGraficos(),
                this.getAlertas(),
                this.getMateriais(),
                this.getProjetos(),
                this.getMovimentacoes()
            ]);

            const errors: string[] = [];
            const dashboardData: any = {};

            // Processar resultados
            if (estatisticasResult.status === 'fulfilled' && estatisticasResult.value.success) {
                dashboardData.estatisticas = estatisticasResult.value.data;
            } else {
                errors.push('Erro ao carregar estatísticas');
                dashboardData.estatisticas = this.getDefaultEstatisticas();
            }

            if (graficosResult.status === 'fulfilled' && graficosResult.value.success) {
                dashboardData.graficos = graficosResult.value.data;
            } else {
                errors.push('Erro ao carregar gráficos');
            }

            if (alertasResult.status === 'fulfilled' && alertasResult.value.success) {
                dashboardData.alertas = alertasResult.value.data;
            } else {
                errors.push('Erro ao carregar alertas');
            }

            if (materiaisResult.status === 'fulfilled' && materiaisResult.value.success) {
                dashboardData.materiais = materiaisResult.value.data;
            } else {
                errors.push('Erro ao carregar materiais');
                dashboardData.materiais = [];
            }

            if (projetosResult.status === 'fulfilled' && projetosResult.value.success) {
                dashboardData.projetos = projetosResult.value.data;
            } else {
                errors.push('Erro ao carregar projetos');
                dashboardData.projetos = [];
            }

            if (movimentacoesResult.status === 'fulfilled' && movimentacoesResult.value.success) {
                dashboardData.movimentacoes = movimentacoesResult.value.data;
            } else {
                errors.push('Erro ao carregar movimentações');
                dashboardData.movimentacoes = [];
            }

            console.log(`📊 Dashboard carregado com ${errors.length} erros:`, errors);
            
            return {
                success: errors.length < 3, // Considera sucesso se menos de metade falhou
                data: dashboardData,
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (error) {
            console.error('❌ Erro crítico ao carregar dashboard:', error);
            return {
                success: false,
                errors: ['Erro crítico na conexão com o backend']
            };
        }
    }

    /**
     * Retorna estatísticas padrão em caso de erro
     */
    private getDefaultEstatisticas(): DashboardEstatisticas {
        return {
            clientes: { total: 0, ativos: 0 },
            fornecedores: { total: 0, ativos: 0 },
            projetos: { ativos: 0, pendentes: 0 },
            vendas: { mesAtual: 0 },
            estoque: { materiaisBaixo: 0 },
            equipes: { total: 0, ativas: 0 }
        };
    }

    /**
     * Testa conectividade com o backend
     */
    async testarConectividade(): Promise<{ success: boolean; message: string; responseTime?: number }> {
        const startTime = Date.now();
        
        try {
            const response = await axiosApiService.get('/health');
            const responseTime = Date.now() - startTime;
            
            if (response.success || response.status === 'OK') {
                return {
                    success: true,
                    message: 'Backend conectado com sucesso',
                    responseTime
                };
            } else {
                return {
                    success: false,
                    message: 'Backend respondeu com erro'
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                success: false,
                message: 'Falha na conexão com o backend',
                responseTime
            };
        }
    }
}

// Exportar instância única do serviço
export const dashboardService = new DashboardService();

// Exportar classe para uso avançado
export { DashboardService };