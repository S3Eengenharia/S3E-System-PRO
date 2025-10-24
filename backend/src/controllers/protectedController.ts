import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';

/**
 * Controller para rotas protegidas
 * Testa a funcionalidade de autenticação JWT
 */

/**
 * GET /api/protected/data
 * Retorna dados do usuário autenticado
 * Requer token JWT válido no header Authorization
 */
export const getProtectedData = (req: AuthRequest, res: Response): void => {
  try {
    // O middleware de autenticação já validou o token e injetou em req.user
    const user = req.user;

    if (!user) {
      res.status(401).json({ 
        error: 'Usuário não autenticado',
        message: 'O token é inválido ou não foi fornecido'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Dados protegidos acessados com sucesso',
      data: {
        userId: user.userId,
        role: user.role,
        timestamp: new Date().toISOString(),
        accessLevel: user.role === 'admin' ? 'Administrador' : 'Usuário'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({
      error: 'Erro ao acessar dados protegidos',
      message: errorMessage
    });
  }
};

/**
 * GET /api/protected/admin-only
 * Exemplo de rota que só admins podem acessar
 * Requer token JWT válido + role de admin
 */
export const getAdminData = (req: AuthRequest, res: Response): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Apenas administradores podem acessar este recurso'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Dados de administrador acessados com sucesso',
      data: {
        userId: user.userId,
        role: user.role,
        adminLevel: 'Acesso total',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({
      error: 'Erro ao acessar dados de admin',
      message: errorMessage
    });
  }
};

