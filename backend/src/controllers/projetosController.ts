import { Request, Response } from 'express';
import { PrismaClient, ProjetoStatus } from '@prisma/client';
import { projetosService } from '../services/projetos.service.js';

const prisma = new PrismaClient();

// Listar todos os projetos
export const getProjetos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, clienteId, dataInicio, dataFim } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (clienteId) where.clienteId = clienteId;
    
    if (dataInicio || dataFim) {
      where.dataInicio = {};
      if (dataInicio) where.dataInicio.gte = new Date(dataInicio as string);
      if (dataFim) where.dataInicio.lte = new Date(dataFim as string);
    }

    const projetos = await prisma.projeto.findMany({
      where,
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true }
        },
        orcamento: {
          select: { id: true, precoVenda: true, status: true }
        },
        tasks: {
          select: { id: true, titulo: true, status: true, prioridade: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        alocacoes: {
          select: { 
            id: true, 
            dataInicio: true, 
            dataFimPrevisto: true, 
            status: true,
            equipe: { select: { nome: true, tipo: true } }
          },
          orderBy: { dataInicio: 'desc' }
        },
        vendas: {
          select: { id: true, valorTotal: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: projetos,
      total: projetos.length
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar projetos' 
    });
  }
};

// Buscar projeto por ID
export const getProjetoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const projeto = await prisma.projeto.findUnique({
      where: { id },
      include: {
        cliente: true,
        orcamento: {
          include: {
            items: {
              include: {
                material: { select: { nome: true, sku: true } },
                kit: { select: { nome: true } }
              }
            }
          }
        },
        tasks: {
          include: {
            // responsavel: { select: { nome: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        alocacoes: {
          include: {
            equipe: { select: { nome: true, tipo: true, membros: true } }
          },
          orderBy: { dataInicio: 'desc' }
        },
        vendas: {
          include: {
            contasReceber: { select: { id: true, valorParcela: true, status: true, dataVencimento: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        notasFiscais: {
          orderBy: { dataEmissao: 'desc' }
        }
      }
    });

    if (!projeto) {
      res.status(404).json({ 
        success: false,
        error: 'Projeto não encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      data: projeto
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar projeto' 
    });
  }
};

// Criar projeto
export const createProjeto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orcamentoId, clienteId, titulo, descricao, tipo, responsavelId, dataInicio, dataPrevisao } = req.body;

    console.log('🏗️ Criando projeto/obra com dados:', {
      orcamentoId,
      clienteId,
      titulo,
      tipo,
      responsavelId,
      dataInicio,
      dataPrevisao
    });

    // Verificar se orçamento foi fornecido (obrigatório)
    if (!orcamentoId) {
      console.error('❌ Orçamento não fornecido');
      res.status(400).json({
        success: false,
        error: 'Orçamento é obrigatório para criar projeto/obra'
      });
      return;
    }

    // Verificar se orçamento existe e está aprovado
    console.log('🔍 Buscando orçamento:', orcamentoId);
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId }
    });

    if (!orcamento) {
      console.error('❌ Orçamento não encontrado:', orcamentoId);
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    console.log('✅ Orçamento encontrado:', {
      id: orcamento.id,
      titulo: orcamento.titulo,
      status: orcamento.status
    });

    if (orcamento.status !== 'Aprovado') {
      console.error('❌ Orçamento não aprovado. Status atual:', orcamento.status);
      res.status(400).json({
        success: false,
        error: `Orçamento deve estar aprovado para criar projeto. Status atual: ${orcamento.status}`
      });
      return;
    }

    // Verificar se já existe projeto para este orçamento
    console.log('🔍 Verificando se já existe projeto para este orçamento...');
    const projetoExistente = await prisma.projeto.findUnique({
      where: { orcamentoId }
    });

    if (projetoExistente) {
      console.error('❌ Já existe projeto para este orçamento:', projetoExistente.id);
      res.status(400).json({
        success: false,
        error: `Já existe um projeto/obra vinculado a este orçamento: "${projetoExistente.titulo}"`
      });
      return;
    }

    // Usar o clienteId do orçamento (já validado acima)
    const clienteIdFinal = clienteId || orcamento.clienteId;

    // Verificar se responsável existe (se fornecido)
    if (responsavelId) {
      const responsavel = await prisma.user.findUnique({
        where: { id: responsavelId }
      });

      if (!responsavel) {
        res.status(404).json({
          success: false,
          error: 'Responsável não encontrado'
        });
        return;
      }
    }

    // Criar projeto
    const projeto = await prisma.projeto.create({
      data: {
        orcamentoId,
        clienteId: clienteIdFinal,
        responsavelId: responsavelId || null,
        titulo,
        descricao: descricao || '',
        tipo: tipo || 'Instalacao',
        status: 'PROPOSTA',
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataPrevisao: dataPrevisao ? new Date(dataPrevisao) : new Date()
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true
          }
        },
        responsavel: {
          select: {
            id: true,
            name: true
          }
        },
        orcamento: {
          select: {
            id: true,
            titulo: true,
            precoVenda: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: projeto,
      message: 'Projeto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar projeto' 
    });
  }
};

