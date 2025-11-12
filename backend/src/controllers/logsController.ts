import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LogsController {
  /**
   * Listar logs de auditoria
   * GET /api/logs/audit
   * Acesso: Apenas Desenvolvedor
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;

      // Verificar permissão: apenas desenvolvedor
      if (userRole?.toLowerCase() !== 'desenvolvedor') {
        res.status(403).json({
          success: false,
          error: '🚫 Acesso negado. Esta funcionalidade é restrita a desenvolvedores.'
        });
        return;
      }

      const { limit = 100, offset = 0, action, entity, userId } = req.query;

      // Construir filtros
      const where: any = {};
      if (action) where.action = String(action);
      if (entity) where.entity = String(entity);
      if (userId) where.userId = String(userId);

      // Buscar logs
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      // Estatísticas
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { active: true } });
      const totalActions = await prisma.auditLog.count();
      
      // Calcular taxa de erro (ações que falharam)
      const errorActions = await prisma.auditLog.count({
        where: {
          OR: [
            { action: 'ERROR' },
            { action: { contains: 'FAIL' } }
          ]
        }
      });
      const errorRate = totalActions > 0 ? (errorActions / totalActions) * 100 : 0;

      res.json({
        success: true,
        data: {
          logs,
          stats: {
            totalUsers,
            activeUsers,
            totalActions,
            errorRate
          },
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
            total: await prisma.auditLog.count({ where })
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar logs de auditoria'
      });
    }
  }

  /**
   * Criar log de auditoria
   * POST /api/logs/audit
   * Uso interno pelo sistema
   */
  async createAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { action, entity, entityId, description, metadata } = req.body;
      const userId = (req as any).user?.userId;
      const userName = (req as any).user?.name;
      const userRole = (req as any).user?.role;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const log = await prisma.auditLog.create({
        data: {
          userId,
          userName,
          userRole,
          action,
          entity,
          entityId,
          description,
          ipAddress,
          userAgent,
          metadata: metadata || undefined
        }
      });

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('Erro ao criar log:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar log'
      });
    }
  }

  /**
   * Health check do sistema
   * GET /api/health
   * Acesso: Público (para monitoramento)
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Testar conexão com o banco
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        success: true,
        data: {
          status: 'online',
          timestamp: new Date().toISOString(),
          database: 'connected',
          uptime: process.uptime()
        }
      });
    } catch (error) {
      console.error('Health check falhou:', error);
      res.status(503).json({
        success: false,
        error: 'Serviço indisponível',
        data: {
          status: 'offline',
          timestamp: new Date().toISOString(),
          database: 'disconnected'
        }
      });
    }
  }

  /**
   * Analytics do sistema
   * GET /api/logs/analytics
   * Acesso: Apenas Desenvolvedor
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;

      if (userRole?.toLowerCase() !== 'desenvolvedor') {
        res.status(403).json({
          success: false,
          error: '🚫 Acesso negado.'
        });
        return;
      }

      // Ações por tipo
      const actionsByType = await prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } }
      });

      // Ações por usuário
      const actionsByUser = await prisma.auditLog.groupBy({
        by: ['userId', 'userName'],
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      });

      // Ações por entidade
      const actionsByEntity = await prisma.auditLog.groupBy({
        by: ['entity'],
        _count: true,
        where: { entity: { not: null } },
        orderBy: { _count: { entity: 'desc' } }
      });

      // Atividade nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivity = await prisma.auditLog.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo }
        },
        select: {
          createdAt: true,
          action: true
        }
      });

      res.json({
        success: true,
        data: {
          actionsByType,
          actionsByUser,
          actionsByEntity,
          recentActivity
        }
      });
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar analytics'
      });
    }
  }
}

export const logsController = new LogsController();
export const getAuditLogs = logsController.getAuditLogs.bind(logsController);
export const createAuditLog = logsController.createAuditLog.bind(logsController);
export const healthCheck = logsController.healthCheck.bind(logsController);
export const getAnalytics = logsController.getAnalytics.bind(logsController);

