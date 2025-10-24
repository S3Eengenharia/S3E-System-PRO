import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardController {
  static async getEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalClientes,
        totalFornecedores,
        projetosAtivos,
        orcamentosPendentes,
        vendasMes,
        materiaisEstoqueBaixo,
        totalEquipes,
        equipesAtivas
      ] = await Promise.all([
        // Total de clientes ativos
        prisma.cliente.count({ where: { ativo: true } }),
        
        // Total de fornecedores ativos
        prisma.fornecedor.count({ where: { ativo: true } }),
        
        // Projetos ativos
        prisma.projeto.count({ where: { status: 'EmAndamento' } }),
        
        // Orçamentos pendentes
        prisma.orcamento.count({ where: { status: { in: ['Rascunho', 'Enviado'] } } }),
        
        // Vendas do mês atual
        prisma.venda.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        
        // Materiais com estoque baixo
        prisma.material.count({
          where: {
            ativo: true,
            estoque: { lt: prisma.material.fields.estoqueMinimo }
          }
        }),
        
        // Total de equipes
        prisma.equipe.count(),
        
        // Equipes ativas
        prisma.equipe.count({ where: { ativa: true } })
      ]);

      const estatisticas = {
        clientes: {
          total: totalClientes,
          ativos: totalClientes
        },
        fornecedores: {
          total: totalFornecedores,
          ativos: totalFornecedores
        },
        projetos: {
          ativos: projetosAtivos,
          pendentes: orcamentosPendentes
        },
        vendas: {
          mesAtual: vendasMes
        },
        estoque: {
          materiaisBaixo: materiaisEstoqueBaixo
        },
        equipes: {
          total: totalEquipes,
          ativas: equipesAtivas
        }
      };

      res.status(200).json({ success: true, data: estatisticas });
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas', error: error.message });
    }
  }

  static async getGraficos(req: Request, res: Response): Promise<void> {
    try {
      const { meses = '6' } = req.query;
      const mesesNum = parseInt(meses as string);
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - mesesNum);

      const [
        vendasPorMes,
        projetosPorStatus,
        materiaisMaisVendidos
      ] = await Promise.all([
        // Vendas por mês (últimos N meses)
        prisma.venda.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: { gte: dataInicio }
          },
          _count: { id: true },
          _sum: { valorTotal: true }
        }),

        // Projetos por status
        prisma.projeto.groupBy({
          by: ['status'],
          _count: { id: true }
        }),

        // Materiais mais vendidos (baseado em orçamentos)
        prisma.orcamentoItem.groupBy({
          by: ['materialId'],
          where: {
            material: { isNot: null }
          },
          _sum: { quantidade: true },
          _count: { id: true },
          orderBy: { _sum: { quantidade: 'desc' } },
          take: 10
        })
      ]);

      // Processar dados de vendas por mês
      const vendasProcessadas = vendasPorMes.map(venda => ({
        mes: venda.createdAt.toISOString().substring(0, 7), // YYYY-MM
        quantidade: venda._count.id,
        valor: venda._sum.valorTotal || 0
      }));

      // Processar materiais mais vendidos
      const materiaisProcessados = await Promise.all(
        materiaisMaisVendidos.map(async (item) => {
          const material = await prisma.material.findUnique({
            where: { id: item.materialId },
            select: { nome: true, sku: true }
          });
          return {
            materialId: item.materialId,
            nome: material?.nome || 'Material não encontrado',
            sku: material?.sku || '',
            quantidade: item._sum.quantidade || 0,
            vendas: item._count.id
          };
        })
      );

      const graficos = {
        vendasPorMes: vendasProcessadas,
        projetosPorStatus: projetosPorStatus.map(p => ({
          status: p.status,
          quantidade: p._count.id
        })),
        materiaisMaisVendidos: materiaisProcessados
      };

      res.status(200).json({ success: true, data: graficos });
    } catch (error: any) {
      console.error('Erro ao buscar dados para gráficos:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar dados para gráficos', error: error.message });
    }
  }

  static async getAlertas(req: Request, res: Response): Promise<void> {
    try {
      const hoje = new Date();
      const proximos7Dias = new Date();
      proximos7Dias.setDate(hoje.getDate() + 7);

      const [
        estoqueBaixo,
        orcamentosVencendo,
        contasVencidas,
        projetosAtrasados
      ] = await Promise.all([
        // Materiais com estoque baixo
        prisma.material.findMany({
          where: {
            ativo: true,
            estoque: { lt: prisma.material.fields.estoqueMinimo }
          },
          select: {
            id: true,
            nome: true,
            sku: true,
            estoque: true,
            estoqueMinimo: true
          },
          take: 10
        }),

        // Orçamentos vencendo (próximos 7 dias)
        prisma.orcamento.findMany({
          where: {
            status: { in: ['Rascunho', 'Enviado'] },
            validade: {
              gte: hoje,
              lte: proximos7Dias
            }
          },
          select: {
            id: true,
            titulo: true,
            validade: true,
            cliente: { select: { nome: true } }
          },
          take: 10
        }),

        // Contas a pagar vencidas
        prisma.contaPagar.findMany({
          where: {
            status: { not: 'Pago' },
            dataVencimento: { lt: hoje }
          },
          select: {
            id: true,
            descricao: true,
            valorParcela: true,
            dataVencimento: true,
            fornecedor: { select: { nome: true } }
          },
          take: 10
        }),

        // Projetos atrasados (data previsão passou)
        prisma.projeto.findMany({
          where: {
            status: 'EmAndamento',
            dataPrevisao: { lt: hoje }
          },
          select: {
            id: true,
            titulo: true,
            dataPrevisao: true,
            cliente: { select: { nome: true } }
          },
          take: 10
        })
      ]);

      const alertas = {
        estoqueBaixo: {
          titulo: 'Estoque Baixo',
          nivel: 'warning',
          itens: estoqueBaixo.map(item => ({
            id: item.id,
            nome: item.nome,
            sku: item.sku,
            estoque: item.estoque,
            estoqueMinimo: item.estoqueMinimo,
            diferenca: item.estoque - item.estoqueMinimo
          }))
        },
        orcamentosVencendo: {
          titulo: 'Orçamentos Vencendo',
          nivel: 'info',
          itens: orcamentosVencendo.map(orc => ({
            id: orc.id,
            titulo: orc.titulo,
            cliente: orc.cliente.nome,
            validade: orc.validade,
            diasRestantes: Math.ceil((orc.validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
          }))
        },
        contasVencidas: {
          titulo: 'Contas Vencidas',
          nivel: 'error',
          itens: contasVencidas.map(conta => ({
            id: conta.id,
            descricao: conta.descricao,
            fornecedor: conta.fornecedor.nome,
            valor: conta.valorParcela,
            vencimento: conta.dataVencimento,
            diasAtraso: Math.ceil((hoje.getTime() - conta.dataVencimento.getTime()) / (1000 * 60 * 60 * 24))
          }))
        },
        projetosAtrasados: {
          titulo: 'Projetos Atrasados',
          nivel: 'warning',
          itens: projetosAtrasados.map(proj => ({
            id: proj.id,
            titulo: proj.titulo,
            cliente: proj.cliente.nome,
            previsao: proj.dataPrevisao,
            diasAtraso: Math.ceil((hoje.getTime() - proj.dataPrevisao!.getTime()) / (1000 * 60 * 60 * 24))
          }))
        }
      };

      res.status(200).json({ success: true, data: alertas });
    } catch (error: any) {
      console.error('Erro ao buscar alertas:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar alertas', error: error.message });
    }
  }
}
