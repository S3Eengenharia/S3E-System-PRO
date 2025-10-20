import { PrismaClient } from '@prisma/client';
import { VendaStatus } from '../types';

const prisma = new PrismaClient();

export interface VendaPayload {
    orcamentoId: string; // ID do orçamento aprovado
    clienteId: string;
    projetoId?: string;
    valorTotal: number;
    formaPagamento: string;
    parcelas?: number;
    valorEntrada?: number;
    observacoes?: string;
}

export class VendasService {
    /**
     * Realiza uma venda completa, criando a venda principal e suas contas a receber
     */
    static async realizarVenda(data: VendaPayload) {
        const { orcamentoId, clienteId, projetoId, valorTotal, formaPagamento, parcelas = 1, valorEntrada = 0, observacoes } = data;

        // Validar dados básicos
        if (valorTotal <= 0) {
            throw new Error('Valor total deve ser maior que zero');
        }

        if (parcelas < 1) {
            throw new Error('Número de parcelas deve ser pelo menos 1');
        }

        if (valorEntrada >= valorTotal) {
            throw new Error('Valor de entrada deve ser menor que o valor total');
        }

        // Calcular valor das parcelas
        const valorRestante = valorTotal - valorEntrada;
        const valorParcela = valorRestante / parcelas;

        // Gerar número único da venda
        const numeroVenda = `VND-${Date.now()}`;

        // Usar transação para garantir consistência
        return await prisma.$transaction(async (tx) => {
            // 1. Criar a venda principal
            const venda = await tx.venda.create({
                data: {
                    numeroVenda,
                    orcamentoId,
                    valorTotal,
                    clienteId,
                    projetoId,
                    formaPagamento,
                    parcelas,
                    valorEntrada,
                    observacoes,
                    status: VendaStatus.Concluida // Venda concluída imediatamente
                }
            });

            // 2. Gerar contas a receber (parcelas)
            const contasReceber = [];

            for (let i = 1; i <= parcelas; i++) {
                // Calcular data de vencimento (30 dias após a venda para cada parcela)
                const dataVencimento = new Date();
                dataVencimento.setDate(dataVencimento.getDate() + (i * 30));

                const contaReceber = await tx.contaReceber.create({
                    data: {
                        vendaId: venda.id,
                        descricao: `Parcela ${i}/${parcelas} - Venda ${numeroVenda}`,
                        valorParcela: i === 1 ? valorEntrada + valorParcela : valorParcela,
                        dataVencimento,
                        numeroParcela: i,
                        totalParcelas: parcelas,
                        status: i === 1 ? 'Pendente' : 'Pendente' // Primeira parcela vence primeiro
                    }
                });

                contasReceber.push(contaReceber);
            }

            return {
                venda,
                contasReceber
            };
        });
    }

    /**
     * Busca dados para o dashboard financeiro
     */
    static async getVendasDashboard() {
        // Vendas realizadas este mês
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const vendasDoMes = await prisma.venda.findMany({
            where: {
                dataVenda: {
                    gte: inicioMes
                },
                status: VendaStatus.Concluida
            },
            include: {
                cliente: true,
                projeto: true,
                contasReceber: true
            }
        });

        // Calcular totais
        const totalVendas = vendasDoMes.length;
        const valorTotalVendas = vendasDoMes.reduce((sum, venda) => sum + venda.valorTotal, 0);

        // Contas a receber
        const contasAReceber = await prisma.contaReceber.findMany({
            where: {
                status: 'Pendente'
            },
            include: {
                venda: {
                    include: {
                        cliente: true,
                        projeto: true
                    }
                }
            }
        });

        const valorAReceber = contasAReceber.reduce((sum, conta) => sum + conta.valorParcela, 0);

        // Contas em atraso
        const hoje = new Date();
        const contasEmAtraso = contasAReceber.filter(conta =>
            conta.dataVencimento < hoje && conta.status === 'Pendente'
        );

        const valorEmAtraso = contasEmAtraso.reduce((sum, conta) => sum + conta.valorParcela, 0);

        return {
            vendasDoMes: {
                total: totalVendas,
                valorTotal: valorTotalVendas,
                vendas: vendasDoMes
            },
            contasAReceber: {
                total: contasAReceber.length,
                valorTotal: valorAReceber,
                emAtraso: {
                    total: contasEmAtraso.length,
                    valorTotal: valorEmAtraso
                }
            }
        };
    }

    /**
     * Lista todas as vendas com paginação
     */
    static async listarVendas(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [vendas, total] = await Promise.all([
            prisma.venda.findMany({
                skip,
                take: limit,
                orderBy: { dataVenda: 'desc' },
                include: {
                    cliente: true,
                    projeto: true,
                    contasReceber: true
                }
            }),
            prisma.venda.count()
        ]);

        return {
            vendas,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Busca uma venda específica
     */
    static async buscarVenda(id: string) {
        return await prisma.venda.findUnique({
            where: { id },
            include: {
                cliente: true,
                projeto: true,
                contasReceber: true
            }
        });
    }

    /**
     * Cancela uma venda
     */
    static async cancelarVenda(id: string) {
        return await prisma.venda.update({
            where: { id },
            data: {
                status: VendaStatus.Cancelada,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Marca uma conta a receber como paga
     */
    static async pagarConta(id: string) {
        const conta = await prisma.contaReceber.findUnique({
            where: { id }
        });

        if (!conta) {
            throw new Error('Conta a receber não encontrada');
        }

        return await prisma.contaReceber.update({
            where: { id },
            data: {
                status: 'Pago',
                dataPagamento: new Date(),
                updatedAt: new Date()
            }
        });
    }
}
