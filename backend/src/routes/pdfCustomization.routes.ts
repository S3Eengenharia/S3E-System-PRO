import { Router } from 'express';
import { PDFCustomizationController, uploadWatermark, uploadCornerDesign } from '../controllers/pdfCustomizationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route POST /api/pdf/generate-custom
 * @desc Gera PDF personalizado com customizações
 * @access Authenticated
 */
router.post('/generate-custom', PDFCustomizationController.generateCustomPDF);

/**
 * @route POST /api/pdf/templates
 * @desc Salva template de personalização
 * @access Authenticated
 */
router.post('/templates', PDFCustomizationController.saveTemplate);

/**
 * @route GET /api/pdf/templates
 * @desc Lista todos os templates do usuário
 * @access Authenticated
 */
router.get('/templates', PDFCustomizationController.listTemplates);

/**
 * @route GET /api/pdf/templates/:id
 * @desc Carrega template específico
 * @access Authenticated
 */
router.get('/templates/:id', PDFCustomizationController.loadTemplate);

/**
 * @route PUT /api/pdf/templates/:id
 * @desc Atualiza template existente
 * @access Authenticated
 */
router.put('/templates/:id', PDFCustomizationController.updateTemplate);

/**
 * @route DELETE /api/pdf/templates/:id
 * @desc Deleta template
 * @access Authenticated
 */
router.delete('/templates/:id', PDFCustomizationController.deleteTemplate);

/**
 * @route POST /api/pdf/upload-watermark
 * @desc Upload de imagem para marca d'água
 * @access Authenticated
 */
router.post('/upload-watermark', uploadWatermark, PDFCustomizationController.uploadWatermarkImage);

/**
 * @route POST /api/pdf/upload-corner-design
 * @desc Upload de design de canto customizado
 * @access Authenticated
 */
router.post('/upload-corner-design', uploadCornerDesign, PDFCustomizationController.uploadCornerDesignImage);

export default router;

