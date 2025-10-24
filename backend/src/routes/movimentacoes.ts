import { Router } from 'express';
import { MovimentacoesController } from '../controllers/movimentacoesController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas de movimentações requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/movimentacoes
 * @desc Lista todas as movimentações de estoque
 * @access Authenticated
 */
router.get('/', MovimentacoesController.listarMovimentacoes);

/**
 * @route GET /api/movimentacoes/:id
 * @desc Busca uma movimentação específica
 * @access Authenticated
 */
router.get('/:id', MovimentacoesController.buscarMovimentacao);

/**
 * @route POST /api/movimentacoes
 * @desc Cria uma nova movimentação de estoque
 * @access Admin/Gerente only
 */
router.post('/', authorize('admin', 'gerente'), MovimentacoesController.criarMovimentacao);

/**
 * @route PUT /api/movimentacoes/:id
 * @desc Atualiza uma movimentação
 * @access Admin/Gerente only
 */
router.put('/:id', authorize('admin', 'gerente'), MovimentacoesController.atualizarMovimentacao);

/**
 * @route DELETE /api/movimentacoes/:id
 * @desc Deleta uma movimentação e reverte o estoque
 * @access Admin only
 */
router.delete('/:id', authorize('admin'), MovimentacoesController.deletarMovimentacao);

export default router;
