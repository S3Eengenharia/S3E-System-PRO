import { Router } from 'express';
import equipesController from '../controllers/equipesController';
import { authenticateToken, authorize } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);
router.use(authorize('admin', 'operacional'));

/**
 * @route GET /api/equipes
 * @desc Listar todas as equipes
 * @access Private
 */
router.get('/', equipesController.listarEquipes.bind(equipesController));

/**
 * @route GET /api/equipes/estatisticas
 * @desc Buscar estatísticas das equipes
 * @access Private
 */
router.get('/estatisticas', equipesController.getEstatisticas.bind(equipesController));

/**
 * @route GET /api/equipes/disponiveis
 * @desc Buscar equipes disponíveis para alocação
 * @access Private
 */
router.get('/disponiveis', equipesController.buscarEquipesDisponiveis.bind(equipesController));

/**
 * @route GET /api/equipes/:id
 * @desc Buscar equipe por ID
 * @access Private
 */
router.get('/:id', equipesController.buscarEquipePorId.bind(equipesController));

/**
 * @route POST /api/equipes
 * @desc Criar nova equipe
 * @access Private
 */
router.post('/', equipesController.criarEquipe.bind(equipesController));

/**
 * @route PUT /api/equipes/:id
 * @desc Atualizar equipe
 * @access Private
 */
router.put('/:id', equipesController.atualizarEquipe.bind(equipesController));

/**
 * @route DELETE /api/equipes/:id
 * @desc Desativar equipe
 * @access Private
 */
router.delete('/:id', equipesController.desativarEquipe.bind(equipesController));

/**
 * @route POST /api/equipes/:id/membros
 * @desc Adicionar membro à equipe
 * @access Private
 */
router.post('/:id/membros', equipesController.adicionarMembro.bind(equipesController));

/**
 * @route DELETE /api/equipes/:id/membros/:membroId
 * @desc Remover membro da equipe
 * @access Private
 */
router.delete('/:id/membros/:membroId', equipesController.removerMembro.bind(equipesController));

export default router;
