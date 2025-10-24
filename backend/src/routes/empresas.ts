import { Router } from 'express';
import { EmpresasController } from '../controllers/empresasController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas de empresas requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/empresas
 * @desc Lista todas as empresas fiscais
 * @access Authenticated
 */
router.get('/', EmpresasController.listarEmpresas);

/**
 * @route GET /api/empresas/:id
 * @desc Busca uma empresa específica
 * @access Authenticated
 */
router.get('/:id', EmpresasController.buscarEmpresa);

/**
 * @route POST /api/empresas
 * @desc Cria uma nova empresa fiscal
 * @access Admin only
 */
router.post('/', authorize('admin'), EmpresasController.criarEmpresa);

/**
 * @route PUT /api/empresas/:id
 * @desc Atualiza uma empresa fiscal
 * @access Admin only
 */
router.put('/:id', authorize('admin'), EmpresasController.atualizarEmpresa);

/**
 * @route DELETE /api/empresas/:id
 * @desc Desativa uma empresa fiscal (soft delete)
 * @access Admin only
 */
router.delete('/:id', authorize('admin'), EmpresasController.desativarEmpresa);

export default router;
