import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EstoqueService {
    /**
     * Dá baixa no estoque de um material
     */
    static async darBaixaMaterial(
        materialId: string,
        quantidade: number,
        motivo: string,
        referencia: string,
        observacoes?: string
    ) {
        // Buscar material
        const material = await prisma.material.findUnique({
            where: { id: materialId }
        });

        if (!material) {
            throw new Error(`Material ${materialId} não encontrado`);
        }

        // Verificar se há estoque suficiente
        if (material.estoque < quantidade) {
            throw new Error(
                `Estoque insuficiente para ${material.nome}. ` +
                `Disponível: ${material.estoque}, Necessário: ${quantidade}`
            );
        }

        // Usar transação para garantir consistência
        return await prisma.$transaction([
            // 1. Reduzir estoque
            prisma.material.update({
                where: { id: materialId },
                data: {
                    estoque: {
                        decrement: quantidade
                    }
                }
            }),
            // 2. Registrar movimentação
            prisma.movimentacaoEstoque.create({
                data: {
                    materialId,
                    tipo: 'SAIDA',
                    quantidade,
                    motivo,
                    referencia,
                    observacoes
                }
            })
        ]);
    }

    /**
     * Expande um kit e retorna lista de materiais componentes
     */
    static async expandirKit(kitId: string) {
        const kit = await prisma.kit.findUnique({
            where: { id: kitId },
            include: {
                items: {
                    include: {
                        material: true
                    }
                }
            }
        });

        if (!kit) {
            throw new Error(`Kit ${kitId} não encontrado`);
        }

        return kit.items.map(item => ({
            materialId: item.materialId,
            materialNome: item.material.nome,
            materialSku: item.material.sku,
            quantidade: item.quantidade,
            estoqueAtual: item.material.estoque
        }));
    }

    /**
     * Processa baixa de estoque de um orçamento (materiais + kits expandidos)
     */
    static async processarBaixaOrcamento(orcamentoId: string, vendaId: string) {
        // Buscar orçamento com seus itens
        const orcamento = await prisma.orcamento.findUnique({
            where: { id: orcamentoId },
            include: {
                items: true
            }
        });

        if (!orcamento) {
            throw new Error('Orçamento não encontrado');
        }

        const materiaisParaBaixa: Array<{
            materialId: string;
            quantidade: number;
            origem: string;
        }> = [];

        // Processar cada item do orçamento
        for (const item of orcamento.items) {
            if (item.tipo === 'MATERIAL' && item.materialId) {
                // Item é material direto
                materiaisParaBaixa.push({
                    materialId: item.materialId,
                    quantidade: item.quantidade,
                    origem: 'Material direto do orçamento'
                });
            } else if (item.tipo === 'KIT' && item.kitId) {
                // Item é kit - precisa expandir
                const componentesKit = await this.expandirKit(item.kitId);
                
                // Adicionar cada componente do kit multiplicado pela quantidade
                for (const componente of componentesKit) {
                    const quantidadeTotal = componente.quantidade * item.quantidade;
                    
                    materiaisParaBaixa.push({
                        materialId: componente.materialId,
                        quantidade: quantidadeTotal,
                        origem: `Kit (${item.quantidade}x)`
                    });
                }
            }
            // SERVICO não afeta estoque
        }

        // Agrupar materiais repetidos (somar quantidades)
        const materiaisAgrupados = new Map<string, number>();
        
        materiaisParaBaixa.forEach(item => {
            const quantidadeAtual = materiaisAgrupados.get(item.materialId) || 0;
            materiaisAgrupados.set(item.materialId, quantidadeAtual + item.quantidade);
        });

        // Verificar estoque de todos antes de dar baixa
        const verificacoes = [];
        for (const [materialId, quantidade] of materiaisAgrupados.entries()) {
            const material = await prisma.material.findUnique({
                where: { id: materialId }
            });

            if (!material) {
                throw new Error(`Material ${materialId} não encontrado`);
            }

            if (material.estoque < quantidade) {
                verificacoes.push({
                    material: material.nome,
                    disponivel: material.estoque,
                    necessario: quantidade,
                    falta: quantidade - material.estoque
                });
            }
        }

        // Se houver falta de estoque, retornar erro detalhado
        if (verificacoes.length > 0) {
            const mensagem = verificacoes.map(v => 
                `${v.material}: faltam ${v.falta} unidades (disponível: ${v.disponivel}, necessário: ${v.necessario})`
            ).join('\n');
            
            throw new Error(`Estoque insuficiente:\n${mensagem}`);
        }

        // Dar baixa em todos os materiais
        const movimentacoes = [];
        
        for (const [materialId, quantidade] of materiaisAgrupados.entries()) {
            const resultado = await this.darBaixaMaterial(
                materialId,
                quantidade,
                'VENDA',
                vendaId,
                `Baixa automática - Venda baseada em orçamento ${orcamentoId}`
            );
            
            movimentacoes.push(resultado);
        }

        return {
            materiaisProcessados: materiaisAgrupados.size,
            totalItens: Array.from(materiaisAgrupados.values()).reduce((sum, q) => sum + q, 0),
            movimentacoes
        };
    }

    /**
     * Verifica disponibilidade de estoque para um orçamento
     */
    static async verificarDisponibilidadeOrcamento(orcamentoId: string) {
        const orcamento = await prisma.orcamento.findUnique({
            where: { id: orcamentoId },
            include: {
                items: true
            }
        });

        if (!orcamento) {
            throw new Error('Orçamento não encontrado');
        }

        const verificacoes = [];

        for (const item of orcamento.items) {
            if (item.tipo === 'MATERIAL' && item.materialId) {
                const material = await prisma.material.findUnique({
                    where: { id: item.materialId }
                });

                if (material) {
                    verificacoes.push({
                        tipo: 'MATERIAL',
                        materialId: material.id,
                        nome: material.nome,
                        sku: material.sku,
                        quantidadeNecessaria: item.quantidade,
                        quantidadeDisponivel: material.estoque,
                        suficiente: material.estoque >= item.quantidade,
                        falta: Math.max(0, item.quantidade - material.estoque)
                    });
                }
            } else if (item.tipo === 'KIT' && item.kitId) {
                const componentesKit = await this.expandirKit(item.kitId);
                
                for (const componente of componentesKit) {
                    const quantidadeTotal = componente.quantidade * item.quantidade;
                    
                    verificacoes.push({
                        tipo: 'KIT_COMPONENTE',
                        materialId: componente.materialId,
                        nome: componente.materialNome,
                        sku: componente.materialSku,
                        quantidadeNecessaria: quantidadeTotal,
                        quantidadeDisponivel: componente.estoqueAtual,
                        suficiente: componente.estoqueAtual >= quantidadeTotal,
                        falta: Math.max(0, quantidadeTotal - componente.estoqueAtual),
                        origemKit: `${item.quantidade}x Kit`
                    });
                }
            }
        }

        const temEstoqueSuficiente = verificacoes.every(v => v.suficiente);
        const itensSemEstoque = verificacoes.filter(v => !v.suficiente);

        return {
            disponivel: temEstoqueSuficiente,
            verificacoes,
            itensSemEstoque,
            resumo: {
                totalItens: verificacoes.length,
                itensDisponiveis: verificacoes.filter(v => v.suficiente).length,
                itensSemEstoque: itensSemEstoque.length
            }
        };
    }
}

