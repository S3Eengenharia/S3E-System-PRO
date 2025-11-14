import { Router } from 'express';
import * as kitsController from '../controllers/kitsController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de Kits
router.get('/', kitsController.listarKits);
router.get('/:id', kitsController.buscarKitPorId);
router.post('/', kitsController.criarKit);
router.put('/:id', kitsController.atualizarKit);
router.delete('/:id', kitsController.deletarKit);

export default router;

