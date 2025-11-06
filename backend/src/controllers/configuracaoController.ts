import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import configuracaoService from '../services/configuracao.service.js';

// Configuração do multer para upload de imagem
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (JPEG, PNG, SVG, WEBP) são permitidas'));
    }
  }
});

export const uploadLogo = upload.single('logo');

export class ConfiguracaoController {
  /**
   * GET /api/configuracoes
   * Busca as configurações do sistema
   */
  static async getConfiguracoes(req: Request, res: Response): Promise<void> {
    try {
      const configuracoes = await configuracaoService.getConfiguracoes();
      res.status(200).json({ success: true, data: configuracoes });
    } catch (error: any) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar configurações', 
        error: error.message 
      });
    }
  }

  /**
   * PUT /api/configuracoes
   * Salva/atualiza as configurações do sistema
   * Requer: Admin
   */
  static async salvarConfiguracoes(req: Request, res: Response): Promise<void> {
    try {
      const { temaPreferido, logoUrl, nomeEmpresa, emailContato, telefoneContato } = req.body;

      // Validação básica
      if (temaPreferido && !['light', 'dark', 'system'].includes(temaPreferido)) {
        res.status(400).json({ 
          success: false, 
          message: 'Tema inválido. Use: light, dark ou system' 
        });
        return;
      }

      const configuracoes = await configuracaoService.salvarConfiguracoes({
        temaPreferido,
        logoUrl,
        nomeEmpresa,
        emailContato,
        telefoneContato
      });

      res.status(200).json({ 
        success: true, 
        data: configuracoes,
        message: 'Configurações salvas com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao salvar configurações', 
        error: error.message 
      });
    }
  }

  /**
   * POST /api/configuracoes/upload-logo
   * Upload de logo da empresa
   * Requer: Admin
   */
  static async uploadLogo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
        return;
      }

      // Construir URL do arquivo
      const logoUrl = `/uploads/logos/${req.file.filename}`;
      
      // Salvar URL no banco de dados
      const configuracoes = await configuracaoService.salvarConfiguracoes({ logoUrl });

      res.status(200).json({
        success: true,
        data: {
          logoUrl,
          configuracoes
        },
        message: 'Logo enviado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload do logo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload do logo',
        error: error.message
      });
    }
  }

  /**
   * GET /api/configuracoes/usuarios
   * Lista todos os usuários (sem senha)
   * Requer: Admin
   */
  static async listarUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const { search, role, active } = req.query;

      const filtros = {
        search: search as string | undefined,
        role: role as string | undefined,
        active: active === 'true' ? true : active === 'false' ? false : undefined
      };

      const usuarios = await configuracaoService.listarUsuarios(filtros);
      
      res.status(200).json({ success: true, data: usuarios });
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao listar usuários', 
        error: error.message 
      });
    }
  }

  /**
   * PUT /api/configuracoes/usuarios/:id/role
   * Atualiza o role de um usuário
   * Requer: Admin
   */
  static async atualizarUsuarioRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        res.status(400).json({ 
          success: false, 
          message: 'Role é obrigatório' 
        });
        return;
      }

      const usuario = await configuracaoService.atualizarUsuarioRole(id, role);
      
      res.status(200).json({ 
        success: true, 
        data: usuario,
        message: `Role atualizado para: ${role}` 
      });
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Erro ao atualizar role do usuário'
      });
    }
  }

  /**
   * PUT /api/configuracoes/usuarios/:id/status
   * Ativa/desativa um usuário
   * Requer: Admin
   */
  static async toggleUsuarioStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { active } = req.body;

      if (active === undefined) {
        res.status(400).json({ 
          success: false, 
          message: 'Status (active) é obrigatório' 
        });
        return;
      }

      const usuario = await configuracaoService.toggleUsuarioStatus(id, active);
      
      res.status(200).json({ 
        success: true, 
        data: usuario,
        message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso` 
      });
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao alterar status do usuário', 
        error: error.message 
      });
    }
  }

  /**
   * POST /api/configuracoes/usuarios/criar
   * Cria um novo usuário (apenas Admin)
   * Requer: Admin
   */
  static async criarUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body;

      // Validação dos campos obrigatórios
      if (!email || !password || !name || !role) {
        res.status(400).json({
          success: false,
          message: 'Email, senha, nome e função são obrigatórios'
        });
        return;
      }

      // Validação do role
      const rolesPermitidos = ['admin', 'gerente', 'orcamentista', 'compras', 'engenheiro', 'eletricista', 'user'];
      if (!rolesPermitidos.includes(role)) {
        res.status(400).json({
          success: false,
          message: `Role inválido. Permitidos: ${rolesPermitidos.join(', ')}`
        });
        return;
      }

      // Validação da senha
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      const usuario = await configuracaoService.criarUsuario({
        email,
        password,
        name,
        role
      });

      res.status(201).json({
        success: true,
        data: usuario,
        message: 'Usuário criado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      if (error.message === 'Email já cadastrado') {
        res.status(400).json({
          success: false,
          message: 'Email já cadastrado no sistema'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/configuracoes/usuarios/:id
   * Exclui um usuário permanentemente
   * Requer: Admin
   */
  static async excluirUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validação básica
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
        return;
      }

      // Proteção: não permitir que o admin exclua a si mesmo
      const userId = (req as any).userId; // userId do token JWT
      if (userId === id) {
        res.status(400).json({
          success: false,
          message: 'Você não pode excluir sua própria conta'
        });
        return;
      }

      const result = await configuracaoService.excluirUsuario(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);

      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao excluir usuário',
        error: error.message
      });
    }
  }
}

export default new ConfiguracaoController();

