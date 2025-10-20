import { Request, Response } from 'express';
import { RelatoriosService } from '../services/relatorios.service';

export class RelatoriosController {
    /**
     * Retorna dados financeiros mensais para gráficos
     */
    static async getDadosFinanceiros(req: Request, res: Response) {
        try {
            const dados = await RelatoriosService.getDadosFinanceirosMensais();

            res.json({
                success: true,
                data: dados
            });

        } catch (error) {
            console.error('Erro ao buscar dados financeiros:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna resumo financeiro geral
     */
    static async getResumoFinanceiro(req: Request, res: Response) {
        try {
            const resumo = await RelatoriosService.getResumoFinanceiro();

            res.json({
                success: true,
                data: resumo
            });

        } catch (error) {
            console.error('Erro ao buscar resumo financeiro:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna estatísticas de vendas por mês
     */
    static async getEstatisticasVendas(req: Request, res: Response) {
        try {
            const { meses = 12 } = req.query;
            const dados = await RelatoriosService.getEstatisticasVendas(parseInt(meses as string));

            res.json({
                success: true,
                data: dados
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas de vendas:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna top clientes por valor de vendas
     */
    static async getTopClientes(req: Request, res: Response) {
        try {
            const { limite = 10 } = req.query;
            const dados = await RelatoriosService.getTopClientes(parseInt(limite as string));

            res.json({
                success: true,
                data: dados
            });

        } catch (error) {
            console.error('Erro ao buscar top clientes:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna dashboard completo com todos os dados
     */
    static async getDashboardCompleto(req: Request, res: Response) {
        try {
            const dashboard = await RelatoriosService.getDashboardCompleto();

            res.json({
                success: true,
                data: dashboard
            });

        } catch (error) {
            console.error('Erro ao buscar dashboard completo:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}

