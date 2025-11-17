import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  listarCotacoes,
  buscarCotacao,
  criarCotacao,
  atualizarCotacao,
  deletarCotacao,
  importarCotacoes,
  previewImportacao,
  gerarTemplate,
  exportarCotacoes,
  deletarCotacoesEmLote
} from '../controllers/cotacoesController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'temp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `cotacoes-${uniqueSuffix}.json`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JSON são permitidos'));
    }
  }
});

// Rotas de template e exportação
router.get('/template', gerarTemplate);
router.get('/exportar', exportarCotacoes);

// Rotas de importação
router.post('/preview-importacao', upload.single('arquivo'), previewImportacao);
router.post('/importar', upload.single('arquivo'), importarCotacoes);

// Rotas CRUD
router.get('/', listarCotacoes);
router.get('/:id', buscarCotacao);
router.post('/', authenticate, authorize('admin', 'gerente', 'engenheiro', 'orcamentista', 'desenvolvedor'), criarCotacao);
router.put('/:id', authenticate, authorize('admin', 'gerente', 'engenheiro', 'orcamentista', 'desenvolvedor'), atualizarCotacao);
router.delete('/:id', authenticate, authorize('admin', 'gerente', 'engenheiro', 'orcamentista', 'desenvolvedor'), deletarCotacao);
router.delete('/bulk', authenticate, authorize('admin', 'gerente', 'engenheiro', 'orcamentista', 'desenvolvedor'), deletarCotacoesEmLote);

export default router;

