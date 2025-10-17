import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * Rotas de Autenticação
 * 
 * POST /api/auth/register - Registrar novo usuário
 * POST /api/auth/login    - Fazer login
 * GET  /api/auth/me       - Obter dados do usuário autenticado
 */

// Registro de novo usuário (público)
router.post('/register', validate(registerSchema), register);

// Login (público)
router.post('/login', validate(loginSchema), login);

// Obter dados do usuário autenticado (protegido)
router.get('/me', authenticate, getMe);

export default router;

