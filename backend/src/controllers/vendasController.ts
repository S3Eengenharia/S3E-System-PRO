import { Request, Response } from 'express';
import { VendasService, VendaPayload } from '../services/vendas.service';
import { VendaStatus } from '../types/index';

export class VendasController {
    /**
     * Verifica disponibilidade de estoque para um orçamento
     */
    static async verificarEstoque(req: Request, res: Response) {
        try {
            const { orcamentoId } = req.params;

            if (!orcamentoId) {
                return res.status(400).json({
                    error: 'ID do orçamento é obrigatório'
                });
            }

            const verificacao = await VendasService.verificarEstoqueOrcamento(orcamentoId);

            res.json({
                success: true,
                data: verificacao
            });

        } catch (error) {
            console.error('Erro ao verificar estoque:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Realiza uma nova venda
     */
    static async realizarVenda(req: Request, res: Response) {
        try {
            const vendaData: VendaPayload = req.body;

            // Validar dados obrigatórios
            if (!vendaData.orcamentoId || !vendaData.clienteId || !vendaData.valorTotal) {
                return res.status(400).json({
                    error: 'Dados obrigatórios ausentes: orcamentoId, clienteId, valorTotal'
                });
            }

            const resultado = await VendasService.realizarVenda(vendaData);

            res.status(201).json({
                success: true,
                message: 'Venda realizada com sucesso',
                data: resultado
            });

        } catch (error) {
            console.error('Erro ao realizar venda:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Busca dados para o dashboard financeiro
     */
    static async getDashboard(req: Request, res: Response) {
        try {
            const dashboardData = await VendasService.getVendasDashboard();

            res.json({
                success: true,
                data: dashboardData
            });

        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Lista todas as vendas com paginação
     */
    static async listarVendas(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const resultado = await VendasService.listarVendas(
                parseInt(page as string),
                parseInt(limit as string)
            );

            res.json({
                success: true,
                data: resultado
            });

        } catch (error) {
            console.error('Erro ao listar vendas:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Busca uma venda específica
     */
    static async buscarVenda(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da venda é obrigatório'
                });
            }

            const venda = await VendasService.buscarVenda(id);

            if (!venda) {
                return res.status(404).json({
                    error: 'Venda não encontrada'
                });
            }

            res.json({
                success: true,
                data: venda
            });

        } catch (error) {
            console.error('Erro ao buscar venda:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Cancela uma venda
     */
    static async cancelarVenda(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da venda é obrigatório'
                });
            }

            const venda = await VendasService.cancelarVenda(id);

            res.json({
                success: true,
                message: 'Venda cancelada com sucesso',
                data: venda
            });

        } catch (error) {
            console.error('Erro ao cancelar venda:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Marca uma conta a receber como paga
     */
    static async pagarConta(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da conta a receber é obrigatório'
                });
            }

            const conta = await VendasService.pagarConta(id);

            res.json({
                success: true,
                message: 'Conta marcada como paga',
                data: conta
            });

        } catch (error) {
            console.error('Erro ao pagar conta:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}
