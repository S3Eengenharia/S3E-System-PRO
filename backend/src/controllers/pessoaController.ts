import { Request, Response } from 'express';
import { FuncaoPessoa } from '@prisma/client';
import { pessoaService } from '../services/pessoa.service.js';

export class PessoaController {
  static async criar(req: Request, res: Response) {
    try {
      const { nome, email, funcao, disponivel } = req.body as { nome: string; email?: string; funcao: FuncaoPessoa; disponivel?: boolean };
      if (!nome || !funcao) return res.status(400).json({ success: false, error: 'Campos obrigatórios: nome, funcao' });
      const pessoa = await pessoaService.criarPessoa({ nome, email, funcao, disponivel });
      res.status(201).json({ success: true, data: pessoa });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao criar pessoa' });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const { funcao, disponivel, ativo, busca } = req.query as { funcao?: FuncaoPessoa; disponivel?: string; ativo?: string; busca?: string };
      const data = await pessoaService.listarPessoas({
        funcao,
        disponivel: typeof disponivel !== 'undefined' ? disponivel === 'true' : undefined,
        ativo: typeof ativo !== 'undefined' ? ativo === 'true' : undefined,
        busca
      });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao listar pessoas' });
    }
  }

  static async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pessoa = await pessoaService.atualizarPessoa(id, req.body);
      res.json({ success: true, data: pessoa });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao atualizar pessoa' });
    }
  }

  static async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pessoa = await pessoaService.excluirPessoa(id);
      res.json({ success: true, data: pessoa });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao excluir pessoa' });
    }
  }

  static async disponiveis(_req: Request, res: Response) {
    try {
      const data = await pessoaService.listarPessoasDisponiveisParaEquipe();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao listar pessoas disponíveis' });
    }
  }
}


