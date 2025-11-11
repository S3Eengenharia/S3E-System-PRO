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
 * @route PUT /api/obras/:id/status
 * @desc Atualiza status da obra (move no Kanban)
 * @access Admin/Gerente
 */
router.put('/:id/status', authorize('admin', 'gerente'), ObraController.updateObraStatus);

/**
 * @route GET /api/obras/tarefas/:id
 * @desc Busca detalhes de uma tarefa
 * @access Authenticated
 */
router.get('/tarefas/:id', ObraController.getTarefa);

/**
 * @route POST /api/obras/tarefas/:id/registro
 * @desc Adiciona registro de atividade em uma tarefa
 * @access Authenticated
 */
router.post('/tarefas/:id/registro', ObraController.addRegistroAtividade);

/**
 * @route POST /api/obras/:id/tarefas
 * @desc Cria nova tarefa em uma obra
 * @access Admin/Gerente
 */
router.post('/:id/tarefas', authorize('admin', 'gerente'), ObraController.criarTarefa);

/**
 * @route PUT /api/obras/tarefas/:id/progresso
 * @desc Atualiza progresso de uma tarefa
 * @access Authenticated
 */
router.put('/tarefas/:id/progresso', ObraController.atualizarProgressoTarefa);

/**
 * @route GET /api/obras/alocacao
 * @desc Busca alocação de equipes (calendário)
 * @access Authenticated
 */
router.get('/alocacao', ObraController.getAlocacaoEquipes);

export default router;

