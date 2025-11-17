import { Router } from 'express';
import { register, login, getMe, getAllUsers, forgotPassword, validateResetToken, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * Rotas de Autenticação
 * 
 * POST /api/auth/register - Registrar novo usuário
 * POST /api/auth/login    - Fazer login
 * GET  /api/auth/me       - Obter dados do usuário autenticado
 * GET  /api/auth/users    - Listar todos os usuários (protegido)
 */

// Registro de novo usuário (público)
router.post('/register', validate(registerSchema), register);

// Login (público)
router.post('/login', validate(loginSchema), login);

// Obter dados do usuário autenticado (protegido)
router.get('/me', authenticateToken, getMe);

// Listar todos os usuários (protegido)
router.get('/users', authenticateToken, getAllUsers);

// Recuperação de senha (público)
router.post('/forgot-password', forgotPassword);
router.get('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

export default router;

