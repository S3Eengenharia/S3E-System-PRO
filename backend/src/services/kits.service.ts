import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface KitItemInput {
    materialId: string;
    quantidade: number;
}

export interface KitInput {
    nome: string;
    descricao?: string;
    tipo: string;
    preco: number;
    items: KitItemInput[];
    itensBancoFrio?: Array<{
        cotacaoId: string;
        nome: string;
        quantidade: number;
        precoUnit: number;
        dataUltimaCotacao?: string;
    }>;
    temItensCotacao?: boolean;
}

export interface KitUpdateInput {
    nome?: string;
    descricao?: string;
    tipo?: string;
    preco?: number;
    items?: KitItemInput[];
    ativo?: boolean;
    itensBancoFrio?: Array<{
        cotacaoId: string;
        nome: string;
        quantidade: number;
        precoUnit: number;
        dataUltimaCotacao?: string;
    }>;
    temItensCotacao?: boolean;
}

export class KitsService {
    /**
     * Lista todos os kits
     */
    static async listar() {
        const kits = await prisma.kit.findMany({
            include: {
                items: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                nome: true,
                                sku: true,
                                descricao: true,
                                unidadeMedida: true,
                                preco: true,
                                estoque: true,
                                tipo: true,
                                categoria: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return kits;
    }

    /**
     * Busca um kit por ID
     */
    static async buscarPorId(id: string) {
        const kit = await prisma.kit.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                nome: true,
                                sku: true,
                                descricao: true,
                                unidadeMedida: true,
                                preco: true,
                                estoque: true,
                                tipo: true,
                                categoria: true
                            }
                        }
                    }
                }
            }
        });

        if (kit) {
            console.log(`📦 Kit encontrado: ${kit.nome}`);
            console.log(`   - Items no estoque: ${kit.items.length}`);
            console.log(`   - ItensFaltantes:`, kit.itensFaltantes);
            console.log(`   - temItensCotacao:`, kit.temItensCotacao);
            console.log(`   - statusEstoque:`, kit.statusEstoque);
        }

        return kit;
    }

    /**
     * Cria um novo kit
     */
    static async criar(data: KitInput) {
        const { nome, descricao, tipo, preco, items, itensBancoFrio, temItensCotacao } = data;

        console.log(`📦 Criando kit: ${nome}`);
        console.log(`   - Itens estoque real: ${items.length}`);
        console.log(`   - Itens banco frio: ${itensBancoFrio?.length || 0}`);
        if (itensBancoFrio && itensBancoFrio.length > 0) {
            console.log(`   - Itens banco frio:`, itensBancoFrio);
        }

        const kit = await prisma.kit.create({
            data: {
                nome,
                descricao,
                tipo,
                preco,
                temItensCotacao: temItensCotacao || false,
                // Salvar itens do banco frio como JSON para referência
                itensFaltantes: itensBancoFrio && itensBancoFrio.length > 0 ? itensBancoFrio : null,
                statusEstoque: (itensBancoFrio && itensBancoFrio.length > 0) ? 'PENDENTE' : 'COMPLETO',
                items: {
                    create: items.map(item => ({
                        materialId: item.materialId,
                        quantidade: item.quantidade
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                nome: true,
                                sku: true,
                                descricao: true,
                                unidadeMedida: true,
                                preco: true,
                                estoque: true,
                                tipo: true,
                                categoria: true
                            }
                        }
                    }
                }
            }
        });

        const totalItens = kit.items.length + (itensBancoFrio?.length || 0);
        console.log(`✅ Kit criado: ${kit.nome} (${kit.items.length} em estoque, ${itensBancoFrio?.length || 0} banco frio, total: ${totalItens})`);
        return kit;
    }

    /**
     * Atualiza um kit existente
     */
    static async atualizar(id: string, data: KitUpdateInput) {
        const { nome, descricao, tipo, preco, items, ativo, itensBancoFrio, temItensCotacao } = data;

        console.log(`📝 Atualizando kit: ${id}`);
        console.log(`   - Novos itens estoque real: ${items?.length || 0}`);
        console.log(`   - Novos itens banco frio: ${itensBancoFrio?.length || 0}`);

        // Se items foi fornecido, deletar os itens existentes e recriar
        if (items !== undefined) {
            await prisma.kitItem.deleteMany({
                where: { kitId: id }
            });
        }

        const kit = await prisma.kit.update({
            where: { id },
            data: {
                ...(nome !== undefined && { nome }),
                ...(descricao !== undefined && { descricao }),
                ...(tipo !== undefined && { tipo }),
                ...(preco !== undefined && { preco }),
                ...(ativo !== undefined && { ativo }),
                ...(temItensCotacao !== undefined && { temItensCotacao }),
                ...(itensBancoFrio !== undefined && { 
                    itensFaltantes: itensBancoFrio.length > 0 ? itensBancoFrio : null 
                }),
                ...((itensBancoFrio !== undefined || items !== undefined) && {
                    statusEstoque: (itensBancoFrio && itensBancoFrio.length > 0) ? 'PENDENTE' : 'COMPLETO'
                }),
                ...(items !== undefined && {
                    items: {
                        create: items.map(item => ({
                            materialId: item.materialId,
                            quantidade: item.quantidade
                        }))
                    }
                })
            },
            include: {
                items: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                nome: true,
                                sku: true,
                                descricao: true,
                                unidadeMedida: true,
                                preco: true,
                                estoque: true,
                                tipo: true,
                                categoria: true
                            }
                        }
                    }
                }
            }
        });

        const totalItens = kit.items.length + (itensBancoFrio?.length || 0);
        console.log(`✅ Kit atualizado: ${kit.nome} (${kit.items.length} em estoque, ${itensBancoFrio?.length || 0} banco frio, total: ${totalItens})`);
        return kit;
    }

    /**
     * Deleta um kit
     */
    static async deletar(id: string) {
        // Prisma vai deletar os KitItems automaticamente devido ao onDelete: Cascade
        await prisma.kit.delete({
            where: { id }
        });

        console.log(`🗑️ Kit deletado: ${id}`);
    }

    /**
     * Lista kits por tipo
     */
    static async listarPorTipo(tipo: string) {
        const kits = await prisma.kit.findMany({
            where: { tipo, ativo: true },
            include: {
                items: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                nome: true,
                                sku: true,
                                descricao: true,
                                unidadeMedida: true,
                                preco: true,
                                estoque: true,
                                tipo: true,
                                categoria: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                nome: 'asc'
            }
        });

        return kits;
    }
}

