import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MovimentacoesController {
  static async listarMovimentacoes(req: Request, res: Response): Promise<void> {
    try {
      const { tipo, materialId, dataInicio, dataFim } = req.query;
      const where: any = {};
      
      if (tipo) where.tipo = tipo;
      if (materialId) where.materialId = materialId;
      
      if (dataInicio || dataFim) {
        where.data = {};
        if (dataInicio) where.data.gte = new Date(dataInicio as string);
        if (dataFim) where.data.lte = new Date(dataFim as string);
      }

      const movimentacoes = await prisma.movimentacaoEstoque.findMany({
        where,
        include: {
          material: {
            select: { id: true, nome: true, sku: true, estoque: true }
          }
        },
        orderBy: { data: 'desc' }
      });

      res.status(200).json({ success: true, data: movimentacoes });
    } catch (error: any) {
      console.error('Erro ao listar movimentações:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar movimentações', error: error.message });
    }
  }

  static async buscarMovimentacao(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const movimentacao = await prisma.movimentacaoEstoque.findUnique({
        where: { id },
        include: {
          material: true
        }
      });

      if (!movimentacao) {
        res.status(404).json({ success: false, message: 'Movimentação não encontrada' });
        return;
      }

      res.status(200).json({ success: true, data: movimentacao });
    } catch (error: any) {
      console.error('Erro ao buscar movimentação:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar movimentação', error: error.message });
    }
  }

  static async criarMovimentacao(req: Request, res: Response): Promise<void> {
    try {
      const { materialId, tipo, quantidade, motivo, referencia, observacoes } = req.body;

      // Validação básica
      if (!materialId || !tipo || !quantidade || !motivo) {
        res.status(400).json({ 
          success: false, 
          message: 'Material, tipo, quantidade e motivo são obrigatórios' 
        });
        return;
      }

      // Verificar se material existe
      const material = await prisma.material.findUnique({
        where: { id: materialId }
      });

      if (!material) {
        res.status(404).json({ success: false, message: 'Material não encontrado' });
        return;
      }

      // Calcular novo estoque
      let novoEstoque = material.estoque;
      if (tipo === 'ENTRADA') {
        novoEstoque += quantidade;
      } else if (tipo === 'SAIDA') {
        novoEstoque -= quantidade;
        if (novoEstoque < 0) {
          res.status(400).json({ 
            success: false, 
            message: 'Estoque insuficiente para esta movimentação' 
          });
          return;
        }
      } else if (tipo === 'AJUSTE') {
        novoEstoque = quantidade;
      }

      // Criar movimentação e atualizar estoque em transação
      const resultado = await prisma.$transaction(async (tx) => {
        const movimentacao = await tx.movimentacaoEstoque.create({
          data: {
            materialId,
            tipo,
            quantidade,
            motivo,
            referencia,
            observacoes
          }
        });

        await tx.material.update({
          where: { id: materialId },
          data: { estoque: novoEstoque }
        });

        return movimentacao;
      });

      res.status(201).json({ success: true, data: resultado });
    } catch (error: any) {
      console.error('Erro ao criar movimentação:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar movimentação', error: error.message });
    }
  }

  static async atualizarMovimentacao(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantidade, motivo, observacoes } = req.body;

      // Buscar movimentação existente
      const movimentacaoExistente = await prisma.movimentacaoEstoque.findUnique({
        where: { id },
        include: { material: true }
      });

      if (!movimentacaoExistente) {
        res.status(404).json({ success: false, message: 'Movimentação não encontrada' });
        return;
      }

      // Se mudou a quantidade, recalcular estoque
      if (quantidade !== undefined && quantidade !== movimentacaoExistente.quantidade) {
        const diferenca = quantidade - movimentacaoExistente.quantidade;
        let novoEstoque = movimentacaoExistente.material.estoque;

        if (movimentacaoExistente.tipo === 'ENTRADA') {
          novoEstoque += diferenca;
        } else if (movimentacaoExistente.tipo === 'SAIDA') {
          novoEstoque -= diferenca;
          if (novoEstoque < 0) {
            res.status(400).json({ 
              success: false, 
              message: 'Estoque insuficiente para esta atualização' 
            });
          }
        } else if (movimentacaoExistente.tipo === 'AJUSTE') {
          novoEstoque = quantidade;
        }

        // Atualizar em transação
        const resultado = await prisma.$transaction(async (tx) => {
          const movimentacao = await tx.movimentacaoEstoque.update({
            where: { id },
            data: { quantidade, motivo, observacoes }
          });

          await tx.material.update({
            where: { id: movimentacaoExistente.materialId },
            data: { estoque: novoEstoque }
          });

          return movimentacao;
        });

        res.status(200).json({ success: true, data: resultado });
      } else {
        // Apenas atualizar dados sem recalcular estoque
        const movimentacaoAtualizada = await prisma.movimentacaoEstoque.update({
          where: { id },
          data: { motivo, observacoes }
        });

        res.status(200).json({ success: true, data: movimentacaoAtualizada });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar movimentação:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar movimentação', error: error.message });
    }
  }

  static async deletarMovimentacao(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Buscar movimentação para reverter estoque
      const movimentacao = await prisma.movimentacaoEstoque.findUnique({
        where: { id },
        include: { material: true }
      });

      if (!movimentacao) {
        res.status(404).json({ success: false, message: 'Movimentação não encontrada' });
        return;
      }

      // Reverter estoque e deletar movimentação em transação
      await prisma.$transaction(async (tx) => {
        let novoEstoque = movimentacao.material.estoque;
        
        if (movimentacao.tipo === 'ENTRADA') {
          novoEstoque -= movimentacao.quantidade;
        } else if (movimentacao.tipo === 'SAIDA') {
          novoEstoque += movimentacao.quantidade;
        } else if (movimentacao.tipo === 'AJUSTE') {
          // Para ajuste, restaurar estoque anterior (não temos histórico, então usar 0)
          novoEstoque = 0;
        }

        await tx.material.update({
          where: { id: movimentacao.materialId },
          data: { estoque: Math.max(0, novoEstoque) }
        });

        await tx.movimentacaoEstoque.delete({
          where: { id }
        });
      });

      res.status(200).json({ success: true, message: 'Movimentação deletada e estoque revertido' });
    } catch (error: any) {
      console.error('Erro ao deletar movimentação:', error);
      res.status(500).json({ success: false, message: 'Erro ao deletar movimentação', error: error.message });
    }
  }
}
