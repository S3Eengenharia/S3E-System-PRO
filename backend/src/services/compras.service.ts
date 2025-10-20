import { PrismaClient } from '@prisma/client';
import { EstoqueService } from './estoque.service';
import { ContasPagarService } from './contasPagar.service';

const prisma = new PrismaClient();

export interface CompraItemPayload {
    materialId?: string;
    nomeProduto: string;
    ncm?: string;
    quantidade: number;
    valorUnit: number;
}

export interface CompraPayload {
    fornecedorNome: string;
    fornecedorCNPJ: string;
    fornecedorTel?: string;
    numeroNF: string;
    dataEmissaoNF: Date;
    dataCompra: Date;
    dataRecebimento?: Date;
    valorFrete?: number;
    outrasDespesas?: number;
    status: string; // Pendente, Recebido, Cancelado
    items: CompraItemPayload[];
    observacoes?: string;
    // Campos para gerar contas a pagar
    condicoesPagamento?: string;
    parcelas?: number;
    dataPrimeiroVencimento?: Date;
}

export class ComprasService {
    /**
     * Registra uma compra completa com integração de estoque e contas a pagar
     */
    static async registrarCompra(data: CompraPayload) {
        const {
            fornecedorNome,
            fornecedorCNPJ,
            fornecedorTel,
            numeroNF,
            dataEmissaoNF,
            dataCompra,
            dataRecebimento,
            valorFrete = 0,
            outrasDespesas = 0,
            status,
            items,
            observacoes,
            condicoesPagamento,
            parcelas,
            dataPrimeiroVencimento
        } = data;

        // Validações
        if (!items || items.length === 0) {
            throw new Error('Compra deve ter pelo menos um item');
        }

        if (!numeroNF) {
            throw new Error('Número da NF é obrigatório');
        }

        // Buscar ou criar fornecedor
        let fornecedor = await prisma.fornecedor.findUnique({
            where: { cnpj: fornecedorCNPJ }
        });

        if (!fornecedor) {
            fornecedor = await prisma.fornecedor.create({
                data: {
                    nome: fornecedorNome,
                    cnpj: fornecedorCNPJ,
                    telefone: fornecedorTel || null
                }
            });
        }

        // Calcular valores
        const valorSubtotal = items.reduce((sum, item) => 
            sum + (item.quantidade * item.valorUnit), 0
        );
        const valorTotal = valorSubtotal + valorFrete + outrasDespesas;

        // Usar transação para garantir consistência
        return await prisma.$transaction(async (tx) => {
            // 1. Criar compra com items
            const compra = await tx.compra.create({
                data: {
                    fornecedorId: fornecedor.id,
                    fornecedorNome,
                    fornecedorCNPJ,
                    fornecedorTel: fornecedorTel || null,
                    numeroNF,
                    dataEmissaoNF,
                    dataCompra,
                    dataRecebimento: dataRecebimento || null,
                    valorSubtotal,
                    valorFrete,
                    outrasDespesas,
                    valorTotal,
                    status,
                    observacoes,
                    items: {
                        create: items.map(item => ({
                            materialId: item.materialId || null,
                            nomeProduto: item.nomeProduto,
                            ncm: item.ncm || null,
                            quantidade: item.quantidade,
                            valorUnit: item.valorUnit,
                            valorTotal: item.quantidade * item.valorUnit
                        }))
                    }
                },
                include: {
                    items: true,
                    fornecedor: true
                }
            });

            // 2. Se status for "Recebido", atualizar estoque
            if (status === 'Recebido') {
                for (const item of items) {
                    // Se tem materialId, incrementar estoque
                    if (item.materialId) {
                        await EstoqueService.incrementarEstoque(
                            item.materialId,
                            item.quantidade,
                            'COMPRA',
                            compra.id,
                            `Compra NF: ${numeroNF} - ${item.nomeProduto}`
                        );
                    } else {
                        // Tentar encontrar material pelo nome ou NCM
                        const material = await tx.material.findFirst({
                            where: {
                                OR: [
                                    { nome: { contains: item.nomeProduto, mode: 'insensitive' } },
                                    { sku: item.ncm || '' }
                                ]
                            }
                        });

                        if (material) {
                            await EstoqueService.incrementarEstoque(
                                material.id,
                                item.quantidade,
                                'COMPRA',
                                compra.id,
                                `Compra NF: ${numeroNF} - ${item.nomeProduto} (vinculado automaticamente)`
                            );
                        }
                        // Se não encontrar material, apenas registra a compra sem afetar estoque
                    }
                }
            }

            // 3. Gerar contas a pagar se for parcelado
            let contasPagar = null;
            if (condicoesPagamento && parcelas && parcelas > 0) {
                const dataVencimento = dataPrimeiroVencimento || new Date(dataCompra);
                if (!dataPrimeiroVencimento) {
                    dataVencimento.setDate(dataVencimento.getDate() + 30);
                }

                contasPagar = await ContasPagarService.criarContasPagarParceladas({
                    fornecedorId: fornecedor.id,
                    compraId: compra.id,
                    descricao: `Compra NF ${numeroNF} - ${fornecedorNome}`,
                    valorTotal,
                    parcelas,
                    dataPrimeiroVencimento: dataVencimento,
                    observacoes: condicoesPagamento
                });
            }

            return {
                compra,
                contasPagar,
                estoqueAtualizado: status === 'Recebido'
            };
        });
    }

