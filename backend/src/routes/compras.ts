import { Router } from 'express';
import { getCompras, getCompraById, createCompra, updateCompraStatus, receberRemessaParcial, parseXML } from '../controllers/comprasController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getCompras);
router.get('/:id', getCompraById);
router.post('/', createCompra);
router.put('/:id/status', updateCompraStatus);
router.put('/:id/receber-parcial', receberRemessaParcial);
router.post('/parse-xml', parseXML);

export default router;

