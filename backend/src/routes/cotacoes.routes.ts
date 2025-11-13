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
  gerarTemplate,
  exportarCotacoes
} from '../controllers/cotacoesController.js';

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
router.post('/importar', upload.single('arquivo'), importarCotacoes);

// Rotas CRUD
router.get('/', listarCotacoes);
router.get('/:id', buscarCotacao);
router.post('/', criarCotacao);
router.put('/:id', atualizarCotacao);
router.delete('/:id', deletarCotacao);

export default router;

