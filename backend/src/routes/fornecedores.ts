import { Router } from 'express';
import {
  getFornecedores,
  getFornecedorById,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
  reativarFornecedor
} from '../controllers/fornecedoresController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

/**
 * @route GET /api/fornecedores
 * @desc Listar todos os fornecedores com filtros opcionais
 * @query ?ativo=true&busca=nome
 * @access Private
 */
router.get('/', getFornecedores);

/**
 * @route GET /api/fornecedores/:id
 * @desc Buscar fornecedor específico com relacionamentos
 * @access Private
 */
router.get('/:id', getFornecedorById);

/**
 * @route POST /api/fornecedores
 * @desc Criar novo fornecedor
 * @access Private
 */
router.post('/', createFornecedor);

/**
 * @route PUT /api/fornecedores/:id
 * @desc Atualizar dados do fornecedor
 * @access Private
 */
router.put('/:id', updateFornecedor);

/**
 * @route PUT /api/fornecedores/:id/reativar
 * @desc Reativar fornecedor inativo
 * @access Private
 */
router.put('/:id/reativar', reativarFornecedor);

/**
 * @route DELETE /api/fornecedores/:id
 * @desc Desativar fornecedor (soft delete)
 * @access Private
 */
router.delete('/:id', deleteFornecedor);

export default router;
