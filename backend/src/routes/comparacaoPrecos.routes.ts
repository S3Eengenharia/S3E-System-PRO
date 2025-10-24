import { Router } from 'express';
import comparacaoPrecosController from '../controllers/comparacaoPrecosController';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/comparacao-precos/upload-csv
 * @desc Upload e processamento de arquivo CSV para comparação de preços
 * @access Private
 */
router.post('/upload-csv', 
  comparacaoPrecosController.uploadMiddleware,
  comparacaoPrecosController.uploadCSV.bind(comparacaoPrecosController)
);

/**
 * @route POST /api/comparacao-precos/validate-csv
 * @desc Validar estrutura do arquivo CSV
 * @access Private
 */
router.post('/validate-csv',
  comparacaoPrecosController.uploadMiddleware,
  comparacaoPrecosController.validarCSV.bind(comparacaoPrecosController)
);

/**
 * @route GET /api/comparacao-precos/historico/:codigo
 * @desc Buscar histórico de preços de um material
 * @access Private
 */
router.get('/historico/:codigo',
  comparacaoPrecosController.buscarHistoricoPrecos.bind(comparacaoPrecosController)
);

/**
 * @route POST /api/comparacao-precos/atualizar-precos
 * @desc Atualizar preços no banco baseado na comparação
 * @access Private
 */
router.post('/atualizar-precos',
  comparacaoPrecosController.atualizarPrecos.bind(comparacaoPrecosController)
);

export default router;
