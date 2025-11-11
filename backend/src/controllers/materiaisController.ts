import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os materiais
export const getMateriais = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, ativo } = req.query;
    
    const where: any = {};
    if (categoria) where.categoria = categoria;
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const materiais = await prisma.material.findMany({
      where,
      include: {
        fornecedor: {
          select: { id: true, nome: true }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(materiais);
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
};

// Buscar material por ID
export const getMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        fornecedor: true,
        movimentacoes: {
          orderBy: { data: 'desc' },
          take: 10
        }
      }
    });

    if (!material) {
      res.status(404).json({ error: 'Material não encontrado' });
      return;
    }

    res.json(material);
  } catch (error) {
    console.error('Erro ao buscar material:', error);
    res.status(500).json({ error: 'Erro ao buscar material' });
  }
};

// Criar material
export const createMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const material = await prisma.material.create({
      data: req.body
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Erro ao criar material:', error);
    res.status(500).json({ error: 'Erro ao criar material' });
  }
};

// Atualizar material
export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await prisma.material.update({
      where: { id },
      data: req.body
    });

    res.json(material);
  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    res.status(500).json({ error: 'Erro ao atualizar material' });
  }
};

// Deletar material
export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.material.delete({ where: { id } });

    res.json({ message: 'Material deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar material:', error);
    res.status(500).json({ error: 'Erro ao deletar material' });
  }
};

// Registrar movimentação de estoque
export const registrarMovimentacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { materialId, tipo, quantidade, motivo, referencia, observacoes } = req.body;

    // Buscar material atual
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      res.status(404).json({ error: 'Material não encontrado' });
      return;
    }

    // Calcular novo estoque
    let novoEstoque = material.estoque;
    if (tipo === 'ENTRADA') {
      novoEstoque += quantidade;
    } else if (tipo === 'SAIDA') {
      novoEstoque -= quantidade;
      if (novoEstoque < 0) {
        res.status(400).json({ error: 'Estoque insuficiente' });
        return;
      }
    }

    // Criar movimentação e atualizar estoque em transação
    const [movimentacao, materialAtualizado] = await prisma.$transaction([
      prisma.movimentacaoEstoque.create({
        data: {
          materialId,
          tipo,
          quantidade,
          motivo,
          referencia,
          observacoes
        }
      }),
      prisma.material.update({
        where: { id: materialId },
        data: { estoque: novoEstoque }
      })
    ]);

    res.status(201).json({ movimentacao, material: materialAtualizado });
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
    res.status(500).json({ error: 'Erro ao registrar movimentação' });
  }
};

// Obter histórico de movimentações
export const getMovimentacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { materialId } = req.query;

    const where = materialId ? { materialId: materialId as string } : {};

    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where,
      include: {
        material: {
          select: { id: true, nome: true, sku: true }
        }
      },
      orderBy: { data: 'desc' },
      take: 100
    });

    res.json(movimentacoes);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({ error: 'Erro ao buscar movimentações' });
  }
};

// Obter histórico de compras de um material
export const getHistoricoCompras = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const compraItems = await prisma.compraItem.findMany({
      where: { materialId: id },
      include: {
        compra: {
          select: {
            dataCompra: true,
            dataEmissaoNF: true,
            numeroNF: true,
            fornecedorNome: true,
            status: true
          }
        }
      },
      orderBy: { compra: { dataCompra: 'desc' } }
    });

    const historico = compraItems.map(item => ({
      dataCompra: item.compra.dataCompra,
      numeroNF: item.compra.numeroNF,
      fornecedor: item.compra.fornecedorNome,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnit,
      valorTotal: item.valorTotal,
      status: item.compra.status,
      nomeProduto: item.nomeProduto // Incluir nome do produto da compra
    }));

    res.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico de compras:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de compras' });
  }
};

// Buscar materiais similares pelo nome (para verificação de duplicatas)
export const buscarMateriaisSimilares = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nomeProduto, ncm } = req.body;

    if (!nomeProduto) {
      res.status(400).json({ error: 'Nome do produto é obrigatório' });
      return;
    }

    console.log(`🔍 Buscando materiais similares a: "${nomeProduto}"`);

    // Extrair palavras-chave do nome (mínimo 3 caracteres)
    const palavrasChave = nomeProduto
      .split(/\s+/)
      .filter((palavra: string) => palavra.length >= 3)
      .slice(0, 5); // Limitar a 5 palavras-chave principais

    const materiaisSimilares = await prisma.material.findMany({
      where: {
        AND: [
          { ativo: true },
          {
            OR: [
              // Busca exata pelo nome
              { nome: { equals: nomeProduto, mode: 'insensitive' } },
              // Busca exata pela descrição
              { descricao: { equals: nomeProduto, mode: 'insensitive' } },
              // Busca por NCM se fornecido
              ...(ncm ? [{ sku: { contains: String(ncm) } }] : []),
              // Busca por palavras-chave no nome
              ...palavrasChave.map((palavra: string) => ({
                nome: { contains: palavra, mode: 'insensitive' as any }
              })),
              // Busca por palavras-chave na descrição
              ...palavrasChave.map((palavra: string) => ({
                descricao: { contains: palavra, mode: 'insensitive' as any }
              }))
            ]
          }
        ]
      },
      include: {
        fornecedor: {
          select: { id: true, nome: true }
        }
      },
      take: 10, // Limitar a 10 resultados
      orderBy: { nome: 'asc' }
    });

    console.log(`✅ Encontrados ${materiaisSimilares.length} materiais similares`);

    res.json(materiaisSimilares);
  } catch (error) {
    console.error('Erro ao buscar materiais similares:', error);
    res.status(500).json({ error: 'Erro ao buscar materiais similares' });
  }
};

// Corrigir nomes genéricos de materiais baseado no histórico de compras
export const corrigirNomesGenericos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar materiais com nomes genéricos
    const materiaisGenericos = await prisma.material.findMany({
      where: {
        OR: [
          { nome: { contains: 'Produto importado via XML' } },
          { categoria: 'Importado XML' }
        ]
      }
    });

    console.log(`📋 Encontrados ${materiaisGenericos.length} materiais com nomes genéricos`);

    let corrigidos = 0;

    for (const material of materiaisGenericos) {
      // Buscar a compra mais recente deste material
      const compraItem = await prisma.compraItem.findFirst({
        where: { materialId: material.id },
        orderBy: { compra: { dataCompra: 'desc' } },
        include: { compra: true }
      });

      if (compraItem && compraItem.nomeProduto && !compraItem.nomeProduto.includes('Produto importado')) {
        // Atualizar com o nome real do produto
        await prisma.material.update({
          where: { id: material.id },
          data: {
            nome: compraItem.nomeProduto,
            descricao: compraItem.nomeProduto,
            categoria: 'Material Elétrico' // Atualizar categoria também
          }
        });
        console.log(`✅ Material ${material.id} atualizado: "${compraItem.nomeProduto}"`);
        corrigidos++;
      }
    }

    res.json({
      success: true,
      message: `${corrigidos} materiais corrigidos com sucesso`,
      total: materiaisGenericos.length,
      corrigidos
    });
  } catch (error) {
    console.error('Erro ao corrigir nomes genéricos:', error);
    res.status(500).json({ error: 'Erro ao corrigir nomes genéricos' });
  }
};

