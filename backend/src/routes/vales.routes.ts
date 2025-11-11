import { Router } from 'express';
import { ValesController } from '../controllers/valesController';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// CRUD de vales
router.get('/', ValesController.listar);
router.get('/:id', ValesController.buscar);
router.post('/', ValesController.criar);
router.put('/:id', ValesController.atualizar);
router.delete('/:id', ValesController.deletar);

export default router;

