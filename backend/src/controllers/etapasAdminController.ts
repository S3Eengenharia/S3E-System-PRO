import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Controller para Etapas Administrativas de Projetos
 * Gerencia o fluxo de trabalho administrativo com controle de prazos
 */

// Tipos de etapas (ordem fixa)
export const TIPOS_ETAPAS_ADMIN = [
  'ABERTURA_SR',
  'EMITIR_ART',
  'CONCLUIR_PROJETO_TECNICO',
  'PROTOCOLAR_PROJETO',
  'APROVACAO_PROJETO',
  'RELACAO_MATERIAIS',
  'ORGANIZAR_REVISAR',
  'GERAR_ACERVO_TECNICO',
  'REALIZAR_VISTORIA',
  'COBRANCA_FINAL'
] as const;

const NOMES_ETAPAS: Record<string, string> = {
  ABERTURA_SR: 'Abertura de SR (Protocolo CELESC)',
  EMITIR_ART: 'Emitir ART',
  CONCLUIR_PROJETO_TECNICO: 'Concluir Projeto Técnico',
  PROTOCOLAR_PROJETO: 'Protocolar Projeto',
  APROVACAO_PROJETO: 'Aprovação do Projeto',
  RELACAO_MATERIAIS: 'Relação de Materiais',
  ORGANIZAR_REVISAR: 'Organizar e Revisar',
  GERAR_ACERVO_TECNICO: 'Gerar Acervo Técnico',
  REALIZAR_VISTORIA: 'Realizar Vistoria',
  COBRANCA_FINAL: 'Cobrança Final'
};

export class EtapasAdminController {
  /**
   * Inicializar etapas admin para um projeto
   * POST /api/projetos/:projetoId/etapas-admin/inicializar
   */
  static async inicializarEtapas(req: Request, res: Response) {
    try {
      const { projetoId } = req.params;

      // Verificar se o projeto existe
      const projeto = await prisma.projeto.findUnique({
        where: { id: projetoId }
      });

      if (!projeto) {
        return res.status(404).json({
          success: false,
          error: 'Projeto não encontrado'
        });
      }

      // Verificar se já existem etapas
      const etapasExistentes = await prisma.etapaAdmin.findMany({
        where: { projetoId }
      });

      if (etapasExistentes.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Etapas já foram inicializadas para este projeto'
        });
      }

      // Criar todas as etapas com prazo de 24h
      const etapas = await Promise.all(
        TIPOS_ETAPAS_ADMIN.map((tipo, index) => {
          const dataPrevista = new Date();
          dataPrevista.setHours(dataPrevista.getHours() + 24); // 24 horas a partir de agora

          return prisma.etapaAdmin.create({
            data: {
              projetoId,
              tipo,
              ordem: index + 1,
              dataPrevista,
              concluida: false
            }
          });
        })
      );

