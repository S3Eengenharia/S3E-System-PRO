import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServicosController {
  static async listarServicos(req: Request, res: Response): Promise<void> {
    try {
      const { tipo, ativo, search } = req.query;
      const where: any = {};
      
      if (tipo) where.tipo = tipo;
      if (ativo !== undefined) where.ativo = ativo === 'true';
      if (search) {
        where.OR = [
          { nome: { contains: search as string, mode: 'insensitive' } },
          { codigo: { contains: search as string, mode: 'insensitive' } },
          { descricao: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const servicos = await prisma.servico.findMany({
        where,
        orderBy: { nome: 'asc' }
      });

      res.status(200).json({ success: true, data: servicos });
    } catch (error: any) {
      console.error('Erro ao listar serviços:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar serviços', error: error.message });
    }
  }

  static async buscarServico(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const servico = await prisma.servico.findUnique({
        where: { id }
      });

      if (!servico) {
        res.status(404).json({ success: false, message: 'Serviço não encontrado' });
        return;
      }

      res.status(200).json({ success: true, data: servico });
    } catch (error: any) {
      console.error('Erro ao buscar serviço:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar serviço', error: error.message });
    }
  }

  static async criarServico(req: Request, res: Response): Promise<void> {
    try {
      const { nome, codigo, descricao, tipo, preco, unidade } = req.body;

      // Validação básica
      if (!nome || !codigo || !tipo || preco === undefined) {
        res.status(400).json({ 
          success: false, 
          message: 'Nome, código, tipo e preço são obrigatórios' 
        });
        return;
      }

      // Verificar se código já existe
      const servicoExistente = await prisma.servico.findUnique({
        where: { codigo }
      });

      if (servicoExistente) {
        res.status(400).json({ 
          success: false, 
          message: 'Código do serviço já existe' 
        });
        return;
      }

      const novoServico = await prisma.servico.create({
        data: {
          nome,
          codigo,
          descricao,
          tipo,
          preco,
          unidade: unidade || 'un'
        }
      });

      res.status(201).json({ success: true, data: novoServico });
    } catch (error: any) {
      console.error('Erro ao criar serviço:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar serviço', error: error.message });
    }
  }

  static async atualizarServico(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, codigo, descricao, tipo, preco, unidade, ativo } = req.body;

      // Verificar se serviço existe
      const servicoExistente = await prisma.servico.findUnique({
        where: { id }
      });

      if (!servicoExistente) {
        res.status(404).json({ success: false, message: 'Serviço não encontrado' });
        return;
      }

      // Se mudou o código, verificar se já existe
      if (codigo && codigo !== servicoExistente.codigo) {
        const codigoExistente = await prisma.servico.findUnique({
          where: { codigo }
        });

        if (codigoExistente) {
          res.status(400).json({ 
            success: false, 
            message: 'Código do serviço já existe' 
          });
          return;
        }
      }

      const servicoAtualizado = await prisma.servico.update({
        where: { id },
        data: {
          nome,
          codigo,
          descricao,
          tipo,
          preco,
          unidade,
          ativo
        }
      });

      res.status(200).json({ success: true, data: servicoAtualizado });
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar serviço', error: error.message });
    }
  }

  static async desativarServico(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const servicoDesativado = await prisma.servico.update({
        where: { id },
        data: { ativo: false }
      });

      res.status(200).json({ success: true, data: servicoDesativado });
    } catch (error: any) {
      console.error('Erro ao desativar serviço:', error);
      res.status(500).json({ success: false, message: 'Erro ao desativar serviço', error: error.message });
    }
  }
}
