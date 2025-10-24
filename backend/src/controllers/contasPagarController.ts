import { Request, Response } from 'express';
import { ContasPagarService, ContaPagarPayload, ContaPagarParceladaPayload } from '../services/contasPagar.service';

export class ContasPagarController {
    /**
     * Cria uma nova conta a pagar
     */
    static async criarConta(req: Request, res: Response) {
        try {
            const contaData: ContaPagarPayload = req.body;

            // Validar dados obrigatórios
            if (!contaData.descricao || !contaData.valorParcela || !contaData.dataVencimento) {
                return res.status(400).json({
                    error: 'Dados obrigatórios ausentes: descricao, valorParcela, dataVencimento'
                });
            }

            const conta = await ContasPagarService.criarContaPagar(contaData);

            res.status(201).json({
                success: true,
                message: 'Conta a pagar criada com sucesso',
                data: conta
            });

        } catch (error) {
            console.error('Erro ao criar conta a pagar:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Cria contas a pagar parceladas
     */
    static async criarContasParceladas(req: Request, res: Response) {
        try {
            const contaData: ContaPagarParceladaPayload = req.body;

            // Validar dados obrigatórios
            if (!contaData.descricao || !contaData.valorTotal || !contaData.parcelas || !contaData.dataPrimeiroVencimento) {
                return res.status(400).json({
                    error: 'Dados obrigatórios ausentes: descricao, valorTotal, parcelas, dataPrimeiroVencimento'
                });
            }

            const contas = await ContasPagarService.criarContasPagarParceladas(contaData);

            res.status(201).json({
                success: true,
                message: `${contas.length} contas a pagar criadas com sucesso`,
                data: contas
            });

        } catch (error) {
            console.error('Erro ao criar contas a pagar:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Marca uma conta a pagar como paga
     */
    static async pagarConta(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da conta a pagar é obrigatório'
                });
            }

            const conta = await ContasPagarService.pagarConta(id);

            res.json({
                success: true,
                message: 'Conta a pagar marcada como paga',
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

    /**
     * Lista contas a pagar com filtros
     */
    static async listarContas(req: Request, res: Response) {
        try {
            const { status, fornecedorId, page = 1, limit = 10 } = req.query;

            const resultado = await ContasPagarService.listarContasPagar(
                status as string,
                fornecedorId as string,
                parseInt(page as string),
                parseInt(limit as string)
            );

            res.json({
                success: true,
                data: resultado
            });

        } catch (error) {
            console.error('Erro ao listar contas a pagar:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Busca uma conta a pagar específica
     */
    static async buscarConta(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da conta a pagar é obrigatório'
                });
            }

            const conta = await ContasPagarService.buscarContaPagar(id);

            res.json({
                success: true,
                data: conta
            });

        } catch (error) {
            console.error('Erro ao buscar conta a pagar:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Cancela uma conta a pagar
     */
    static async cancelarConta(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da conta a pagar é obrigatório'
                });
            }

            const conta = await ContasPagarService.cancelarConta(id);

            res.json({
                success: true,
                message: 'Conta a pagar cancelada com sucesso',
                data: conta
            });

        } catch (error) {
            console.error('Erro ao cancelar conta:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Atualiza vencimento de uma conta
     */
    static async atualizarVencimento(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { novaData } = req.body;

            if (!id || !novaData) {
                return res.status(400).json({
                    error: 'ID e nova data são obrigatórios'
                });
            }

            const conta = await ContasPagarService.atualizarVencimento(id, new Date(novaData));

            res.json({
                success: true,
                message: 'Vencimento atualizado com sucesso',
                data: conta
            });

        } catch (error) {
            console.error('Erro ao atualizar vencimento:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Busca contas em atraso
     */
    static async getContasEmAtraso(req: Request, res: Response) {
        try {
            const contas = await ContasPagarService.getContasEmAtraso();

            res.json({
                success: true,
                data: contas
            });

        } catch (error) {
            console.error('Erro ao buscar contas em atraso:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Busca contas a vencer
     */
    static async getContasAVencer(req: Request, res: Response) {
        try {
            const { dias = 7 } = req.query;

            const contas = await ContasPagarService.getContasAVencer(parseInt(dias as string));

            res.json({
                success: true,
                data: contas
            });

        } catch (error) {
            console.error('Erro ao buscar contas a vencer:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}

