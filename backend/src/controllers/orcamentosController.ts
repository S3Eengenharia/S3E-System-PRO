import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar orçamentos
export const getOrcamentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, clienteId } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (clienteId) where.clienteId = clienteId;

    const orcamentos = await prisma.orcamento.findMany({
      where,
      include: {
        cliente: {
          select: { id: true, nome: true, cpfCnpj: true }
        },
        items: {
          include: {
            material: { select: { id: true, nome: true, sku: true } },
            kit: { select: { id: true, nome: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orcamentos);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
};

// Buscar orçamento por ID
export const getOrcamentoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        items: {
          include: {
            material: true,
            kit: {
              include: {
                items: {
                  include: { material: true }
                }
              }
            }
          }
        },
        projeto: true
      }
    });

    if (!orcamento) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
      return;
    }

    res.json(orcamento);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: 'Erro ao buscar orçamento' });
  }
};

// Criar orçamento
export const createOrcamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      clienteId,
      titulo,
      descricao,
      descricaoProjeto,
      validade,
      bdi,
      items,
      observacoes,
      // Novos campos
      empresaCNPJ,
      enderecoObra,
      cidade,
      bairro,
      cep,
      responsavelObra,
      previsaoInicio,
      previsaoTermino,
      descontoValor,
      impostoPercentual,
      condicaoPagamento
    } = req.body;

    // Calcular custo total e preço de venda
    let custoTotal = 0;
    const itemsData = [];

    for (const item of items) {
      let custoUnit = item.custoUnit;
      
      // Se for kit, calcular custo baseado nos materiais
      if (item.tipo === 'KIT' && item.kitId) {
        const kit = await prisma.kit.findUnique({
          where: { id: item.kitId },
          include: {
            items: {
              include: { material: true }
            }
          }
        });
        
        if (kit) {
          custoUnit = kit.items.reduce((sum, kitItem) => 
            sum + (kitItem.material.preco || 0) * kitItem.quantidade, 0
          );
        }
      }

      const subtotal = custoUnit * item.quantidade;
      const precoUnit = custoUnit * (1 + (bdi || 0) / 100);
      
      custoTotal += subtotal;

      itemsData.push({
        tipo: item.tipo,
        materialId: item.materialId,
        kitId: item.kitId,
        servicoNome: item.servicoNome,
        descricao: item.descricao,
        quantidade: item.quantidade,
        custoUnit,
        precoUnit,
        subtotal: precoUnit * item.quantidade
      });
    }

    // NOVA LÓGICA DE CÁLCULO:
    // 1. Subtotal com BDI aplicado aos itens
    const subtotalComBDI = itemsData.reduce((sum, item) => sum + item.subtotal, 0);
    
    // 2. Aplicar desconto
    const valorComDesconto = subtotalComBDI - (descontoValor || 0);
    
    // 3. Aplicar impostos
    const precoVenda = valorComDesconto * (1 + (impostoPercentual || 0) / 100);

    const orcamento = await prisma.orcamento.create({
      data: {
        clienteId,
        titulo,
        descricao,
        descricaoProjeto,
        validade: new Date(validade),
        bdi: bdi || 0,
        custoTotal,
        precoVenda,
        observacoes,
        // Novos campos
        empresaCNPJ,
        enderecoObra,
        cidade,
        bairro,
        cep,
        responsavelObra,
        previsaoInicio: previsaoInicio ? new Date(previsaoInicio) : null,
        previsaoTermino: previsaoTermino ? new Date(previsaoTermino) : null,
        descontoValor: descontoValor || 0,
        impostoPercentual: impostoPercentual || 0,
        condicaoPagamento,
        items: {
          create: itemsData
        }
      },
      include: {
        cliente: true,
        items: {
          include: {
            material: true,
            kit: true
          }
        },
        fotos: true
      }
    });

    res.status(201).json(orcamento);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
};

