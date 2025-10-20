import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getProtectedData, getAdminData } from '../controllers/protectedController';

const router = express.Router();

/**
 * Rotas Protegidas com Autenticação JWT
 * 
 * Todas as rotas neste arquivo requerem:
 * - Header Authorization com Bearer Token válido
 * - Token JWT não expirado
 */

/**
 * GET /api/protected/data
 * 
 * Rota protegida que retorna dados do usuário autenticado
 * Requer apenas autenticação válida
 * 
 * Headers necessários:
 * - Authorization: Bearer <token_jwt>
 * 
 * Exemplo de resposta (200):
 * {
 *   "success": true,
 *   "message": "Dados protegidos acessados com sucesso",
 *   "data": {
 *     "userId": "user-id-123",
 *     "role": "user",
 *     "timestamp": "2024-10-17T10:30:00Z",
 *     "accessLevel": "Usuário"
 *   }
 * }
 * 
 * Exemplo de erro (401):
 * {
 *   "error": "Token não fornecido"
 * }
 */
router.get('/data', authenticate, getProtectedData);

/**
 * GET /api/protected/admin-only
 * 
 * Rota protegida apenas para administradores
 * Requer autenticação + role 'admin'
 * 
 * Headers necessários:
 * - Authorization: Bearer <token_jwt>
 * 
 * Exemplo de resposta (200):
 * {
 *   "success": true,
 *   "message": "Dados de administrador acessados com sucesso",
 *   "data": {
 *     "userId": "admin-id-123",
 *     "role": "admin",
 *     "adminLevel": "Acesso total",
 *     "timestamp": "2024-10-17T10:30:00Z"
 *   }
 * }
 * 
 * Exemplo de erro (403):
 * {
 *   "error": "Acesso negado",
 *   "message": "Apenas administradores podem acessar este recurso"
 * }
 */
router.get('/admin-only', authenticate, authorize('admin'), getAdminData);

export default router;

