import { Request, Response } from 'express';
import obraService from '../services/obra.service.js';

export class ObraController {
  /**
   * POST /api/obras/gerar
   * Gera uma Obra a partir de um Projeto
   */
  static async gerarObra(req: Request, res: Response): Promise<void> {
    try {
      const { projetoId, nomeObra } = req.body;

      if (!projetoId) {
        res.status(400).json({ 
          success: false, 
          message: 'ID do projeto é obrigatório' 
        });
        return;
      }

      const obra = await obraService.gerarObraAPartirDoProjeto(projetoId, nomeObra);

      res.status(201).json({ 
        success: true, 
        data: obra,
        message: 'Obra criada com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao gerar obra:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Erro ao gerar obra' 
      });
    }
  }

  /**
   * GET /api/obras/kanban
   * Lista obras agrupadas por status (Kanban)
   */
  static async getObrasKanban(req: Request, res: Response): Promise<void> {
    try {
      const kanbanData = await obraService.getObrasKanban();

      res.status(200).json({ success: true, data: kanbanData });
    } catch (error: any) {
      console.error('Erro ao buscar obras kanban:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar obras', 
        error: error.message 
      });
    }
  }

  /**
   * PUT /api/obras/:id/status
   * Atualiza status da obra (move no Kanban)
   */
  static async updateObraStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ 
          success: false, 
          message: 'Status é obrigatório' 
        });
        return;
      }

      const validStatuses = ['BACKLOG', 'A_FAZER', 'ANDAMENTO', 'CONCLUIDO'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ 
          success: false, 
          message: `Status inválido. Permitidos: ${validStatuses.join(', ')}` 
        });
        return;
      }

      const obra = await obraService.updateObraStatus(id, status);

      res.status(200).json({ 
        success: true, 
        data: obra,
        message: `Obra movida para: ${status}` 
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar status da obra', 
        error: error.message 
      });
    }
  }

  /**
   * GET /api/obras/tarefas/:id
   * Busca detalhes de uma tarefa
   */
  static async getTarefa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const tarefa = await obraService.getTarefa(id);

      res.status(200).json({ success: true, data: tarefa });
    } catch (error: any) {
      console.error('Erro ao buscar tarefa:', error);
      res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada', 
        error: error.message 
      });
    }
  }

  /**
   * POST /api/obras/tarefas/:id/registro
   * Adiciona registro de atividade em uma tarefa
   */
  static async addRegistroAtividade(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { descricaoAtividade, horasTrabalhadas, observacoes } = req.body;

      if (!descricaoAtividade || horasTrabalhadas === undefined) {
        res.status(400).json({ 
          success: false, 
          message: 'Descrição e horas trabalhadas são obrigatórias' 
        });
        return;
      }

      const registro = await obraService.addRegistroAtividade(id, {
        descricaoAtividade,
        horasTrabalhadas: parseFloat(horasTrabalhadas),
        observacoes
      });

      res.status(201).json({ 
        success: true, 
        data: registro,
        message: 'Registro de atividade salvo com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao adicionar registro:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao adicionar registro de atividade', 
        error: error.message 
      });
    }
  }

  /**
   * POST /api/obras/:id/tarefas
   * Cria nova tarefa em uma obra
   */
  static async criarTarefa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { descricao, atribuidoA, dataPrevista } = req.body;

      if (!descricao) {
        res.status(400).json({ 
          success: false, 
          message: 'Descrição da tarefa é obrigatória' 
        });
        return;
      }

      const tarefa = await obraService.criarTarefa(id, {
        descricao,
        atribuidoA,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined
      });

      res.status(201).json({ 
        success: true, 
        data: tarefa,
        message: 'Tarefa criada com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar tarefa', 
        error: error.message 
      });
    }
  }

  /**
   * PUT /api/obras/tarefas/:id/progresso
   * Atualiza progresso de uma tarefa
   */
  static async atualizarProgressoTarefa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { progresso } = req.body;

      if (progresso === undefined) {
        res.status(400).json({ 
          success: false, 
          message: 'Progresso é obrigatório (0-100)' 
        });
        return;
      }

      const tarefa = await obraService.atualizarProgressoTarefa(id, progresso);

      res.status(200).json({ 
        success: true, 
        data: tarefa,
        message: `Progresso atualizado: ${progresso}%` 
      });
    } catch (error: any) {
      console.error('Erro ao atualizar progresso:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar progresso', 
        error: error.message 
      });
    }
  }

  /**
   * GET /api/obras/alocacao
   * Busca alocação de equipes (para calendário)
   */
  static async getAlocacaoEquipes(req: Request, res: Response): Promise<void> {
    try {
      const { dataInicio, dataFim } = req.query;

      const alocacoes = await obraService.getAlocacaoEquipes(
        dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim ? new Date(dataFim as string) : undefined
      );

      res.status(200).json({ success: true, data: alocacoes });
    } catch (error: any) {
      console.error('Erro ao buscar alocações:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar alocações de equipes', 
        error: error.message 
      });
    }
  }

  /**
   * GET /api/obras/projeto/:projetoId
   * Busca obra associada a um projeto
   */
  static async getObraPorProjeto(req: Request, res: Response): Promise<void> {
    try {
      const { projetoId } = req.params;

      if (!projetoId) {
        res.status(400).json({ 
          success: false, 
          message: 'ID do projeto é obrigatório' 
        });
        return;
      }

      const obra = await obraService.buscarObraPorProjeto(projetoId);

      if (!obra) {
        res.status(404).json({ 
          success: false, 
          message: 'Obra não encontrada para este projeto' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        data: obra 
      });
    } catch (error: any) {
      console.error('Erro ao buscar obra por projeto:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar obra', 
        error: error.message 
      });
    }
  }
}

export default new ObraController();

