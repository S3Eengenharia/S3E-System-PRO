import express from 'express';
import { ContasPagarController } from '../controllers/contasPagarController';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Roteador de Contas a Pagar
 *
 * Todas as rotas estão protegidas por autenticação JWT
 * Maioria requer permissões de admin ou financeiro
 */

// Criar conta a pagar única
router.post(
    '/',
    authenticate,
    authorize('admin', 'financeiro'),
    ContasPagarController.criarConta
);

// Criar contas a pagar parceladas
router.post(
    '/parceladas',
    authenticate,
    authorize('admin', 'financeiro'),
    ContasPagarController.criarContasParceladas
);

// Listar contas a pagar (com filtros)
router.get(
    '/',
    authenticate,
    authorize('admin', 'financeiro', 'gerente'),
    ContasPagarController.listarContas
);

// Buscar conta específica
router.get(
    '/:id',
    authenticate,
    authorize('admin', 'financeiro', 'gerente'),
    ContasPagarController.buscarConta
);

// Marcar conta como paga
router.put(
    '/:id/pagar',
    authenticate,
    authorize('admin', 'financeiro'),
    ContasPagarController.pagarConta
);

// Cancelar conta
router.put(
    '/:id/cancelar',
    authenticate,
    authorize('admin', 'financeiro'),
    ContasPagarController.cancelarConta
);

// Atualizar vencimento
router.put(
    '/:id/vencimento',
    authenticate,
    authorize('admin', 'financeiro'),
    ContasPagarController.atualizarVencimento
);

// Buscar contas em atraso
router.get(
    '/alertas/atrasadas',
    authenticate,
    authorize('admin', 'financeiro', 'gerente'),
    ContasPagarController.getContasEmAtraso
);

// Buscar contas a vencer
router.get(
    '/alertas/a-vencer',
    authenticate,
    authorize('admin', 'financeiro', 'gerente'),
    ContasPagarController.getContasAVencer
);

export default router;

