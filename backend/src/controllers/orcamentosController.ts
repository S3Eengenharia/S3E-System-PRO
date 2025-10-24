import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar orçamentos
export const getOrcamentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, clienteId } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (clienteId) where.clienteId = clienteId;

    const orcamentos = await prisma.orcamento.findMany({
      where,
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true }
        },
        items: {
          include: {
            material: { select: { id: true, nome: true, sku: true } },
            kit: { select: { id: true, nome: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orcamentos);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
};

// Buscar orçamento por ID
export const getOrcamentoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        items: {
          include: {
            material: true,
            kit: {
              include: {
                items: {
                  include: { material: true }
                }
              }
            }
          }
        },
        projeto: true
      }
    });

    if (!orcamento) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
      return;
    }

    res.json(orcamento);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamento' });
  }
};

// Criar orçamento
export const createOrcamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      clienteId,
      titulo,
      descricao,
      validade,
      bdi,
      items,
      observacoes
    } = req.body;

    // Calcular custo total e preço de venda
    let custoTotal = 0;
    const itemsData = [];

    for (const item of items) {
      let custoUnit = item.custoUnit;
      
      // Se for kit, calcular custo baseado nos materiais
      if (item.tipo === 'KIT' && item.kitId) {
        const kit = await prisma.kit.findUnique({
          where: { id: item.kitId },
          include: {
            items: {
              include: { material: true }
            }
          }
        });
        
        if (kit) {
          custoUnit = kit.items.reduce((sum, kitItem) => 
            sum + (kitItem.material.preco || 0) * kitItem.quantidade, 0
          );
        }
      }

      const subtotal = custoUnit * item.quantidade;
      const precoUnit = custoUnit * (1 + bdi / 100);
      
      custoTotal += subtotal;

      itemsData.push({
        tipo: item.tipo,
        materialId: item.materialId,
        kitId: item.kitId,
        servicoNome: item.servicoNome,
        quantidade: item.quantidade,
        custoUnit,
        precoUnit,
        subtotal: precoUnit * item.quantidade
      });
    }

    const precoVenda = custoTotal * (1 + bdi / 100);

    const orcamento = await prisma.orcamento.create({
      data: {
        clienteId,
        titulo,
        descricao,
        validade: new Date(validade),
        bdi,
        custoTotal,
        precoVenda,
        observacoes,
        items: {
          create: itemsData
        }
      },
      include: {
        cliente: true,
        items: {
          include: {
            material: true,
            kit: true
          }
        }
      }
    });

    res.status(201).json(orcamento);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
};

// Atualizar status do orçamento
export const updateOrcamentoStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: { cliente: true }
    });

    if (!orcamento) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
      return;
    }

    // Se aprovado, criar projeto automaticamente
    let projeto = null;
    if (status === 'Aprovado' && orcamento.status !== 'Aprovado') {
      projeto = await prisma.projeto.create({
        data: {
          orcamentoId: id,
          clienteId: orcamento.clienteId,
          titulo: orcamento.titulo,
          descricao: orcamento.descricao,
          valorTotal: orcamento.precoVenda,
          dataInicio: new Date(),
          status: 'EmAndamento'
        }
      });
    }

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id },
      data: {
        status,
        aprovedAt: status === 'Aprovado' ? new Date() : orcamento.aprovedAt
      },
      include: {
        cliente: true,
        items: true,
        projeto: true
      }
    });

    res.json({ orcamento: orcamentoAtualizado, projeto });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
};

