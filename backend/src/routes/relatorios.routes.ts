import express from 'express';
import { RelatoriosController } from '../controllers/relatoriosController';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Roteador de Relatórios e Dashboard
 *
 * Todas as rotas estão protegidas por autenticação JWT
 * Algumas rotas requerem permissões específicas
 */

// Dashboard completo (admin e gerentes)
router.get(
    '/dashboard',
    authenticate,
    authorize('admin', 'gerente'),
    RelatoriosController.getDashboardCompleto
);

// Dados financeiros mensais para gráficos (admin, financeiro)
router.get(
    '/financeiro',
    authenticate,
    authorize('admin', 'financeiro'),
    RelatoriosController.getDadosFinanceiros
);

// Resumo financeiro geral (admin, gerente, financeiro)
router.get(
    '/financeiro/resumo',
    authenticate,
    authorize('admin', 'gerente', 'financeiro'),
    RelatoriosController.getResumoFinanceiro
);

// Estatísticas de vendas (admin, gerente, comercial)
router.get(
    '/vendas',
    authenticate,
    authorize('admin', 'gerente', 'comercial'),
    RelatoriosController.getEstatisticasVendas
);

// Top clientes (admin, gerente, comercial)
router.get(
    '/clientes/top',
    authenticate,
    authorize('admin', 'gerente', 'comercial'),
    RelatoriosController.getTopClientes
);

export default router;

