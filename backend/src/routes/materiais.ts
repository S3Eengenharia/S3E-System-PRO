import { Router } from 'express';
import {
  getMateriais,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  registrarMovimentacao,
  getMovimentacoes,
  getHistoricoCompras,
  corrigirNomesGenericos,
  buscarMateriaisSimilares
} from '../controllers/materiaisController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMateriais);
router.get('/movimentacoes/historico', getMovimentacoes);
router.post('/corrigir-nomes', corrigirNomesGenericos); // Rota de correção
router.post('/buscar-similares', buscarMateriaisSimilares); // Nova rota para verificação de duplicatas
router.get('/:id/historico-compras', getHistoricoCompras); // Rota específica antes da genérica
router.get('/:id', getMaterialById);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

router.post('/movimentacao', registrarMovimentacao);

export default router;

