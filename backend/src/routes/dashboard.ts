import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas de dashboard requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/dashboard/estatisticas
 * @desc Retorna estatísticas gerais do sistema
 * @access Authenticated
 */
router.get('/estatisticas', DashboardController.getEstatisticas);

/**
 * @route GET /api/dashboard/graficos
 * @desc Retorna dados para gráficos do dashboard
 * @access Authenticated
 */
router.get('/graficos', DashboardController.getGraficos);

/**
 * @route GET /api/dashboard/alertas
 * @desc Retorna alertas críticos do sistema
 * @access Authenticated
 */
router.get('/alertas', DashboardController.getAlertas);

export default router;
