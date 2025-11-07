import { Router } from 'express';
import { 
  getOrcamentos, 
  getOrcamentoById, 
  createOrcamento, 
  updateOrcamento,
  updateOrcamentoStatus,
  aprovarOrcamento,
  recusarOrcamento
} from '../controllers/orcamentosController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getOrcamentos);
router.get('/:id', getOrcamentoById);
router.post('/', createOrcamento);
router.put('/:id', updateOrcamento);
router.patch('/:id/status', updateOrcamentoStatus);
router.post('/:id/aprovar', aprovarOrcamento);
router.post('/:id/recusar', recusarOrcamento);

export default router;