// Atualizar status do orçamento
export const updateOrcamentoStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: { cliente: true }
    });

    if (!orcamento) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
      return;
    }

    // Se aprovado, criar ou atualizar projeto automaticamente
    let projeto = null;
    if (status === 'Aprovado' && orcamento.status !== 'Aprovado') {
      // Verificar se já existe um projeto vinculado
      const projetoExistente = await prisma.projeto.findUnique({
        where: { orcamentoId: id }
      });

      if (projetoExistente) {
        // Se já existe, apenas atualizar o status
        console.log(`📋 Projeto existente encontrado: ${projetoExistente.id}. Atualizando status para APROVADO`);
        projeto = await prisma.projeto.update({
          where: { id: projetoExistente.id },
          data: { status: 'APROVADO' }
        });
      } else {
        // Se não existe, criar novo projeto
        console.log(`📋 Criando novo projeto para orçamento ${id}`);
        projeto = await prisma.projeto.create({
          data: {
            orcamentoId: id,
            clienteId: orcamento.clienteId,
            titulo: orcamento.titulo,
            descricao: orcamento.descricao,
            valorTotal: orcamento.precoVenda,
            dataInicio: new Date(),
            status: 'APROVADO' // Projeto começa como APROVADO (ainda não em execução)
          }
        });
      }
    }

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id },
      data: {
        status,
        aprovedAt: status === 'Aprovado' ? new Date() : orcamento.aprovedAt
      },
      include: {
        cliente: true,
        items: true,
        projeto: true
      }
    });

    res.json({ orcamento: orcamentoAtualizado, projeto });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
};

// Aprovar orçamento
export const aprovarOrcamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const orcamento = await prisma.orcamento.findUnique({
      where: { id }
    });

    if (!orcamento) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    if (orcamento.status === 'Aprovado') {
      res.status(400).json({
        success: false,
        error: 'Orçamento já está aprovado'
      });
      return;
    }

    // Verificar se já existe um projeto vinculado
    const projetoExistente = await prisma.projeto.findUnique({
      where: { orcamentoId: id }
    });

    let projeto = null;
    if (projetoExistente) {
      // Se já existe, atualizar o status para APROVADO
      console.log(`📋 Atualizando projeto existente ${projetoExistente.id} para APROVADO`);
      projeto = await prisma.projeto.update({
        where: { id: projetoExistente.id },
        data: { status: 'APROVADO' }
      });
    } else {
      // Se não existe, criar novo projeto
      console.log(`📋 Criando novo projeto para orçamento ${id}`);
      projeto = await prisma.projeto.create({
        data: {
          orcamentoId: id,
          clienteId: orcamento.clienteId,
          titulo: orcamento.titulo,
          descricao: orcamento.descricao,
          valorTotal: orcamento.precoVenda,
          dataInicio: new Date(),
          status: 'APROVADO'
        }
      });
    }

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id },
      data: {
        status: 'Aprovado',
        aprovedAt: new Date()
      },
      include: {
        cliente: {
          select: { id: true, nome: true }
        },
        items: true,
        projeto: true
      }
    });

    res.json({
      success: true,
      data: orcamentoAtualizado,
      projeto: projeto,
      message: `Orçamento aprovado com sucesso${projeto ? ' e projeto atualizado' : ''}`
    });
  } catch (error) {
    console.error('Erro ao aprovar orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao aprovar orçamento'
    });
  }
};

// Recusar orçamento
export const recusarOrcamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const orcamento = await prisma.orcamento.findUnique({
      where: { id }
    });

    if (!orcamento) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    if (orcamento.status === 'Recusado') {
      res.status(400).json({
        success: false,
        error: 'Orçamento já está recusado'
      });
      return;
    }

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id },
      data: {
        status: 'Recusado',
        recusadoAt: new Date(),
        motivoRecusa: motivo || null
      },
      include: {
        cliente: {
          select: { id: true, nome: true }
        },
        items: true
      }
    });

    res.json({
      success: true,
      data: orcamentoAtualizado,
      message: 'Orçamento recusado'
    });
  } catch (error) {
    console.error('Erro ao recusar orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao recusar orçamento'
    });
  }
};

