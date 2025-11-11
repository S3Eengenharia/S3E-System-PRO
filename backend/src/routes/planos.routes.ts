import { Router } from 'express';
import { PlanosController } from '../controllers/planosController';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Métricas (deve vir antes de :id para evitar conflitos)
router.get('/metricas', PlanosController.obterMetricas);

// Toggle status do plano
router.patch('/:id/toggle', PlanosController.toggleStatus);

// CRUD de planos estratégicos
router.get('/', PlanosController.listar);
router.get('/:id', PlanosController.buscar);
router.post('/', PlanosController.criar);
router.put('/:id', PlanosController.atualizar);
router.delete('/:id', PlanosController.deletar);

export default router;

