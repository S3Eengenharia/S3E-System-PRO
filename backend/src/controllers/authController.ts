import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

/**
 * Controllers de Autenticação
 * 
 * Responsáveis por:
 * - Receber requisições HTTP
 * - Validar dados (via middleware)
 * - Chamar services para lógica de negócio
 * - Retornar respostas HTTP apropriadas
 */

/**
 * Controller de Login
 * 
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * 
 * @example
 * Request:
 * POST /api/auth/login
 * {
 *   "email": "user@s3e.com",
 *   "password": "123456"
 * }
 * 
 * Response (200):
 * {
 *   "message": "Login realizado com sucesso",
 *   "token": "eyJhbGci...",
 *   "user": { "id": "...", "email": "...", "name": "...", "role": "..." }
 * }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dados já validados pelo middleware de validação
    const { email, password } = req.body as LoginInput;

    // Chamar service de autenticação
    const result = await authService.authenticateUser(email, password);

    // Retornar sucesso
    res.status(200).json({
      message: 'Login realizado com sucesso',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // Tratamento de erros específicos
    const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
    
    if (errorMessage === 'Credenciais inválidas') {
      res.status(401).json({ error: errorMessage });
      return;
    }

    if (errorMessage.includes('Usuário inativo')) {
      res.status(403).json({ error: errorMessage });
      return;
    }

    // Erro genérico
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

/**
 * Controller de Registro
 * 
 * POST /api/auth/register
 * Body: { email: string, password: string, name: string, role?: string }
 * 
 * @example
 * Request:
 * POST /api/auth/register
 * {
 *   "email": "novo@s3e.com",
 *   "password": "123456",
 *   "name": "Novo Usuário",
 *   "role": "user"
 * }
 * 
 * Response (201):
 * {
 *   "message": "Usuário criado com sucesso",
 *   "token": "eyJhbGci...",
 *   "user": { ... }
 * }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dados já validados pelo middleware de validação
    const userData = req.body as RegisterInput;

    // Chamar service de registro
    const result = await authService.registerUser(userData);

    // Retornar sucesso
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // Tratamento de erros específicos
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
    
    if (errorMessage === 'Email já cadastrado') {
      res.status(400).json({ error: errorMessage });
      return;
    }

    // Erro genérico
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

/**
 * Controller para obter dados do usuário autenticado
 * 
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 * 
 * @example
 * Request:
 * GET /api/auth/me
 * Headers: { Authorization: "Bearer eyJhbGci..." }
 * 
 * Response (200):
 * {
 *   "id": "...",
 *   "email": "user@s3e.com",
 *   "name": "Usuário",
 *   "role": "admin",
 *   "active": true,
 *   "createdAt": "...",
 *   "updatedAt": "..."
 * }
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // userId vem do middleware de autenticação
    const userId = (req as any).user.userId;
    
    // Buscar dados do usuário
    const user = await authService.getUserById(userId);

    // Retornar dados
    res.status(200).json(user);
  } catch (error) {
    // Tratamento de erros
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuário';
    
    if (errorMessage === 'Usuário não encontrado') {
      res.status(404).json({ error: errorMessage });
      return;
    }

    // Erro genérico
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

