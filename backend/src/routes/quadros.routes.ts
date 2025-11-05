import { Router } from 'express';
import { QuadrosController } from '../controllers/quadrosController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/quadros
 * @desc Criar novo quadro elétrico modular
 * @access Private
 */
router.post('/', QuadrosController.criarQuadro);

/**
 * @route GET /api/quadros
 * @desc Listar todos os quadros elétricos ativos
 * @access Private
 */
router.get('/', QuadrosController.listarQuadros);

/**
 * @route GET /api/quadros/:id
 * @desc Buscar quadro elétrico por ID
 * @access Private
 */
router.get('/:id', QuadrosController.buscarQuadro);

/**
 * @route DELETE /api/quadros/:id
 * @desc Desativar quadro elétrico
 * @access Private
 */
router.delete('/:id', QuadrosController.desativarQuadro);

export default router;

