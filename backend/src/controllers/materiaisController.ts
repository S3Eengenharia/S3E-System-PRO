import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os materiais
export const getMateriais = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, ativo } = req.query;
    
    const where: any = {};
    if (categoria) where.categoria = categoria;
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const materiais = await prisma.material.findMany({
      where,
      include: {
        fornecedor: {
          select: { id: true, nome: true }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(materiais);
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
};

// Buscar material por ID
export const getMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        fornecedor: true,
        movimentacoes: {
          orderBy: { data: 'desc' },
          take: 10
        }
      }
    });

    if (!material) {
      res.status(404).json({ error: 'Material não encontrado' });
      return;
    }

    res.json(material);
  } catch (error) {
    console.error('Erro ao buscar material:', error);
    res.status(500).json({ error: 'Erro ao buscar material' });
  }
};

// Criar material
export const createMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const material = await prisma.material.create({
      data: req.body
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Erro ao criar material:', error);
    res.status(500).json({ error: 'Erro ao criar material' });
  }
};

// Atualizar material
export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await prisma.material.update({
      where: { id },
      data: req.body
    });

    res.json(material);
  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    res.status(500).json({ error: 'Erro ao atualizar material' });
  }
};

// Deletar material
export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.material.delete({ where: { id } });

    res.json({ message: 'Material deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar material:', error);
    res.status(500).json({ error: 'Erro ao deletar material' });
  }
};

// Registrar movimentação de estoque
export const registrarMovimentacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { materialId, tipo, quantidade, motivo, referencia, observacoes } = req.body;

    // Buscar material atual
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      res.status(404).json({ error: 'Material não encontrado' });
      return;
    }

    // Calcular novo estoque
    let novoEstoque = material.estoque;
    if (tipo === 'ENTRADA') {
      novoEstoque += quantidade;
    } else if (tipo === 'SAIDA') {
      novoEstoque -= quantidade;
      if (novoEstoque < 0) {
        res.status(400).json({ error: 'Estoque insuficiente' });
        return;
      }
    }

    // Criar movimentação e atualizar estoque em transação
    const [movimentacao, materialAtualizado] = await prisma.$transaction([
      prisma.movimentacaoEstoque.create({
        data: {
          materialId,
          tipo,
          quantidade,
          motivo,
          referencia,
          observacoes
        }
      }),
      prisma.material.update({
        where: { id: materialId },
        data: { estoque: novoEstoque }
      })
    ]);

    res.status(201).json({ movimentacao, material: materialAtualizado });
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
    res.status(500).json({ error: 'Erro ao registrar movimentação' });
  }
};

// Obter histórico de movimentações
export const getMovimentacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { materialId } = req.query;

    const where = materialId ? { materialId: materialId as string } : {};

    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where,
      include: {
        material: {
          select: { id: true, nome: true, sku: true }
        }
      },
      orderBy: { data: 'desc' },
      take: 100
    });

    res.json(movimentacoes);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({ error: 'Erro ao buscar movimentações' });
  }
};

