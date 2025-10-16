import { Router } from 'express';
import {
  getConfiguracoes,
  getConfiguracaoById,
  createConfiguracao,
  updateConfiguracao,
  deleteConfiguracao
} from '../controllers/configFiscalController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

// Apenas admin pode gerenciar configurações fiscais
router.get('/', authorize('admin', 'gerente'), getConfiguracoes);
router.get('/:id', authorize('admin', 'gerente'), getConfiguracaoById);
router.post('/', authorize('admin'), createConfiguracao);
router.put('/:id', authorize('admin'), updateConfiguracao);
router.delete('/:id', authorize('admin'), deleteConfiguracao);

export default router;

