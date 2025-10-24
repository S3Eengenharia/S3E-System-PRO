import { Router } from 'express';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/clientesController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

/**
 * @route GET /api/clientes
 * @desc Listar todos os clientes com filtros opcionais
 * @query ?ativo=true&busca=nome
 * @access Private
 */
router.get('/', getClientes);

/**
 * @route GET /api/clientes/:id
 * @desc Buscar cliente específico com relacionamentos
 * @access Private
 */
router.get('/:id', getClienteById);

/**
 * @route POST /api/clientes
 * @desc Criar novo cliente
 * @access Private
 */
router.post('/', createCliente);

/**
 * @route PUT /api/clientes/:id
 * @desc Atualizar dados do cliente
 * @access Private
 */
router.put('/:id', updateCliente);

/**
 * @route DELETE /api/clientes/:id
 * @desc Desativar cliente (soft delete)
 * @access Private
 */
router.delete('/:id', deleteCliente);

export default router;
