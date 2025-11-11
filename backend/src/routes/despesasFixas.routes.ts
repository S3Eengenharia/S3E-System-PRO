import { Router } from 'express';
import { DespesasFixasController } from '../controllers/despesasFixasController';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Métricas (deve vir antes de :id para evitar conflitos)
router.get('/metricas', DespesasFixasController.obterMetricas);

// Registrar pagamento de uma despesa
router.post('/:id/pagamento', DespesasFixasController.registrarPagamento);

// CRUD de despesas fixas
router.get('/', DespesasFixasController.listar);
router.get('/:id', DespesasFixasController.buscar);
router.post('/', DespesasFixasController.criar);
router.put('/:id', DespesasFixasController.atualizar);
router.delete('/:id', DespesasFixasController.deletar);

export default router;

