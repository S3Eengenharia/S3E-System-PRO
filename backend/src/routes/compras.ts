import { Router } from 'express';
import { getCompras, createCompra, updateCompraStatus, parseXML } from '../controllers/comprasController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getCompras);
router.post('/', createCompra);
router.patch('/:id/status', updateCompraStatus);
router.post('/parse-xml', parseXML);

export default router;

