import { Router } from 'express';
import { ConfiguracaoController, uploadLogo } from '../controllers/configuracaoController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/configuracoes
 * @desc Busca configurações do sistema
 * @access Authenticated
 */
router.get('/', ConfiguracaoController.getConfiguracoes);

/**
 * @route PUT /api/configuracoes
 * @desc Salva/atualiza configurações do sistema
 * @access Admin only
 */
router.put('/', authorize('admin'), ConfiguracaoController.salvarConfiguracoes);

/**
 * @route POST /api/configuracoes/upload-logo
 * @desc Upload de logo da empresa
 * @access Admin only
 */
router.post('/upload-logo', authorize('admin'), uploadLogo, ConfiguracaoController.uploadLogo);

/**
 * @route GET /api/configuracoes/usuarios
 * @desc Lista todos os usuários
 * @access Admin only
 */
router.get('/usuarios', authorize('admin'), ConfiguracaoController.listarUsuarios);

/**
 * @route PUT /api/configuracoes/usuarios/:id/role
 * @desc Atualiza o role de um usuário
 * @access Admin only
 */
router.put('/usuarios/:id/role', authorize('admin'), ConfiguracaoController.atualizarUsuarioRole);

/**
 * @route PUT /api/configuracoes/usuarios/:id/status
 * @desc Ativa/desativa um usuário
 * @access Admin only
 */
router.put('/usuarios/:id/status', authorize('admin'), ConfiguracaoController.toggleUsuarioStatus);

/**
 * @route POST /api/configuracoes/usuarios/criar
 * @desc Cria um novo usuário
 * @access Admin only
 */
router.post('/usuarios/criar', authorize('admin'), ConfiguracaoController.criarUsuario);

export default router;

