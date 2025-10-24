import { Router } from 'express';
import pdfController from '../controllers/pdfController';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route GET /api/pdf/orcamento/:id/download
 * @desc Gerar PDF de orçamento para download
 * @access Private
 */
router.get('/orcamento/:id/download', 
  pdfController.gerarOrcamentoPDF.bind(pdfController)
);

/**
 * @route GET /api/pdf/orcamento/:id/view
 * @desc Gerar PDF de orçamento para visualização inline
 * @access Private
 */
router.get('/orcamento/:id/view', 
  pdfController.gerarOrcamentoPDFStream.bind(pdfController)
);

/**
 * @route GET /api/pdf/orcamento/:id/url
 * @desc Gerar PDF de orçamento e retornar URL/data URL
 * @access Private
 */
router.get('/orcamento/:id/url', 
  pdfController.gerarOrcamentoPDFURL.bind(pdfController)
);

/**
 * @route GET /api/pdf/orcamento/:id/check
 * @desc Verificar se orçamento existe antes de gerar PDF
 * @access Private
 */
router.get('/orcamento/:id/check', 
  pdfController.verificarOrcamento.bind(pdfController)
);

export default router;
