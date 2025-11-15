import { Router } from 'express';
import { ObraController } from '../controllers/obraController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route POST /api/obras/gerar
 * @desc Gera uma obra a partir de um projeto aprovado
 * @access Admin/Gerente
 */
router.post('/gerar', authorize('admin', 'gerente'), ObraController.gerarObra);

/**
 * @route POST /api/obras/manutencao
 * @desc Cria uma obra de manutenção (sem projeto)
 * @access Admin/Gerente
 */
router.post('/manutencao', authorize('admin', 'gerente'), ObraController.criarObraManutencao);

/**
 * @route GET /api/obras/kanban
 * @desc Lista obras agrupadas por status (Kanban)
 * @access Authenticated
 */
router.get('/kanban', ObraController.getObrasKanban);

/**
 * @route GET /api/obras/projeto/:projetoId
 * @desc Busca obra associada a um projeto
 * @access Authenticated
 */
router.get('/projeto/:projetoId', ObraController.getObraPorProjeto);

/**
<<<<<<< HEAD
 * @route GET /api/obras/verificar-estoque/:projetoId
 * @desc Verifica disponibilidade de estoque antes de criar obra
 * @access Authenticated
 */
router.get('/verificar-estoque/:projetoId', ObraController.verificarEstoque);

/**
=======
>>>>>>> 478241a18130cffdb1e72d234262f5f84b2e45a1
 * @route GET /api/obras/:id
 * @desc Busca uma obra específica por ID
 * @access Authenticated
 */
router.get('/:id', ObraController.getObraPorId);

/**
 * @route PUT /api/obras/:id/status
 * @desc Atualiza status da obra (move no Kanban)
 * @access Admin/Gerente
 */
router.put('/:id/status', authorize('admin', 'gerente'), ObraController.updateObraStatus);

/**
 * @route PUT /api/obras/:id/iniciar-execucao
 * @desc Permite que eletricistas iniciem a execução de uma obra (mover de A_FAZER para ANDAMENTO)
 * @access Authenticated (eletricista com tarefa atribuída ou admin/gerente)
 */
router.put('/:id/iniciar-execucao', ObraController.iniciarExecucao);

/**
 * @route GET /api/obras/alocacao
 * @desc Busca alocação de equipes (calendário)
 * @access Authenticated
 */
router.get('/alocacao', ObraController.getAlocacaoEquipes);

export default router;

