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

        // Buscar ou criar fornecedor (garantir que CNPJ seja string)
        const cnpjString = String(fornecedorCNPJ);
        let fornecedor = await prisma.fornecedor.findUnique({
            where: { cnpj: cnpjString }
        });

        if (!fornecedor) {
            fornecedor = await prisma.fornecedor.create({
                data: {
                    nome: fornecedorNome,
                    cnpj: cnpjString,
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
            // 0. CRIAR MATERIALS AUTOMATICAMENTE para itens novos
            console.log('🔍 Processando items da compra...');
            const itemsComMaterialId = [];
            
            for (const item of items) {
                let materialId = item.materialId;
                
                // Se não tem materialId, criar ou buscar Material
                if (!materialId) {
                    console.log(`🆕 Item sem materialId: "${item.nomeProduto}". Criando Material...`);
                    
                    // Tentar encontrar material existente pelo NCM ou nome
                    let material = null;
                    if (item.ncm) {
                        material = await tx.material.findFirst({
                            where: { sku: String(item.ncm) }
                        });
                    }
                    
                    if (!material) {
                        material = await tx.material.findFirst({
                            where: { 
                                descricao: { 
                                    contains: item.nomeProduto.substring(0, 20), 
                                    mode: 'insensitive' 
                                } 
                            }
                        });
                    }
                    
                    // Se não encontrou, CRIAR novo Material
                    if (!material) {
                        console.log(`✨ Criando novo Material: "${item.nomeProduto}"`);
                        // Gerar SKU único (timestamp + random para garantir unicidade)
                        const timestamp = Date.now();
                        const random = Math.random().toString(36).substr(2, 9);
                        const skuGerado = item.ncm ? `NCM-${item.ncm}-${random}` : `AUTO-${timestamp}-${random}`;
                        
                        material = await tx.material.create({
                            data: {
                                nome: item.nomeProduto, // ✅ Campo obrigatório
                                sku: skuGerado, // ✅ Campo obrigatório e único
                                tipo: 'Produto', // ✅ Campo obrigatório
                                categoria: 'Importado XML', // ✅ Campo obrigatório
                                descricao: `Produto importado via XML - NF ${numeroNF}`,
                                unidadeMedida: 'UN',
                                preco: item.valorUnit,
                                estoque: 0, // Será atualizado depois se status = Recebido
                                estoqueMinimo: 5,
                                fornecedorId: fornecedor.id,
                                ativo: true
                            }
                        });
                        console.log(`✅ Material criado: ${material.id} (SKU: ${skuGerado})`);
                    } else {
                        console.log(`🔗 Material existente encontrado: ${material.id}`);
                    }
                    
                    materialId = material.id;
                }
                
                itemsComMaterialId.push({
                    materialId,
                    nomeProduto: item.nomeProduto,
                    ncm: item.ncm ? String(item.ncm) : null,
                    quantidade: item.quantidade,
                    valorUnit: item.valorUnit,
                    valorTotal: item.quantidade * item.valorUnit
                });
            }
            
            // 1. Criar compra com items (agora todos com materialId)
            const compra = await tx.compra.create({
                data: {
                    fornecedorId: fornecedor.id,
                    fornecedorNome,
                    fornecedorCNPJ: cnpjString,
                    fornecedorTel: fornecedorTel || null,
                    numeroNF: String(numeroNF),
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
                        create: itemsComMaterialId
                    }
                },
                include: {
                    items: true,
                    fornecedor: true
                }
            });
            
            console.log(`✅ Compra criada com ${compra.items.length} itens`);

            // 2. Se status for "Recebido", atualizar estoque
            if (status === 'Recebido') {
                console.log('📦 Compra com status "Recebido" - Dando entrada no estoque...');
                for (const itemData of itemsComMaterialId) {
                    // Agora TODOS os itens têm materialId
                    console.log(`  ➕ Entrada: ${itemData.nomeProduto} - Qtd: ${itemData.quantidade}`);
                    await EstoqueService.incrementarEstoque(
                        itemData.materialId,
                        itemData.quantidade,
                        'COMPRA',
                        compra.id,
                        `Compra NF: ${numeroNF} - ${itemData.nomeProduto}`
                    );
                }
                console.log('✅ Estoque atualizado para todos os itens!');
            } else {
                console.log(`⚠️ Compra com status "${status}" - Estoque NÃO atualizado (aguardando recebimento)`);
            }

            // 3. Gerar contas a pagar (sempre gerar, mesmo se for à vista com 1 parcela)
            let contasPagar = null;
            if (condicoesPagamento && parcelas && parcelas > 0) {
                const dataVencimento = dataPrimeiroVencimento || new Date(dataCompra);
                if (!dataPrimeiroVencimento) {
                    // Se for à vista, vencimento em 7 dias; se parcelado, 30 dias
                    dataVencimento.setDate(dataVencimento.getDate() + (parcelas === 1 ? 7 : 30));
                }

                console.log(`💰 Gerando ${parcelas} conta(s) a pagar para compra NF ${numeroNF}`);
                
                contasPagar = await ContasPagarService.criarContasPagarParceladas({
                    fornecedorId: fornecedor.id,
                    compraId: compra.id,
                    descricao: `Compra NF ${numeroNF} - ${fornecedorNome}`,
                    valorTotal,
                    parcelas,
                    dataPrimeiroVencimento: dataVencimento,
                    observacoes: condicoesPagamento
                });
                
                console.log(`✅ ${parcelas} conta(s) a pagar criada(s) com sucesso!`);
            } else {
                console.warn(`⚠️ Nenhuma conta a pagar gerada - Condições: ${condicoesPagamento}, Parcelas: ${parcelas}`);
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
                console.log('📦 Mudança para "Recebido" - Criando Materials e dando entrada no estoque...');
                
                for (const item of compra.items) {
                    let materialIdFinal = item.materialId;
                    
                    // Se item não tem materialId, criar Material automaticamente
                    if (!materialIdFinal) {
                        console.log(`🆕 Item sem material vinculado: "${item.nomeProduto}". Criando...`);
                        
                        // Tentar encontrar material existente
                        let material = null;
                        if (item.ncm) {
                            material = await tx.material.findFirst({
                                where: { sku: String(item.ncm) }
                            });
                        }
                        
                        if (!material) {
                            material = await tx.material.findFirst({
                                where: { 
                                    descricao: { 
                                        contains: item.nomeProduto.substring(0, 20), 
                                        mode: 'insensitive' 
                                    } 
                                }
                            });
                        }
                        
                        // Criar novo Material se não encontrou
                        if (!material) {
                            // Gerar SKU único (timestamp + random para garantir unicidade)
                            const timestamp = Date.now();
                            const random = Math.random().toString(36).substr(2, 9);
                            const skuGerado = item.ncm ? `NCM-${item.ncm}-${random}` : `AUTO-${timestamp}-${random}`;
                            
                            material = await tx.material.create({
                                data: {
                                    nome: item.nomeProduto, // ✅ Campo obrigatório
                                    sku: skuGerado, // ✅ Campo obrigatório e único
                                    tipo: 'Produto', // ✅ Campo obrigatório
                                    categoria: 'Importado XML', // ✅ Campo obrigatório
                                    descricao: `Produto importado via XML - NF ${compra.numeroNF}`,
                                    unidadeMedida: 'UN',
                                    preco: item.valorUnit,
                                    estoque: 0,
                                    estoqueMinimo: 5,
                                    ativo: true
                                }
                            });
                            console.log(`✅ Material criado: ${material.id} (SKU: ${skuGerado})`);
                        }
                        
                        materialIdFinal = material.id;
                        
                        // Atualizar CompraItem com o materialId
                        await tx.compraItem.update({
                            where: { id: item.id },
                            data: { materialId: material.id }
                        });
                    }
                    
                    // Dar entrada no estoque
                    await EstoqueService.incrementarEstoque(
                        materialIdFinal,
                        item.quantidade,
                        'COMPRA',
                        id,
                        `Compra NF: ${compra.numeroNF} - Recebimento confirmado`
                    );
                }
                
                console.log('✅ Todos os Materials criados e estoque atualizado!');
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

