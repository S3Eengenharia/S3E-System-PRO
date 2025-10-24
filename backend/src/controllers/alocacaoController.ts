import { Request, Response } from 'express';
import { 
  alocacaoService, 
  CriarEquipeDTO, 
  AlocarEquipeDTO,
  AtualizarAlocacaoDTO 
} from '../services/alocacao.service';

/**
 * Controller para gestão de equipes e alocações de obras
 */
export class AlocacaoController {
  
  // =============================================
  // GESTÃO DE EQUIPES
  // =============================================

  /**
   * Cria uma nova equipe
   * POST /api/obras/equipes
   */
  static async criarEquipe(req: Request, res: Response) {
    try {
      const data: CriarEquipeDTO = req.body;

      // Validações
      if (!data.nome || !data.tipo || !data.membros || !Array.isArray(data.membros)) {
        return res.status(400).json({
          error: 'Dados obrigatórios ausentes: nome, tipo, membros (array)'
        });
      }

      if (!['MONTAGEM', 'CAMPO', 'DISTINTA'].includes(data.tipo)) {
        return res.status(400).json({
          error: 'Tipo de equipe inválido. Use: MONTAGEM, CAMPO ou DISTINTA'
        });
      }

      if (data.membros.length === 0) {
        return res.status(400).json({
          error: 'A equipe deve ter pelo menos um membro'
        });
      }

      const equipe = await alocacaoService.criarEquipe(data);

      res.status(201).json({
        success: true,
        message: 'Equipe criada com sucesso',
        data: equipe
      });
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Lista todas as equipes
   * GET /api/obras/equipes
   */
  static async listarEquipes(req: Request, res: Response) {
    try {
      const { todas } = req.query;
      const apenasAtivas = todas !== 'true';

      const equipes = await alocacaoService.listarEquipes(apenasAtivas);

      res.json({
        success: true,
        data: equipes
      });
    } catch (error) {
      console.error('Erro ao listar equipes:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca uma equipe específica
   * GET /api/obras/equipes/:id
   */
  static async buscarEquipe(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const equipe = await alocacaoService.buscarEquipe(id);

      res.json({
        success: true,
        data: equipe
      });
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      const statusCode = error instanceof Error && error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({
        error: 'Erro ao buscar equipe',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Atualiza uma equipe
   * PUT /api/obras/equipes/:id
   */
  static async atualizarEquipe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: Partial<CriarEquipeDTO> = req.body;

      // Validar tipo se fornecido
      if (data.tipo && !['MONTAGEM', 'CAMPO', 'DISTINTA'].includes(data.tipo)) {
        return res.status(400).json({
          error: 'Tipo de equipe inválido. Use: MONTAGEM, CAMPO ou DISTINTA'
        });
      }

      const equipe = await alocacaoService.atualizarEquipe(id, data);

      res.json({
        success: true,
        message: 'Equipe atualizada com sucesso',
        data: equipe
      });
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Desativa uma equipe
   * DELETE /api/obras/equipes/:id
   */
  static async desativarEquipe(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const equipe = await alocacaoService.desativarEquipe(id);

      res.json({
        success: true,
        message: 'Equipe desativada com sucesso',
        data: equipe
      });
    } catch (error) {
      console.error('Erro ao desativar equipe:', error);
      res.status(500).json({
        error: 'Erro ao desativar equipe',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // =============================================
  // GESTÃO DE ALOCAÇÕES
  // =============================================

  /**
   * Aloca uma equipe a um projeto/obra
   * POST /api/obras/alocar
   */
  static async alocarEquipe(req: Request, res: Response) {
    try {
      const data: AlocarEquipeDTO = req.body;

      // Validações
      if (!data.equipeId || !data.projetoId || !data.dataInicio || !data.duracaoDias) {
        return res.status(400).json({
          error: 'Dados obrigatórios ausentes: equipeId, projetoId, dataInicio, duracaoDias'
        });
      }

      if (data.duracaoDias <= 0) {
        return res.status(400).json({
          error: 'A duração deve ser maior que zero'
        });
      }

      const alocacao = await alocacaoService.alocarEquipe(data);

      res.status(201).json({
        success: true,
        message: 'Equipe alocada com sucesso',
        data: alocacao
      });
    } catch (error) {
      console.error('Erro ao alocar equipe:', error);
      const statusCode = error instanceof Error && error.message.includes('Conflito') ? 409 : 500;
      res.status(statusCode).json({
        error: 'Erro ao alocar equipe',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Lista todas as alocações com filtros opcionais
   * GET /api/obras/alocacoes
   * Query params: equipeId, projetoId, status, dataInicio, dataFim
   */
  static async listarAlocacoes(req: Request, res: Response) {
    try {
      const { equipeId, projetoId, status, dataInicio, dataFim } = req.query;

      const filtros: any = {};

      if (equipeId) filtros.equipeId = equipeId as string;
      if (projetoId) filtros.projetoId = projetoId as string;
      if (status) filtros.status = status as string;
      if (dataInicio) filtros.dataInicio = new Date(dataInicio as string);
      if (dataFim) filtros.dataFim = new Date(dataFim as string);

      const alocacoes = await alocacaoService.listarAlocacoes(filtros);

      res.json({
        success: true,
        data: alocacoes
      });
    } catch (error) {
      console.error('Erro ao listar alocações:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca alocações para exibição em calendário
   * GET /api/obras/alocacoes/calendario
   * Query params: mes (1-12), ano (YYYY)
   */
  static async getAlocacoesCalendario(req: Request, res: Response) {
    try {
      const { mes, ano } = req.query;

      if (!mes || !ano) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: mes (1-12) e ano (YYYY)'
        });
      }

      const mesNum = parseInt(mes as string);
      const anoNum = parseInt(ano as string);

      if (mesNum < 1 || mesNum > 12 || anoNum < 2000 || anoNum > 2100) {
        return res.status(400).json({
          error: 'Mês ou ano inválido'
        });
      }

      const alocacoes = await alocacaoService.getAlocacoesCalendario(mesNum, anoNum);

      res.json({
        success: true,
        data: alocacoes
      });
    } catch (error) {
      console.error('Erro ao buscar alocações do calendário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Retorna equipes disponíveis em um período
   * GET /api/obras/equipes/disponiveis
   * Query params: dataInicio, dataFim
   */
  static async getEquipesDisponiveis(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: dataInicio e dataFim'
        });
      }

      const equipesDisponiveis = await alocacaoService.getEquipesDisponiveis(
        dataInicio as string,
        dataFim as string
      );

      res.json({
        success: true,
        data: equipesDisponiveis
      });
    } catch (error) {
      console.error('Erro ao buscar equipes disponíveis:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca uma alocação específica
   * GET /api/obras/alocacoes/:id
   */
  static async buscarAlocacao(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const alocacao = await alocacaoService.buscarAlocacao(id);

      res.json({
        success: true,
        data: alocacao
      });
    } catch (error) {
      console.error('Erro ao buscar alocação:', error);
      const statusCode = error instanceof Error && error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({
        error: 'Erro ao buscar alocação',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Atualiza uma alocação
   * PUT /api/obras/alocacoes/:id
   */
  static async atualizarAlocacao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: AtualizarAlocacaoDTO = req.body;

      // Validar status se fornecido
      if (data.status && !['Planejada', 'EmAndamento', 'Concluida', 'Cancelada'].includes(data.status)) {
        return res.status(400).json({
          error: 'Status inválido. Use: Planejada, EmAndamento, Concluida ou Cancelada'
        });
      }

      const alocacao = await alocacaoService.atualizarAlocacao(id, data);

      res.json({
        success: true,
        message: 'Alocação atualizada com sucesso',
        data: alocacao
      });
    } catch (error) {
      console.error('Erro ao atualizar alocação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Cancela uma alocação
   * PUT /api/obras/alocacoes/:id/cancelar
   */
  static async cancelarAlocacao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const alocacao = await alocacaoService.cancelarAlocacao(id, motivo);

      res.json({
        success: true,
        message: 'Alocação cancelada com sucesso',
        data: alocacao
      });
    } catch (error) {
      console.error('Erro ao cancelar alocação:', error);
      res.status(500).json({
        error: 'Erro ao cancelar alocação',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Inicia uma alocação (muda status para EmAndamento)
   * PUT /api/obras/alocacoes/:id/iniciar
   */
  static async iniciarAlocacao(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const alocacao = await alocacaoService.iniciarAlocacao(id);

      res.json({
        success: true,
        message: 'Alocação iniciada com sucesso',
        data: alocacao
      });
    } catch (error) {
      console.error('Erro ao iniciar alocação:', error);
      res.status(500).json({
        error: 'Erro ao iniciar alocação',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Conclui uma alocação
   * PUT /api/obras/alocacoes/:id/concluir
   */
  static async concluirAlocacao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dataFimReal } = req.body;

      const alocacao = await alocacaoService.concluirAlocacao(id, dataFimReal);

      res.json({
        success: true,
        message: 'Alocação concluída com sucesso',
        data: alocacao
      });
    } catch (error) {
      console.error('Erro ao concluir alocação:', error);
      res.status(500).json({
        error: 'Erro ao concluir alocação',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Retorna estatísticas gerais
   * GET /api/obras/estatisticas
   */
  static async getEstatisticas(req: Request, res: Response) {
    try {
      const estatisticas = await alocacaoService.getEstatisticas();

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

