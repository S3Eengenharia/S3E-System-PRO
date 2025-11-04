import { Router } from 'express';
import { NFeController } from '../controllers/nfeController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route POST /api/nfe/emitir
 * @desc Emitir NF-e a partir de um pedido
 * @access Admin/Gerente
 */
router.post('/emitir', authorize('admin', 'gerente'), NFeController.emitirNFe);

/**
 * @route POST /api/nfe/cancelar
 * @desc Cancelar NF-e autorizada
 * @access Admin/Gerente
 */
router.post('/cancelar', authorize('admin', 'gerente'), NFeController.cancelarNFe);

/**
 * @route POST /api/nfe/corrigir
 * @desc Enviar Carta de Correção (CC-e)
 * @access Admin/Gerente
 */
router.post('/corrigir', authorize('admin', 'gerente'), NFeController.corrigirNFe);

/**
 * @route POST /api/nfe/config
 * @desc Salvar configurações fiscais (certificado e ambiente)
 * @access Admin only
 */
router.post('/config', authorize('admin'), NFeController.salvarConfig);

/**
 * @route GET /api/nfe/consultar/:chaveAcesso
 * @desc Consultar status de NF-e na SEFAZ
 * @access Admin/Gerente
 */
router.get('/consultar/:chaveAcesso', authorize('admin', 'gerente'), NFeController.consultarNFe);

export default router;

