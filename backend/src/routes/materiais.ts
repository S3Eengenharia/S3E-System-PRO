import { Router } from 'express';
import {
  getMateriais,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  registrarMovimentacao,
  getMovimentacoes
} from '../controllers/materiaisController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMateriais);
router.get('/:id', getMaterialById);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

router.post('/movimentacao', registrarMovimentacao);
router.get('/movimentacoes/historico', getMovimentacoes);

export default router;

