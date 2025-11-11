import { Router } from 'express';
import { VeiculosController } from '../controllers/veiculosController';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Métricas (deve vir antes de :id para evitar conflitos)
router.get('/metricas', VeiculosController.obterMetricas);

// CRUD de veículos
router.get('/', VeiculosController.listar);
router.get('/:id', VeiculosController.buscar);
router.post('/', VeiculosController.criar);
router.put('/:id', VeiculosController.atualizar);
router.delete('/:id', VeiculosController.deletar);

export default router;