// Atualizar orçamento completo
export const updateOrcamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      clienteId,
      titulo,
      descricao,
      descricaoProjeto,
      validade,
      bdi,
      items,
      observacoes,
      empresaCNPJ,
      enderecoObra,
      cidade,
      bairro,
      cep,
      responsavelObra,
      previsaoInicio,
      previsaoTermino,
      descontoValor,
      impostoPercentual,
      condicaoPagamento
    } = req.body;

    console.log('🔄 Atualizando orçamento:', id);
    console.log('📦 Dados recebidos:', req.body);

    // Verificar se orçamento existe
    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!orcamentoExistente) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    // Recalcular totais se items foram fornecidos
    let custoTotal = orcamentoExistente.custoTotal;
    let precoVenda = orcamentoExistente.precoVenda;
    let itemsData: any[] = [];

    if (items && items.length > 0) {
      custoTotal = 0;

      for (const item of items) {
        let custoUnit = item.custoUnit || 0;
        
        // Se for kit, calcular custo baseado nos materiais
        if (item.tipo === 'KIT' && item.kitId) {
          const kit = await prisma.kit.findUnique({
            where: { id: item.kitId },
            include: {
              items: {
                include: { material: true }
              }
            }
          });
          
          if (kit) {
            custoUnit = kit.items.reduce((sum, kitItem) => 
              sum + (kitItem.material.preco || 0) * kitItem.quantidade, 0
            );
          }
        }

        const subtotal = custoUnit * item.quantidade;
        const precoUnit = custoUnit * (1 + (bdi || orcamentoExistente.bdi || 0) / 100);
        
        custoTotal += subtotal;

        itemsData.push({
          tipo: item.tipo,
          materialId: item.materialId,
          kitId: item.kitId,
          servicoNome: item.servicoNome,
          descricao: item.descricao,
          quantidade: item.quantidade,
          custoUnit,
          precoUnit,
          subtotal: precoUnit * item.quantidade
        });
      }

      // Recalcular preço de venda
      const subtotalComBDI = itemsData.reduce((sum, item) => sum + item.subtotal, 0);
      const valorComDesconto = subtotalComBDI - (descontoValor || orcamentoExistente.descontoValor || 0);
      precoVenda = valorComDesconto * (1 + (impostoPercentual || orcamentoExistente.impostoPercentual || 0) / 100);
    }

    // Preparar dados de atualização
    const updateData: any = {
      titulo: titulo || orcamentoExistente.titulo,
      descricao: descricao !== undefined ? descricao : orcamentoExistente.descricao,
      descricaoProjeto: descricaoProjeto !== undefined ? descricaoProjeto : orcamentoExistente.descricaoProjeto,
      observacoes: observacoes !== undefined ? observacoes : orcamentoExistente.observacoes,
      validade: validade ? new Date(validade) : orcamentoExistente.validade,
      bdi: bdi !== undefined ? bdi : orcamentoExistente.bdi,
      custoTotal,
      precoVenda,
      empresaCNPJ: empresaCNPJ !== undefined ? empresaCNPJ : orcamentoExistente.empresaCNPJ,
      enderecoObra: enderecoObra !== undefined ? enderecoObra : orcamentoExistente.enderecoObra,
      cidade: cidade !== undefined ? cidade : orcamentoExistente.cidade,
      bairro: bairro !== undefined ? bairro : orcamentoExistente.bairro,
      cep: cep !== undefined ? cep : orcamentoExistente.cep,
      responsavelObra: responsavelObra !== undefined ? responsavelObra : orcamentoExistente.responsavelObra,
      descontoValor: descontoValor !== undefined ? descontoValor : orcamentoExistente.descontoValor,
      impostoPercentual: impostoPercentual !== undefined ? impostoPercentual : orcamentoExistente.impostoPercentual,
      condicaoPagamento: condicaoPagamento !== undefined ? condicaoPagamento : orcamentoExistente.condicaoPagamento,
      previsaoInicio: previsaoInicio ? new Date(previsaoInicio) : orcamentoExistente.previsaoInicio,
      previsaoTermino: previsaoTermino ? new Date(previsaoTermino) : orcamentoExistente.previsaoTermino
    };

    if (clienteId) {
      updateData.clienteId = clienteId;
    }

    // Se items foram fornecidos, deletar os antigos e criar novos
    if (items && items.length > 0) {
      await prisma.orcamentoItem.deleteMany({
        where: { orcamentoId: id }
      });

      updateData.items = {
        create: itemsData
      };
    }

    // Atualizar orçamento
    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id },
      data: updateData,
      include: {
        cliente: {
          select: { 
            id: true, 
            nome: true, 
            email: true, 
            telefone: true 
          }
        },
        items: {
          include: {
            material: { select: { id: true, nome: true, sku: true } },
            kit: { select: { id: true, nome: true } }
          }
        },
        fotos: true
      }
    });

    console.log('✅ Orçamento atualizado com sucesso');

    res.json({
      success: true,
      data: orcamentoAtualizado,
      message: 'Orçamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar orçamento'
    });
  }
};

