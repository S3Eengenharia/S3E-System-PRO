import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { PessoaController } from '../controllers/pessoaController';

const router = Router();

// Todas as rotas protegidas
router.use(authenticate, authorize('admin', 'operacional'));

router.post('/', PessoaController.criar);
router.get('/', PessoaController.listar);
router.get('/disponiveis', PessoaController.disponiveis);
router.put('/:id', PessoaController.atualizar);
router.delete('/:id', PessoaController.excluir);

export default router;


