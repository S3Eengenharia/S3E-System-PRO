import { Router } from 'express';
import {
  getProjetos,
  getProjetoById,
  createProjeto,
  updateProjeto,
  updateProjetoStatus,
  deleteProjeto
} from '../controllers/projetosController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

/**
 * @route GET /api/projetos
 * @desc Listar todos os projetos com filtros opcionais
 * @query ?status=EmAndamento&clienteId=xxx&dataInicio=2024-01-01&dataFim=2024-12-31
 * @access Private
 */
router.get('/', getProjetos);

/**
 * @route GET /api/projetos/:id
 * @desc Buscar projeto específico com relacionamentos
 * @access Private
 */
router.get('/:id', getProjetoById);

/**
 * @route POST /api/projetos
 * @desc Criar novo projeto vinculado a orçamento aprovado
 * @access Private
 */
router.post('/', createProjeto);

/**
 * @route PUT /api/projetos/:id
 * @desc Atualizar dados do projeto
 * @access Private
 */
router.put('/:id', updateProjeto);

/**
 * @route PATCH /api/projetos/:id/status
 * @desc Atualizar status do projeto (EmAndamento, Concluido, Cancelado)
 * @access Private
 */
router.patch('/:id/status', updateProjetoStatus);

/**
 * @route DELETE /api/projetos/:id
 * @desc Cancelar projeto (soft delete)
 * @access Private
 */
router.delete('/:id', deleteProjeto);

export default router;
