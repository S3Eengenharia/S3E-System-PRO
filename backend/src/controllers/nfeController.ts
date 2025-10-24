import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NFeController {
  static async listarNotasFiscais(req: Request, res: Response): Promise<void> {
    try {
      const { status, tipo, projetoId, dataInicio, dataFim } = req.query;
      const where: any = {};
      
      if (status) where.status = status;
      if (tipo) where.tipo = tipo;
      if (projetoId) where.projetoId = projetoId;
      
      if (dataInicio || dataFim) {
        where.dataEmissao = {};
        if (dataInicio) where.dataEmissao.gte = new Date(dataInicio as string);
        if (dataFim) where.dataEmissao.lte = new Date(dataFim as string);
      }

      const notasFiscais = await prisma.notaFiscal.findMany({
        where,
        include: {
          projeto: {
            select: { id: true, titulo: true, cliente: { select: { nome: true } } }
          }
        },
        orderBy: { dataEmissao: 'desc' }
      });

      res.status(200).json({ success: true, data: notasFiscais });
    } catch (error: any) {
      console.error('Erro ao listar notas fiscais:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar notas fiscais', error: error.message });
    }
  }

  static async buscarNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notaFiscal = await prisma.notaFiscal.findUnique({
        where: { id },
        include: {
          projeto: {
            include: {
              cliente: { select: { id: true, nome: true, cpfCnpj: true } }
            }
          }
        }
      });

      if (!notaFiscal) {
        res.status(404).json({ success: false, message: 'Nota fiscal não encontrada' });
        return;
      }

      res.status(200).json({ success: true, data: notaFiscal });
    } catch (error: any) {
      console.error('Erro ao buscar nota fiscal:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar nota fiscal', error: error.message });
    }
  }

  static async criarNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const { 
        projetoId, 
        empresaFiscalId, 
        numero, 
        serie, 
        tipo, 
        natureza, 
        cfop, 
        valorProdutos, 
        valorServicos, 
        observacoes 
      } = req.body;

      // Validação básica
      if (!numero || !serie || !tipo || !natureza || !cfop || valorProdutos === undefined) {
        res.status(400).json({ 
          success: false, 
          message: 'Número, série, tipo, natureza, CFOP e valor de produtos são obrigatórios' 
        });
      }

      // Validar CFOP (4 dígitos)
      if (!/^\d{4}$/.test(cfop)) {
        res.status(400).json({ 
          success: false, 
          message: 'CFOP deve ter 4 dígitos' 
        });
      }

      // Se projetoId fornecido, verificar se existe
      if (projetoId) {
        const projeto = await prisma.projeto.findUnique({
          where: { id: projetoId }
        });

        if (!projeto) {
          res.status(404).json({ success: false, message: 'Projeto não encontrado' });
          return;
        }
      }

      // Calcular valor total
      const valorTotal = valorProdutos + (valorServicos || 0);

      // Verificar se número já existe
      const numeroExistente = await prisma.notaFiscal.findUnique({
        where: { numero }
      });

      if (numeroExistente) {
        res.status(400).json({ 
          success: false, 
          message: 'Número da nota fiscal já existe' 
        });
      }

      const notaFiscal = await prisma.notaFiscal.create({
        data: {
          projetoId,
          empresaFiscalId,
          numero,
          serie,
          tipo,
          natureza,
          cfop,
          valorProdutos,
          valorServicos: valorServicos || 0,
          valorTotal,
          observacoes
        },
        include: {
          projeto: {
            select: { id: true, titulo: true, cliente: { select: { nome: true } } }
          }
        }
      });

      res.status(201).json({ success: true, data: notaFiscal });
    } catch (error: any) {
      console.error('Erro ao criar nota fiscal:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar nota fiscal', error: error.message });
    }
  }

  static async atualizarNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        numero, 
        serie, 
        tipo, 
        natureza, 
        cfop, 
        valorProdutos, 
        valorServicos, 
        observacoes 
      } = req.body;

      // Verificar se nota fiscal existe
      const notaExistente = await prisma.notaFiscal.findUnique({
        where: { id }
      });

      if (!notaExistente) {
        res.status(404).json({ success: false, message: 'Nota fiscal não encontrada' });
        return;
      }

      // Se mudou o número, verificar se já existe
      if (numero && numero !== notaExistente.numero) {
        const numeroExistente = await prisma.notaFiscal.findUnique({
          where: { numero }
        });

        if (numeroExistente) {
          res.status(400).json({ 
            success: false, 
            message: 'Número da nota fiscal já existe' 
          });
        }
      }

      // Validar CFOP se fornecido
      if (cfop && !/^\d{4}$/.test(cfop)) {
        res.status(400).json({ 
          success: false, 
          message: 'CFOP deve ter 4 dígitos' 
        });
      }

      // Calcular novo valor total
      const novoValorProdutos = valorProdutos !== undefined ? valorProdutos : notaExistente.valorProdutos;
      const novoValorServicos = valorServicos !== undefined ? valorServicos : notaExistente.valorServicos;
      const novoValorTotal = novoValorProdutos + novoValorServicos;

      const notaFiscalAtualizada = await prisma.notaFiscal.update({
        where: { id },
        data: {
          numero,
          serie,
          tipo,
          natureza,
          cfop,
          valorProdutos: novoValorProdutos,
          valorServicos: novoValorServicos,
          valorTotal: novoValorTotal,
          observacoes
        },
        include: {
          projeto: {
            select: { id: true, titulo: true, cliente: { select: { nome: true } } }
          }
        }
      });

      res.status(200).json({ success: true, data: notaFiscalAtualizada });
    } catch (error: any) {
      console.error('Erro ao atualizar nota fiscal:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar nota fiscal', error: error.message });
    }
  }

  static async cancelarNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const notaFiscal = await prisma.notaFiscal.findUnique({
        where: { id }
      });

      if (!notaFiscal) {
        res.status(404).json({ success: false, message: 'Nota fiscal não encontrada' });
        return;
      }

      if (notaFiscal.status === 'Cancelada') {
        res.status(400).json({ 
          success: false, 
          message: 'Nota fiscal já está cancelada' 
        });
      }

      const notaCancelada = await prisma.notaFiscal.update({
        where: { id },
        data: { 
          status: 'Cancelada',
          observacoes: motivo ? `${notaFiscal.observacoes || ''}\nCancelada: ${motivo}`.trim() : notaFiscal.observacoes
        }
      });

      res.status(200).json({ success: true, data: notaCancelada });
    } catch (error: any) {
      console.error('Erro ao cancelar nota fiscal:', error);
      res.status(500).json({ success: false, message: 'Erro ao cancelar nota fiscal', error: error.message });
    }
  }

  static async validarNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const { 
        numero, 
        cfop, 
        valorProdutos, 
        valorServicos, 
        tipo, 
        natureza 
      } = req.body;

      const erros: string[] = [];

      // Validações
      if (!numero || numero.length < 1) {
        erros.push('Número da nota fiscal é obrigatório');
      }

      if (!cfop || !/^\d{4}$/.test(cfop)) {
        erros.push('CFOP deve ter 4 dígitos');
      }

      if (valorProdutos === undefined || valorProdutos < 0) {
        erros.push('Valor de produtos deve ser maior ou igual a zero');
      }

      if (valorServicos === undefined || valorServicos < 0) {
        erros.push('Valor de serviços deve ser maior ou igual a zero');
      }

      if (!tipo || !['PRODUTO', 'SERVICO'].includes(tipo)) {
        erros.push('Tipo deve ser PRODUTO ou SERVICO');
      }

      if (!natureza || natureza.length < 3) {
        erros.push('Natureza da operação é obrigatória');
      }

      // Verificar se número já existe
      if (numero) {
        const numeroExistente = await prisma.notaFiscal.findUnique({
          where: { numero }
        });

        if (numeroExistente) {
          erros.push('Número da nota fiscal já existe');
        }
      }

      const isValid = erros.length === 0;

      res.status(200).json({ 
        success: true, 
        data: { 
          isValid, 
          erros,
          valorTotal: (valorProdutos || 0) + (valorServicos || 0)
        } 
      });
    } catch (error: any) {
      console.error('Erro ao validar nota fiscal:', error);
      res.status(500).json({ success: false, message: 'Erro ao validar nota fiscal', error: error.message });
    }
  }
}
