import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Listar todas as cotações
 * GET /api/cotacoes
 */
export const listarCotacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ativo, fornecedorId } = req.query;

    const where: any = {};
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }
    if (fornecedorId) {
      where.fornecedorId = fornecedorId as string;
    }

    const cotacoes = await prisma.cotacao.findMany({
      where,
      include: {
        fornecedor: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
          }
        }
      },
      orderBy: {
        dataAtualizacao: 'desc'
      }
    });

    res.json({
      success: true,
      data: cotacoes
    });
  } catch (error) {
    console.error('Erro ao listar cotações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar cotações'
    });
  }
};

/**
 * Buscar cotação por ID
 * GET /api/cotacoes/:id
 */
export const buscarCotacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cotacao = await prisma.cotacao.findUnique({
      where: { id },
      include: {
        fornecedor: true
      }
    });

    if (!cotacao) {
      res.status(404).json({
        success: false,
        error: 'Cotação não encontrada'
      });
      return;
    }

    res.json({
      success: true,
      data: cotacao
    });
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar cotação'
    });
  }
};

/**
 * Criar nova cotação
 * POST /api/cotacoes
 */
export const criarCotacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, ncm, valorUnitario, fornecedorId, fornecedorNome, observacoes } = req.body;

    // Validações
    if (!nome || valorUnitario === undefined) {
      res.status(400).json({
        success: false,
        error: 'Nome e valor unitário são obrigatórios'
      });
      return;
    }

    const cotacao = await prisma.cotacao.create({
      data: {
        nome,
        ncm,
        valorUnitario: parseFloat(valorUnitario),
        fornecedorId,
        fornecedorNome,
        observacoes,
        dataAtualizacao: new Date()
      },
      include: {
        fornecedor: true
      }
    });

    res.status(201).json({
      success: true,
      data: cotacao
    });
  } catch (error) {
    console.error('Erro ao criar cotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar cotação'
    });
  }
};

/**
 * Atualizar cotação
 * PUT /api/cotacoes/:id
 */
export const atualizarCotacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, ncm, valorUnitario, fornecedorId, fornecedorNome, observacoes, ativo } = req.body;

    const cotacao = await prisma.cotacao.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(ncm !== undefined && { ncm }),
        ...(valorUnitario !== undefined && { valorUnitario: parseFloat(valorUnitario) }),
        ...(fornecedorId !== undefined && { fornecedorId }),
        ...(fornecedorNome !== undefined && { fornecedorNome }),
        ...(observacoes !== undefined && { observacoes }),
        ...(ativo !== undefined && { ativo }),
        dataAtualizacao: new Date()
      },
      include: {
        fornecedor: true
      }
    });

    res.json({
      success: true,
      data: cotacao
    });
  } catch (error) {
    console.error('Erro ao atualizar cotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar cotação'
    });
  }
};

/**
 * Deletar cotação
 * DELETE /api/cotacoes/:id
 */
export const deletarCotacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.cotacao.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Cotação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cotação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar cotação'
    });
  }
};

/**
 * Importar cotações de JSON
 * POST /api/cotacoes/importar
 */
export const importarCotacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
      return;
    }

    console.log('📥 Importando cotações do arquivo:', file.filename);

    // Ler arquivo JSON
    const jsonContent = fs.readFileSync(file.path, 'utf-8');
    let jsonData = JSON.parse(jsonContent);

    // Remover wrapper se existir
    if (jsonData.success && jsonData.data) {
      console.log('🧹 Detectado wrapper - Extraindo data...');
      jsonData = jsonData.data;
    }

    console.log('📄 JSON parseado:', {
      versao: jsonData.versao,
      totalCotacoes: jsonData.cotacoes?.length || 0
    });

    if (!jsonData.cotacoes || !Array.isArray(jsonData.cotacoes)) {
      res.status(400).json({
        success: false,
        error: 'Formato JSON inválido. Deve conter array "cotacoes"'
      });
      return;
    }

    // Processar cotações
    const resultados = {
      criados: 0,
      atualizados: 0,
      erros: 0
    };

    for (const cotacao of jsonData.cotacoes) {
      try {
        // Verificar se já existe (por nome + fornecedor)
        const existente = await prisma.cotacao.findFirst({
          where: {
            nome: cotacao.nome,
            fornecedorNome: cotacao.fornecedorNome
          }
        });

        if (existente) {
          // Atualizar
          await prisma.cotacao.update({
            where: { id: existente.id },
            data: {
              valorUnitario: parseFloat(cotacao.valorUnitario),
              ncm: cotacao.ncm,
              observacoes: cotacao.observacoes,
              dataAtualizacao: new Date()
            }
          });
          resultados.atualizados++;
        } else {
          // Criar
          await prisma.cotacao.create({
            data: {
              nome: cotacao.nome,
              ncm: cotacao.ncm,
              valorUnitario: parseFloat(cotacao.valorUnitario),
              fornecedorId: cotacao.fornecedorId,
              fornecedorNome: cotacao.fornecedorNome,
              observacoes: cotacao.observacoes,
              dataAtualizacao: new Date()
            }
          });
          resultados.criados++;
        }
      } catch (error) {
        console.error('Erro ao processar cotação:', cotacao.nome, error);
        resultados.erros++;
      }
    }

    // Limpar arquivo temporário
    fs.unlinkSync(file.path);

    console.log('✅ Importação concluída:', resultados);

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    console.error('Erro ao importar cotações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar cotações'
    });
  }
};

/**
 * Gerar template JSON para importação
 * GET /api/cotacoes/template
 */
export const gerarTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const template = {
      versao: '1.0',
      geradoEm: new Date().toISOString(),
      empresa: 'S3E Engenharia Elétrica',
      instrucoes: 'Preencha os campos das cotações abaixo. Mantenha a estrutura do JSON.',
      cotacoes: [
        {
          nome: 'EXEMPLO - Cabo de Cobre 2,5mm',
          ncm: '85444200',
          valorUnitario: 100.50,
          fornecedorNome: 'Fornecedor Exemplo Ltda',
          observacoes: 'Cotação válida por 30 dias'
        }
      ]
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(template);
  } catch (error) {
    console.error('Erro ao gerar template:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar template'
    });
  }
};

/**
 * Exportar cotações para JSON
 * GET /api/cotacoes/exportar
 */
export const exportarCotacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const cotacoes = await prisma.cotacao.findMany({
      where: { ativo: true },
      include: {
        fornecedor: {
          select: {
            nome: true,
            cnpj: true
          }
        }
      },
      orderBy: {
        dataAtualizacao: 'desc'
      }
    });

    const exportData = {
      versao: '1.0',
      exportadoEm: new Date().toISOString(),
      empresa: 'S3E Engenharia Elétrica',
      totalCotacoes: cotacoes.length,
      cotacoes: cotacoes.map(c => ({
        nome: c.nome,
        ncm: c.ncm,
        valorUnitario: c.valorUnitario,
        fornecedorNome: c.fornecedorNome || c.fornecedor?.nome,
        dataAtualizacao: c.dataAtualizacao,
        observacoes: c.observacoes
      }))
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(exportData);
  } catch (error) {
    console.error('Erro ao exportar cotações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao exportar cotações'
    });
  }
};

