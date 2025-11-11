import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const DespesasFixasService = {
    // Listar todas as despesas fixas
    async listarDespesas(ativa?: boolean) {
        const where = ativa !== undefined ? { ativa } : {};
        
        return await prisma.despesaFixa.findMany({
            where,
            include: {
                pagamentos: {
                    orderBy: { dataPagamento: 'desc' },
                    take: 3 // Últimos 3 pagamentos
                }
            },
            orderBy: { diaVencimento: 'asc' }
        });
    },

    // Buscar despesa por ID
    async buscarDespesa(id: string) {
        return await prisma.despesaFixa.findUnique({
            where: { id },
            include: {
                pagamentos: {
                    orderBy: { dataPagamento: 'desc' }
                }
            }
        });
    },

    // Criar despesa fixa
    async criarDespesa(data: {
        descricao: string;
        categoria: string;
        valor: number;
        diaVencimento: number;
        fornecedor?: string;
        observacoes?: string;
    }) {
        return await prisma.despesaFixa.create({
            data
        });
    },

    // Atualizar despesa fixa
    async atualizarDespesa(id: string, data: {
        descricao?: string;
        categoria?: string;
        valor?: number;
        diaVencimento?: number;
        ativa?: boolean;
        fornecedor?: string;
        observacoes?: string;
    }) {
        return await prisma.despesaFixa.update({
            where: { id },
            data
        });
    },

    // Deletar despesa fixa
    async deletarDespesa(id: string) {
        return await prisma.despesaFixa.delete({
            where: { id }
        });
    },

    // Registrar pagamento de despesa fixa
    async registrarPagamento(data: {
        despesaFixaId: string;
        mesReferencia: string;
        valorPago: number;
        dataPagamento: string;
        observacoes?: string;
    }) {
        return await prisma.pagamentoDespesaFixa.create({
            data: {
                ...data,
                dataPagamento: new Date(data.dataPagamento)
            }
        });
    },

    // Obter métricas de despesas fixas
    async obterMetricas() {
        const despesas = await prisma.despesaFixa.findMany({
            where: { ativa: true },
            include: {
                pagamentos: {
                    where: {
                        dataPagamento: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                }
            }
        });

        const totalMensal = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
        const totalPagoMes = despesas.reduce((sum, d) => 
            sum + d.pagamentos.reduce((pSum, p) => pSum + Number(p.valorPago), 0), 0
        );
        const totalDespesas = despesas.length;
        const totalAnual = totalMensal * 12;

        // Calcular despesas por categoria
        const porCategoria = despesas.reduce((acc: any, d) => {
            const cat = d.categoria;
            if (!acc[cat]) acc[cat] = 0;
            acc[cat] += Number(d.valor);
            return acc;
        }, {});

        return {
            totalMensal,
            totalPagoMes,
            totalDespesas,
            totalAnual,
            porCategoria
        };
    }
};

