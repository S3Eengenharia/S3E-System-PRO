import { Router } from 'express';
import { getOrcamentos, getOrcamentoById, createOrcamento, updateOrcamentoStatus } from '../controllers/orcamentosController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getOrcamentos);
router.get('/:id', getOrcamentoById);
router.post('/', createOrcamento);
router.patch('/:id/status', updateOrcamentoStatus);

export default router;

