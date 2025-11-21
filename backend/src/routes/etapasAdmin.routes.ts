import express from 'express';
import { EtapasAdminController } from '../controllers/etapasAdminController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

/**
 * Rotas de Etapas Administrativas de Projetos
 * Controle de fluxo de trabalho com gestão de prazos
 */

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route POST /api/projetos/:projetoId/etapas-admin/inicializar
 * @desc Inicializar etapas administrativas para um projeto
 * @access Autenticado
 */
router.post('/:projetoId/inicializar', EtapasAdminController.inicializarEtapas);

/**
 * @route GET /api/projetos/:projetoId/etapas-admin
 * @desc Listar todas as etapas admin de um projeto
 * @access Autenticado
 */
router.get('/:projetoId', EtapasAdminController.listarEtapas);

/**
 * @route GET /api/projetos/:projetoId/etapas-admin/estatisticas
 * @desc Obter estatísticas das etapas admin
 * @access Autenticado
 */
router.get('/:projetoId/estatisticas', EtapasAdminController.getEstatisticas);

/**
 * @route PUT /api/projetos/:projetoId/etapas-admin/:etapaId/concluir
 * @desc Marcar etapa como concluída
 * @access Autenticado
 */
router.put('/:projetoId/:etapaId/concluir', EtapasAdminController.concluirEtapa);

/**
 * @route PUT /api/projetos/:projetoId/etapas-admin/:etapaId/estender-prazo
 * @desc Estender prazo de uma etapa com justificativa
 * @access Autenticado
 */
router.put('/:projetoId/:etapaId/estender-prazo', EtapasAdminController.estenderPrazo);

/**
 * @route PUT /api/projetos/:projetoId/etapas-admin/:etapaId/reabrir
 * @desc Reabrir uma etapa concluída
 * @access Autenticado
 */
router.put('/:projetoId/:etapaId/reabrir', EtapasAdminController.reabrirEtapa);

// Aliases compatíveis com especificação solicitada (sem projetoId)
router.put('/:etapaId/concluir', EtapasAdminController.concluirEtapa);
router.put('/:etapaId/adiar', EtapasAdminController.estenderPrazo);

export default router;