// Atualizar projeto
export const updateProjeto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titulo, descricao, valorTotal, dataInicio, dataPrevisao, dataFim } = req.body;

    // Verificar se projeto existe
    const projetoExistente = await prisma.projeto.findUnique({
      where: { id }
    });

    if (!projetoExistente) {
      res.status(404).json({
        success: false,
        error: 'Projeto não encontrado'
      });
      return;
    }

    // Se projeto está concluído, não permitir alterações
    if (projetoExistente.status === 'Concluido') {
      res.status(400).json({
        success: false,
        error: 'Não é possível alterar projeto concluído'
      });
      return;
    }

    const projeto = await prisma.projeto.update({
      where: { id },
      data: {
        titulo,
        descricao,
        valorTotal,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataPrevisao: dataPrevisao ? new Date(dataPrevisao) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined
      },
      include: {
        cliente: { select: { nome: true } },
        orcamento: { select: { precoVenda: true } }
      }
    });

    res.json({
      success: true,
      data: projeto,
      message: 'Projeto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar projeto' 
    });
  }
};

// Atualizar status do projeto
export const updateProjetoStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: ProjetoStatus };

    if (!['PROPOSTA','APROVADO','EXECUCAO','CONCLUIDO'].includes(String(status))) {
      res.status(400).json({ success: false, error: 'Status inválido. Use: PROPOSTA, APROVADO, EXECUCAO, CONCLUIDO' });
      return;
    }

    const atualizado = await projetosService.atualizarStatus(id, status as ProjetoStatus);

    res.json({ success: true, data: atualizado, message: `Status atualizado para ${status}` });
  } catch (error) {
    console.error('Erro ao atualizar status do projeto:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar status do projeto' 
    });
  }
};

// Cancelar/desativar projeto
export const deleteProjeto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar se projeto existe
    const projeto = await prisma.projeto.findUnique({
      where: { id }
    });

    if (!projeto) {
      res.status(404).json({
        success: false,
        error: 'Projeto não encontrado'
      });
      return;
    }

    // Verificar se projeto tem alocações ativas
    const alocacoesAtivas = await prisma.alocacaoObra.count({
      where: { 
        projetoId: id,
        status: { in: ['Planejada', 'EmAndamento'] }
      }
    });

    if (alocacoesAtivas > 0) {
      res.status(400).json({
        success: false,
        error: 'Não é possível cancelar projeto com alocações ativas'
      });
      return;
    }

    // Cancelar projeto
    await prisma.projeto.update({
      where: { id },
      data: { 
        status: 'Cancelado',
        dataFim: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Projeto cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar projeto:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao cancelar projeto' 
    });
  }
};

// Criar projeto a partir de orçamento
export const criarProjetoDeOrcamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orcamentoId } = req.body as { orcamentoId: string };
    if (!orcamentoId) {
      res.status(400).json({ success: false, error: 'orcamentoId é obrigatório' });
      return;
    }
    const projeto = await projetosService.criarProjetoAPartirDoOrcamento(orcamentoId);
    res.status(201).json({ success: true, data: projeto, message: 'Projeto criado a partir do orçamento' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Erro ao criar projeto do orçamento' });
  }
};

// Listar projetos com suporte a modo kanban
export const listarProjetosAvancado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { view } = req.query as { view?: 'kanban' | 'lista' };
    const data = await projetosService.listarProjetos(req.query, view === 'kanban' ? 'kanban' : 'lista');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao listar projetos' });
  }
};
