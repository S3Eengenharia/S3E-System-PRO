import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { QuadrosService } from '../services/quadros.service.js';

const prisma = new PrismaClient();

export class QuadrosController {
  static async criarQuadro(req: Request, res: Response) {
    try {
      const { nome, descricao, configuracao } = req.body;
      
      if (!nome || !configuracao) {
        res.status(400).json({ 
          success: false, 
          message: 'Nome e configuração são obrigatórios' 
        });
        return;
      }
      
      const quadro = await QuadrosService.criarQuadro(nome, descricao || '', configuracao);
      
      res.status(201).json({ 
        success: true, 
        data: quadro,
        message: 'Quadro elétrico criado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao criar quadro:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Erro ao criar quadro elétrico' 
      });
    }
  }

  static async listarQuadros(req: Request, res: Response) {
    try {
      const quadros = await QuadrosService.listarQuadros();
      
      res.json({ 
        success: true, 
        data: quadros 
      });
    } catch (error: any) {
      console.error('Erro ao listar quadros:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Erro ao listar quadros elétricos' 
      });
    }
  }

  static async buscarQuadro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const quadro = await prisma.kit.findUnique({
        where: { id },
        include: { 
          items: { 
            include: { material: true } 
          } 
        }
      });
      
      if (!quadro || quadro.tipo !== 'quadro-eletrico') {
        res.status(404).json({ 
          success: false, 
          message: 'Quadro elétrico não encontrado' 
        });
        return;
      }
      
      res.json({ 
        success: true, 
        data: quadro 
      });
    } catch (error: any) {
      console.error('Erro ao buscar quadro:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Erro ao buscar quadro elétrico' 
      });
    }
  }

  static async desativarQuadro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const quadro = await prisma.kit.update({
        where: { id },
        data: { ativo: false }
      });
      
      res.json({ 
        success: true, 
        data: quadro,
        message: 'Quadro elétrico desativado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao desativar quadro:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Erro ao desativar quadro elétrico' 
      });
    }
  }
}

