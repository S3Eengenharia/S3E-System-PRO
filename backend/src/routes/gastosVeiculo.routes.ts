import { Router } from 'express';
import { GastosVeiculoController } from '../controllers/gastosVeiculoController';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// CRUD de gastos de veículo
router.get('/', GastosVeiculoController.listar);
router.get('/:id', GastosVeiculoController.buscar);
router.post('/', GastosVeiculoController.criar);
router.put('/:id', GastosVeiculoController.atualizar);
router.delete('/:id', GastosVeiculoController.deletar);

export default router;

