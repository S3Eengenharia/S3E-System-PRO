import { Router } from 'express';
import { HistoricoController } from '../controllers/historicoController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Todas as rotas de histórico requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/historico
 * @desc Lista o histórico de ações do sistema
 * @access Authenticated
 */
router.get('/', HistoricoController.listarHistorico);

/**
 * @route GET /api/historico/:modulo
 * @desc Lista o histórico de um módulo específico
 * @access Authenticated
 */
router.get('/:modulo', HistoricoController.listarHistoricoPorModulo);

/**
 * @route POST /api/historico
 * @desc Cria um log de histórico (usado internamente)
 * @access Authenticated
 */
router.post('/', HistoricoController.criarHistoryLog);

export default router;
