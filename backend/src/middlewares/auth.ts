import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../services/jwt.service';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    console.log('🔐 Middleware auth - Headers:', req.headers.authorization);
    
    // Extrair token do header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      console.log('❌ Token não fornecido');
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    console.log('🔐 Token encontrado:', token.substring(0, 20) + '...');

    // Verificar e decodificar token
    const decoded = verifyToken(token);
    console.log('✅ Token válido, usuário:', decoded);
    (req as AuthRequest).user = decoded;
    
    next();
  } catch (error) {
    console.log('❌ Erro na autenticação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Token inválido ou expirado';
    res.status(401).json({ error: errorMessage });
  }
};

// Alias para compatibilidade
export const authenticateToken = authenticate;

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as AuthRequest).user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    
    next();
  };
};

