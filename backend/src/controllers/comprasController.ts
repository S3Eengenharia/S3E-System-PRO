import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';

const prisma = new PrismaClient();
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// Listar compras
export const getCompras = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    
    const where = status ? { status: status as string } : {};

    const compras = await prisma.compra.findMany({
      where,
      include: {
        fornecedor: {
          select: { id: true, nome: true }
        },
        items: true
      },
      orderBy: { dataCompra: 'desc' }
    });

    res.json(compras);
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    res.status(500).json({ error: 'Erro ao buscar compras' });
  }
};

// Criar compra
export const createCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fornecedorNome,
      fornecedorCNPJ,
      fornecedorTel,
      numeroNF,
      dataEmissaoNF,
      dataCompra,
      dataRecebimento,
      valorFrete,
      outrasDespesas,
      status,
      items,
      observacoes
    } = req.body;

    // Buscar ou criar fornecedor
    let fornecedor = await prisma.fornecedor.findUnique({
      where: { cnpj: fornecedorCNPJ }
    });

    if (!fornecedor) {
      fornecedor = await prisma.fornecedor.create({
        data: {
          nome: fornecedorNome,
          cnpj: fornecedorCNPJ,
          telefone: fornecedorTel
        }
      });
    }

    // Calcular valores
    const valorSubtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantidade * item.valorUnit), 0
    );
    const valorTotal = valorSubtotal + (valorFrete || 0) + (outrasDespesas || 0);

    // Criar compra com items em transação
    const compra = await prisma.compra.create({
      data: {
        fornecedorId: fornecedor.id,
        fornecedorNome,
        fornecedorCNPJ,
        fornecedorTel,
        numeroNF,
        dataEmissaoNF: new Date(dataEmissaoNF),
        dataCompra: new Date(dataCompra),
        dataRecebimento: dataRecebimento ? new Date(dataRecebimento) : null,
        valorSubtotal,
        valorFrete: valorFrete || 0,
        outrasDespesas: outrasDespesas || 0,
        valorTotal,
        status,
        observacoes,
        items: {
          create: items.map((item: any) => ({
            nomeProduto: item.nomeProduto,
            ncm: item.ncm,
            quantidade: item.quantidade,
            valorUnit: item.valorUnit,
            valorTotal: item.quantidade * item.valorUnit
          }))
        }
      },
      include: {
        items: true,
        fornecedor: true
      }
    });

    // Se status for Recebido, atualizar estoque
    if (status === 'Recebido') {
      for (const item of items) {
        // Tentar encontrar material pelo nome ou NCM
        const material = await prisma.material.findFirst({
          where: {
            OR: [
              { nome: { contains: item.nomeProduto } },
              { sku: item.ncm }
            ]
          }
        });

        if (material) {
          // Atualizar estoque e registrar movimentação
          await prisma.$transaction([
            prisma.material.update({
              where: { id: material.id },
              data: { estoque: { increment: item.quantidade } }
            }),
            prisma.movimentacaoEstoque.create({
              data: {
                materialId: material.id,
                tipo: 'ENTRADA',
                quantidade: item.quantidade,
                motivo: 'COMPRA',
                referencia: compra.id,
                observacoes: `Compra NF: ${numeroNF}`
              }
            })
          ]);
        }
      }
    }

    res.status(201).json(compra);
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    res.status(500).json({ error: 'Erro ao criar compra' });
  }
};

// Parse XML da NF-e
export const parseXML = async (req: Request, res: Response): Promise<void> => {
  try {
    const xmlContent = req.body.xml;

    if (!xmlContent) {
      res.status(400).json({ error: 'XML não fornecido' });
      return;
    }

    const result = xmlParser.parse(xmlContent);
    
    // Estrutura básica de uma NF-e (simplificada)
    const nfe = result.nfeProc?.NFe?.infNFe || result.NFe?.infNFe || {};
    
    const fornecedor = {
      nome: nfe.emit?.xNome || '',
      cnpj: nfe.emit?.CNPJ || '',
      endereco: nfe.emit?.enderEmit ? 
        `${nfe.emit.enderEmit.xLgr}, ${nfe.emit.enderEmit.nro} - ${nfe.emit.enderEmit.xBairro}, ${nfe.emit.enderEmit.xMun}/${nfe.emit.enderEmit.UF}` : ''
    };

    const numeroNF = nfe.ide?.nNF || '';
    const dataEmissao = nfe.ide?.dhEmi || nfe.ide?.dEmi || '';
    
    const items = [];
    const det = Array.isArray(nfe.det) ? nfe.det : [nfe.det];
    
    for (const item of det) {
      if (item && item.prod) {
        items.push({
          nomeProduto: item.prod.xProd || '',
          ncm: item.prod.NCM || '',
          quantidade: parseFloat(item.prod.qCom || '0'),
          valorUnit: parseFloat(item.prod.vUnCom || '0'),
          valorTotal: parseFloat(item.prod.vProd || '0')
        });
      }
    }

    const totais = nfe.total?.ICMSTot || {};
    const valorFrete = parseFloat(totais.vFrete || '0');
    const outrasDespesas = parseFloat(totais.vOutro || '0');

    res.json({
      fornecedor,
      numeroNF,
      dataEmissao,
      items,
      valorFrete,
      outrasDespesas
    });
  } catch (error) {
    console.error('Erro ao fazer parse do XML:', error);
    res.status(500).json({ error: 'Erro ao processar XML. Verifique se o arquivo é válido.' });
  }
};

// Atualizar status da compra
export const updateCompraStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const compra = await prisma.compra.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!compra) {
      res.status(404).json({ error: 'Compra não encontrada' });
      return;
    }

    // Se mudou para Recebido, atualizar estoque
    if (status === 'Recebido' && compra.status !== 'Recebido') {
      for (const item of compra.items) {
        const material = await prisma.material.findFirst({
          where: {
            OR: [
              { nome: { contains: item.nomeProduto } },
              { sku: item.ncm || '' }
            ]
          }
        });

        if (material) {
          await prisma.$transaction([
            prisma.material.update({
              where: { id: material.id },
              data: { estoque: { increment: item.quantidade } }
            }),
            prisma.movimentacaoEstoque.create({
              data: {
                materialId: material.id,
                tipo: 'ENTRADA',
                quantidade: item.quantidade,
                motivo: 'COMPRA',
                referencia: id,
                observacoes: `Compra NF: ${compra.numeroNF}`
              }
            })
          ]);
        }
      }
    }

    const compraAtualizada = await prisma.compra.update({
      where: { id },
      data: { 
        status,
        dataRecebimento: status === 'Recebido' ? new Date() : compra.dataRecebimento
      },
      include: { items: true, fornecedor: true }
    });

    res.json(compraAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar compra:', error);
    res.status(500).json({ error: 'Erro ao atualizar compra' });
  }
};

