import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EmpresasController {
  static async listarEmpresas(req: Request, res: Response): Promise<void> {
    try {
      const { ativo, search } = req.query;
      const where: any = {};
      
      if (ativo !== undefined) where.ativo = ativo === 'true';
      if (search) {
        where.OR = [
          { razaoSocial: { contains: search as string, mode: 'insensitive' } },
          { nomeFantasia: { contains: search as string, mode: 'insensitive' } },
          { cnpj: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const empresas = await prisma.empresaFiscal.findMany({
        where,
        orderBy: { razaoSocial: 'asc' }
      });

      res.status(200).json({ success: true, data: empresas });
    } catch (error: any) {
      console.error('Erro ao listar empresas:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar empresas', error: error.message });
    }
  }

  static async buscarEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const empresa = await prisma.empresaFiscal.findUnique({
        where: { id }
      });

      if (!empresa) {
        res.status(404).json({ success: false, message: 'Empresa não encontrado' });
        return;
      }

      res.status(200).json({ success: true, data: empresa });
    } catch (error: any) {
      console.error('Erro ao buscar empresa:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar empresa', error: error.message });
    }
  }

  static async criarEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const {
        cnpj,
        inscricaoEstadual,
        razaoSocial,
        nomeFantasia,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone,
        email,
        regimeTributario,
        certificadoPath,
        certificadoSenha,
        certificadoValidade
      } = req.body;

      // Validação básica
      if (!cnpj || !inscricaoEstadual || !razaoSocial || !endereco || !numero || !bairro || !cidade || !estado || !cep || !regimeTributario) {
        res.status(400).json({ 
          success: false, 
          message: 'CNPJ, inscrição estadual, razão social, endereço, número, bairro, cidade, estado, CEP e regime tributário são obrigatórios' 
        });
      }

      // Validar CNPJ (formato básico)
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        res.status(400).json({ 
          success: false, 
          message: 'CNPJ deve ter 14 dígitos' 
        });
      }

      // Verificar se CNPJ já existe
      const cnpjExistente = await prisma.empresaFiscal.findUnique({
        where: { cnpj: cnpjLimpo }
      });

      if (cnpjExistente) {
        res.status(400).json({ 
          success: false, 
          message: 'CNPJ já cadastrado' 
        });
      }

      const novaEmpresa = await prisma.empresaFiscal.create({
        data: {
          cnpj: cnpjLimpo,
          inscricaoEstadual,
          razaoSocial,
          nomeFantasia,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          telefone,
          email,
          regimeTributario,
          certificadoPath,
          certificadoSenha,
          certificadoValidade: certificadoValidade ? new Date(certificadoValidade) : null
        }
      });

      res.status(201).json({ success: true, data: novaEmpresa });
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      res.status(500).json({ success: false, message: 'Erro ao criar empresa', error: error.message });
    }
  }

  static async atualizarEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        cnpj,
        inscricaoEstadual,
        razaoSocial,
        nomeFantasia,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone,
        email,
        regimeTributario,
        certificadoPath,
        certificadoSenha,
        certificadoValidade,
        ativo
      } = req.body;

      // Verificar se empresa existe
      const empresaExistente = await prisma.empresaFiscal.findUnique({
        where: { id }
      });

      if (!empresaExistente) {
        res.status(404).json({ success: false, message: 'Empresa não encontrada' });
        return;
      }

      // Se mudou o CNPJ, verificar se já existe
      if (cnpj && cnpj !== empresaExistente.cnpj) {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
          res.status(400).json({ 
            success: false, 
            message: 'CNPJ deve ter 14 dígitos' 
          });
        }

        const cnpjExistente = await prisma.empresaFiscal.findUnique({
          where: { cnpj: cnpjLimpo }
        });

        if (cnpjExistente) {
          res.status(400).json({ 
            success: false, 
            message: 'CNPJ já cadastrado' 
          });
        }
      }

      const empresaAtualizada = await prisma.empresaFiscal.update({
        where: { id },
        data: {
          cnpj: cnpj ? cnpj.replace(/\D/g, '') : undefined,
          inscricaoEstadual,
          razaoSocial,
          nomeFantasia,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          telefone,
          email,
          regimeTributario,
          certificadoPath,
          certificadoSenha,
          certificadoValidade: certificadoValidade ? new Date(certificadoValidade) : undefined,
          ativo
        }
      });

      res.status(200).json({ success: true, data: empresaAtualizada });
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar empresa', error: error.message });
    }
  }

  static async desativarEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const empresaDesativada = await prisma.empresaFiscal.update({
        where: { id },
        data: { ativo: false }
      });

      res.status(200).json({ success: true, data: empresaDesativada });
    } catch (error: any) {
      console.error('Erro ao desativar empresa:', error);
      res.status(500).json({ success: false, message: 'Erro ao desativar empresa', error: error.message });
    }
  }
}
