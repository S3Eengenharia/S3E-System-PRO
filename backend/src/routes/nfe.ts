import { Router } from 'express';
import { NFeController } from '../controllers/nfeController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas de NFe requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/nfe
 * @desc Lista todas as notas fiscais
 * @access Authenticated
 */
router.get('/', NFeController.listarNotasFiscais);

/**
 * @route GET /api/nfe/:id
 * @desc Busca uma nota fiscal específica
 * @access Authenticated
 */
router.get('/:id', NFeController.buscarNotaFiscal);

/**
 * @route POST /api/nfe
 * @desc Cria uma nova nota fiscal
 * @access Admin/Gerente only
 */
router.post('/', authorize('admin', 'gerente'), NFeController.criarNotaFiscal);

/**
 * @route PUT /api/nfe/:id
 * @desc Atualiza uma nota fiscal
 * @access Admin/Gerente only
 */
router.put('/:id', authorize('admin', 'gerente'), NFeController.atualizarNotaFiscal);

/**
 * @route DELETE /api/nfe/:id
 * @desc Cancela uma nota fiscal
 * @access Admin only
 */
router.delete('/:id', authorize('admin'), NFeController.cancelarNotaFiscal);

/**
 * @route POST /api/nfe/validar
 * @desc Valida dados de uma nota fiscal antes da criação
 * @access Authenticated
 */
router.post('/validar', NFeController.validarNotaFiscal);

export default router;
