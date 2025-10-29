import { Router } from 'express';
import {
  getProjetos,
  getProjetoById,
  createProjeto,
  updateProjeto,
  updateProjetoStatus,
  deleteProjeto,
  criarProjetoDeOrcamento,
  listarProjetosAvancado
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
// endpoint com agregação/kanban opcional (?view=kanban)
router.get('/_avancado', listarProjetosAvancado);

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
// criar projeto a partir de orçamento
router.post('/criar-de-orcamento', criarProjetoDeOrcamento);

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
router.put('/:id/status', updateProjetoStatus);

/**
 * @route DELETE /api/projetos/:id
 * @desc Cancelar projeto (soft delete)
 * @access Private
 */
router.delete('/:id', deleteProjeto);

export default router;
