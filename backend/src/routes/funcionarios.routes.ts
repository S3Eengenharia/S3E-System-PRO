import { Router } from 'express';
import { FuncionariosController } from '../controllers/funcionariosController';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Métricas (deve vir antes de :id para evitar conflitos)
router.get('/metricas', FuncionariosController.obterMetricas);

// CRUD de funcionários
router.get('/', FuncionariosController.listar);
router.get('/:id', FuncionariosController.buscar);
router.post('/', FuncionariosController.criar);
router.put('/:id', FuncionariosController.atualizar);
router.delete('/:id', FuncionariosController.deletar);

export default router;