    /**
     * Lista compras com filtros
     */
    static async listarCompras(
        status?: string,
        fornecedorId?: string,
        dataInicio?: Date,
        dataFim?: Date,
        page: number = 1,
        limit: number = 10
    ) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (fornecedorId) {
            where.fornecedorId = fornecedorId;
        }

        if (dataInicio || dataFim) {
            where.dataCompra = {};
            if (dataInicio) {
                where.dataCompra.gte = dataInicio;
            }
            if (dataFim) {
                where.dataCompra.lte = dataFim;
            }
        }

        const [compras, total] = await Promise.all([
            prisma.compra.findMany({
                where,
                skip,
                take: limit,
                orderBy: { dataCompra: 'desc' },
                include: {
                    fornecedor: {
                        select: {
                            id: true,
                            nome: true,
                            cnpj: true,
                            telefone: true
                        }
                    },
                    items: true
                }
            }),
            prisma.compra.count({ where })
        ]);

        return {
            compras,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Busca uma compra específica
     */
    static async buscarCompra(id: string) {
        const compra = await prisma.compra.findUnique({
            where: { id },
            include: {
                fornecedor: true,
                items: true
            }
        });

        if (!compra) {
            throw new Error('Compra não encontrada');
        }

        return compra;
    }

    /**
     * Atualiza status da compra
     * Se mudar para "Recebido", atualiza estoque
     */
    static async atualizarStatusCompra(id: string, novoStatus: string) {
        const compra = await prisma.compra.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!compra) {
            throw new Error('Compra não encontrada');
        }

        // Se mudou para Recebido e antes não estava, atualizar estoque
        const deveAtualizarEstoque = novoStatus === 'Recebido' && compra.status !== 'Recebido';

        return await prisma.$transaction(async (tx) => {
            // Atualizar compra
            const compraAtualizada = await tx.compra.update({
                where: { id },
                data: {
                    status: novoStatus,
                    dataRecebimento: novoStatus === 'Recebido' ? new Date() : compra.dataRecebimento
                },
                include: { items: true, fornecedor: true }
            });

            // Atualizar estoque se necessário
            if (deveAtualizarEstoque) {
                for (const item of compra.items) {
                    if (item.materialId) {
                        await EstoqueService.incrementarEstoque(
                            item.materialId,
                            item.quantidade,
                            'COMPRA',
                            id,
                            `Compra NF: ${compra.numeroNF} - Recebimento confirmado`
                        );
                    } else {
                        // Tentar vincular automaticamente
                        const material = await tx.material.findFirst({
                            where: {
                                OR: [
                                    { nome: { contains: item.nomeProduto, mode: 'insensitive' } },
                                    { sku: item.ncm || '' }
                                ]
                            }
                        });

                        if (material) {
                            await EstoqueService.incrementarEstoque(
                                material.id,
                                item.quantidade,
                                'COMPRA',
                                id,
                                `Compra NF: ${compra.numeroNF} - ${item.nomeProduto} (vinculado automaticamente)`
                            );
                        }
                    }
                }
            }

            return compraAtualizada;
        });
    }

    /**
     * Cancela uma compra
     */
    static async cancelarCompra(id: string) {
        const compra = await prisma.compra.findUnique({
            where: { id }
        });

        if (!compra) {
            throw new Error('Compra não encontrada');
        }

        if (compra.status === 'Recebido') {
            throw new Error('Não é possível cancelar uma compra já recebida. Faça uma devolução.');
        }

        return await prisma.compra.update({
            where: { id },
            data: {
                status: 'Cancelado',
                updatedAt: new Date()
            }
        });
    }

    /**
     * Busca compras de um fornecedor
     */
    static async getComprasPorFornecedor(fornecedorId: string) {
        return await prisma.compra.findMany({
            where: { fornecedorId },
            orderBy: { dataCompra: 'desc' },
            include: {
                items: true
            }
        });
    }

    /**
     * Busca total de compras por período
     */
    static async getTotalComprasPorPeriodo(dataInicio: Date, dataFim: Date) {
        const resultado = await prisma.compra.aggregate({
            where: {
                dataCompra: {
                    gte: dataInicio,
                    lte: dataFim
                },
                status: {
                    not: 'Cancelado'
                }
            },
            _sum: {
                valorTotal: true
            },
            _count: true
        });

        return {
            totalCompras: resultado._count,
            valorTotal: resultado._sum.valorTotal || 0
        };
    }
}

