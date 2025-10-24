import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
    const { orcamentoId, clienteId, titulo, descricao, valorTotal, dataInicio, dataPrevisao } = req.body;

    // Verificar se orçamento existe e está aprovado
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: orcamentoId }
    });

    if (!orcamento) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    if (orcamento.status !== 'Aprovado') {
      res.status(400).json({
        success: false,
        error: 'Orçamento deve estar aprovado para criar projeto'
      });
      return;
    }

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
      return;
    }

    // Verificar se já existe projeto para este orçamento
    const projetoExistente = await prisma.projeto.findUnique({
      where: { orcamentoId }
    });

    if (projetoExistente) {
      res.status(400).json({
        success: false,
        error: 'Já existe um projeto para este orçamento'
      });
      return;
    }

    const projeto = await prisma.projeto.create({
      data: {
        orcamentoId,
        clienteId,
        titulo,
        descricao,
        valorTotal,
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataPrevisao: dataPrevisao ? new Date(dataPrevisao) : null
      },
      include: {
        cliente: { select: { nome: true, cpfCnpj: true } },
        orcamento: { select: { precoVenda: true, status: true } }
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
    const { status } = req.body;

    const statusValidos = ['EmAndamento', 'Concluido', 'Cancelado'];
    if (!statusValidos.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status inválido. Use: EmAndamento, Concluido ou Cancelado'
      });
      return;
    }

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

    const updateData: any = { status };
    
    // Se está sendo concluído, definir dataFim
    if (status === 'Concluido') {
      updateData.dataFim = new Date();
    }

    const projetoAtualizado = await prisma.projeto.update({
      where: { id },
      data: updateData,
      include: {
        cliente: { select: { nome: true } },
        orcamento: { select: { precoVenda: true } }
      }
    });

    res.json({
      success: true,
      data: projetoAtualizado,
      message: `Projeto ${status.toLowerCase()} com sucesso`
    });
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