      res.status(201).json({
        success: true,
        message: 'Etapas administrativas inicializadas com sucesso',
        data: etapas
      });
    } catch (error) {
      console.error('Erro ao inicializar etapas admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Listar etapas admin de um projeto
   * GET /api/projetos/:projetoId/etapas-admin
   */
  static async listarEtapas(req: Request, res: Response) {
    try {
      const { projetoId } = req.params;

      const etapas = await prisma.etapaAdmin.findMany({
        where: { projetoId },
        orderBy: { ordem: 'asc' }
      });

      // Enriquecer com informações adicionais
      const etapasEnriquecidas = etapas.map(etapa => {
        const now = new Date();
        const dataPrevista = new Date(etapa.dataPrevista);
        const atrasada = !etapa.concluida && now > dataPrevista;
        const horasRestantes = Math.round((dataPrevista.getTime() - now.getTime()) / (1000 * 60 * 60));

        return {
          ...etapa,
          nome: NOMES_ETAPAS[etapa.tipo],
          atrasada,
          horasRestantes,
          percentualProgresso: etapa.concluida ? 100 : 0
        };
      });

      // Calcular progresso geral
      const totalEtapas = etapas.length;
      const etapasConcluidas = etapas.filter(e => e.concluida).length;
      const progressoGeral = totalEtapas > 0 ? Math.round((etapasConcluidas / totalEtapas) * 100) : 0;

      res.json({
        success: true,
        data: {
          etapas: etapasEnriquecidas,
          resumo: {
            total: totalEtapas,
            concluidas: etapasConcluidas,
            pendentes: totalEtapas - etapasConcluidas,
            progresso: progressoGeral
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar etapas admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Concluir uma etapa
   * PUT /api/projetos/:projetoId/etapas-admin/:etapaId/concluir
   */
  static async concluirEtapa(req: Request, res: Response) {
    try {
      const { etapaId } = req.params;
      const { observacoes } = req.body;

      const etapa = await prisma.etapaAdmin.findUnique({
        where: { id: etapaId }
      });

      if (!etapa) {
        return res.status(404).json({
          success: false,
          error: 'Etapa não encontrada'
        });
      }

      if (etapa.concluida) {
        return res.status(400).json({
          success: false,
          error: 'Etapa já está concluída'
        });
      }

      const etapaAtualizada = await prisma.etapaAdmin.update({
        where: { id: etapaId },
        data: {
          concluida: true,
          dataConclusao: new Date(),
          observacoes
        }
      });

      res.json({
        success: true,
        message: 'Etapa concluída com sucesso',
        data: etapaAtualizada
      });
    } catch (error) {
      console.error('Erro ao concluir etapa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Estender prazo de uma etapa
   * PUT /api/projetos/:projetoId/etapas-admin/:etapaId/estender-prazo
   */
  static async estenderPrazo(req: Request, res: Response) {
    try {
      const { etapaId } = req.params;
      const { novaData, motivo } = req.body;

      if (!novaData || !motivo) {
        return res.status(400).json({
          success: false,
          error: 'Nova data e motivo são obrigatórios'
        });
      }

      if (motivo.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'O motivo deve ter pelo menos 10 caracteres'
        });
      }

      const etapa = await prisma.etapaAdmin.findUnique({
        where: { id: etapaId }
      });

      if (!etapa) {
        return res.status(404).json({
          success: false,
          error: 'Etapa não encontrada'
        });
      }

      if (etapa.concluida) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível estender prazo de etapa já concluída'
        });
      }

      const novaDataPrevista = new Date(novaData);
      const dataAtual = new Date();

      if (novaDataPrevista <= dataAtual) {
        return res.status(400).json({
          success: false,
          error: 'A nova data deve ser futura'
        });
      }

      const etapaAtualizada = await prisma.etapaAdmin.update({
        where: { id: etapaId },
        data: {
          dataPrevista: novaDataPrevista,
          motivoExtensao: motivo
        }
      });

      res.json({
        success: true,
        message: 'Prazo estendido com sucesso',
        data: etapaAtualizada
      });
    } catch (error) {
      console.error('Erro ao estender prazo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Reabrir uma etapa concluída
   * PUT /api/projetos/:projetoId/etapas-admin/:etapaId/reabrir
   */
  static async reabrirEtapa(req: Request, res: Response) {
    try {
      const { etapaId } = req.params;

      const etapa = await prisma.etapaAdmin.findUnique({
        where: { id: etapaId }
      });

      if (!etapa) {
        return res.status(404).json({
          success: false,
          error: 'Etapa não encontrada'
        });
      }

      if (!etapa.concluida) {
        return res.status(400).json({
          success: false,
          error: 'Etapa não está concluída'
        });
      }

      // Reabrir com novo prazo de 24h
      const novaDataPrevista = new Date();
      novaDataPrevista.setHours(novaDataPrevista.getHours() + 24);

      const etapaAtualizada = await prisma.etapaAdmin.update({
        where: { id: etapaId },
        data: {
          concluida: false,
          dataConclusao: null,
          dataPrevista: novaDataPrevista,
          dataInicio: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Etapa reaberta com sucesso',
        data: etapaAtualizada
      });
    } catch (error) {
      console.error('Erro ao reabrir etapa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas das etapas
   * GET /api/projetos/:projetoId/etapas-admin/estatisticas
   */
  static async getEstatisticas(req: Request, res: Response) {
    try {
      const { projetoId } = req.params;

      const etapas = await prisma.etapaAdmin.findMany({
        where: { projetoId },
        orderBy: { ordem: 'asc' }
      });

      const now = new Date();
      const total = etapas.length;
      const concluidas = etapas.filter(e => e.concluida).length;
      const pendentes = total - concluidas;
      const atrasadas = etapas.filter(e => 
        !e.concluida && new Date(e.dataPrevista) < now
      ).length;
      const noPrazo = pendentes - atrasadas;
      const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;

      res.json({
        success: true,
        data: {
          total,
          concluidas,
          pendentes,
          atrasadas,
          noPrazo,
          progresso,
          etapas: etapas.map(e => ({
            tipo: e.tipo,
            nome: NOMES_ETAPAS[e.tipo],
            concluida: e.concluida,
            atrasada: !e.concluida && new Date(e.dataPrevista) < now
          }))
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

