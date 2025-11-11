import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import { ComprasService, CompraPayload } from '../services/compras.service';

const prisma = new PrismaClient();
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// Listar compras
export const getCompras = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, fornecedorId, page = 1, limit = 100 } = req.query; // Aumentado de 10 para 100

    const resultado = await ComprasService.listarCompras(
      status as string,
      fornecedorId as string,
      undefined,
      undefined,
      parseInt(page as string),
      parseInt(limit as string)
    );

    console.log(`📦 Listando compras - Total: ${resultado.pagination.total}, Página: ${page}, Retornando: ${resultado.compras.length}`);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar compras',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Buscar compra por ID
export const getCompraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da compra é obrigatório'
      });
      return;
    }

    console.log(`🔍 Buscando compra: ${id}`);
    const compra = await ComprasService.buscarCompra(id);

    res.json({
      success: true,
      data: compra
    });
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    
    if (error instanceof Error && error.message === 'Compra não encontrada') {
      res.status(404).json({
        success: false,
        error: 'Compra não encontrada'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar compra',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
};

// Criar compra
export const createCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const compraData: CompraPayload = {
      fornecedorNome: req.body.fornecedorNome,
      fornecedorCNPJ: req.body.fornecedorCNPJ,
      fornecedorTel: req.body.fornecedorTel,
      numeroNF: req.body.numeroNF,
      dataEmissaoNF: new Date(req.body.dataEmissaoNF),
      dataCompra: new Date(req.body.dataCompra),
      dataRecebimento: req.body.dataRecebimento ? new Date(req.body.dataRecebimento) : undefined,
      valorFrete: req.body.valorFrete || 0,
      outrasDespesas: req.body.outrasDespesas || 0,
      status: req.body.status,
      items: req.body.items,
      observacoes: req.body.observacoes,
      condicoesPagamento: req.body.condicoesPagamento,
      parcelas: req.body.parcelas,
      dataPrimeiroVencimento: req.body.dataPrimeiroVencimento ? new Date(req.body.dataPrimeiroVencimento) : undefined
    };

    // Validar dados obrigatórios
    console.log('🔍 Validando compra:', {
      fornecedorNome: compraData.fornecedorNome,
      fornecedorCNPJ: compraData.fornecedorCNPJ,
      numeroNF: compraData.numeroNF,
      itemsLength: compraData.items?.length
    });
    
    if (!compraData.fornecedorNome || !compraData.fornecedorCNPJ || !compraData.numeroNF || !compraData.items || compraData.items.length === 0) {
      const missing = [];
      if (!compraData.fornecedorNome) missing.push('fornecedorNome');
      if (!compraData.fornecedorCNPJ) missing.push('fornecedorCNPJ');
      if (!compraData.numeroNF) missing.push('numeroNF');
      if (!compraData.items || compraData.items.length === 0) missing.push('items');
      
      console.error('❌ Dados obrigatórios ausentes:', missing);
      res.status(400).json({
        error: 'Dados obrigatórios ausentes: ' + missing.join(', ')
      });
      return;
    }

    const resultado = await ComprasService.registrarCompra(compraData);

    res.status(201).json({
      success: true,
      message: 'Compra registrada com sucesso',
      data: resultado
    });
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

    // Estrutura básica de uma NF-e (v4.00)
    const nfe = result?.nfeProc?.NFe?.infNFe || result?.NFe?.infNFe || {};

    // Fornecedor (Emitente)
    const fornecedor = {
      nome: nfe.emit?.xNome || '',
      cnpj: nfe.emit?.CNPJ || '',
      endereco: nfe.emit?.enderEmit
        ? `${nfe.emit.enderEmit.xLgr}, ${nfe.emit.enderEmit.nro} - ${nfe.emit.enderEmit.xBairro}, ${nfe.emit.enderEmit.xMun}/${nfe.emit.enderEmit.UF}`
        : ''
    };

    // Destinatário (empresa compradora)
    const destinatarioCNPJ = nfe.dest?.CNPJ || '';
    const destinatarioRazaoSocial = nfe.dest?.xNome || '';

    const numeroNF = nfe.ide?.nNF || '';
    const dataEmissao = nfe.ide?.dhEmi || nfe.ide?.dEmi || '';

    // Itens
    const items: Array<{
      nomeProduto: string;
      ncm: string;
      quantidade: number;
      valorUnit: number;
      valorTotal: number;
      sku?: string;
      materialId?: string;
    }> = [];
    const det = Array.isArray(nfe.det) ? nfe.det : nfe.det ? [nfe.det] : [];
    for (const item of det) {
      if (item && item.prod) {
        items.push({
          nomeProduto: item.prod.xProd || '',
          ncm: item.prod.NCM || '',
          quantidade: parseFloat(item.prod.qCom || '0'),
          valorUnit: parseFloat(item.prod.vUnCom || '0'),
          valorTotal: parseFloat(item.prod.vProd || '0'),
          sku: item.prod.cProd || item.prod.cEAN || item.prod.cEANTrib || undefined
        });
      }
    }

    // Totais
    const totais = nfe.total?.ICMSTot || {};
    const valorFrete = parseFloat(totais.vFrete || '0');
    const outrasDespesas = parseFloat(totais.vOutro || '0');
    const valorIPI = parseFloat(totais.vIPI || '0');
    const valorTotalProdutos = parseFloat(totais.vProd || '0');
    const valorTotalNota = parseFloat(totais.vNF || '0');

    // Duplicatas / Parcelas
    let parcelas: Array<{ numero: string; dataVencimento: string; valor: number }> = [];
    const cobr = nfe.cobr || {};
    const dupList = Array.isArray(cobr.dup) ? cobr.dup : cobr.dup ? [cobr.dup] : [];
    if (dupList.length > 0) {
      parcelas = dupList.map((d: any, idx: number) => ({
        numero: d.nDup || String(idx + 1).padStart(3, '0'),
        dataVencimento: (d.dVenc || '').slice(0, 10),
        valor: parseFloat(d.vDup || '0')
      }));
    }

    // Log dos dados parseados
    console.log('✅ XML parseado com sucesso!');
    console.log('🏢 Fornecedor:', fornecedor.nome);
    console.log('📄 NF:', numeroNF);
    console.log('📦 Items:', items.length);
    
    res.json({
      success: true,
      data: {
        fornecedor,
        destinatarioCNPJ,
        destinatarioRazaoSocial,
        numeroNF,
        dataEmissao,
        items,
        valorFrete,
        outrasDespesas,
        valorIPI,
        valorTotalProdutos,
        valorTotalNota,
        parcelas
      }
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

    if (!status) {
      res.status(400).json({ error: 'Status é obrigatório' });
      return;
    }

    const compraAtualizada = await ComprasService.atualizarStatusCompra(id, status);

    res.json({
      success: true,
      message: 'Status da compra atualizado com sucesso',
      data: compraAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar compra:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar compra',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const receberRemessaParcial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, dataEntregaReal, produtoIds } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status é obrigatório' });
      return;
    }

    if (!produtoIds || !Array.isArray(produtoIds) || produtoIds.length === 0) {
      res.status(400).json({ error: 'Pelo menos um produto deve ser selecionado' });
      return;
    }

    console.log('📦 Recebendo remessa parcial:', id, 'Produtos:', produtoIds);
    
    const compraAtualizada = await ComprasService.receberRemessaParcial(id, status, produtoIds);

    res.json({
      success: true,
      message: 'Remessa parcial recebida com sucesso',
      data: compraAtualizada
    });
  } catch (error) {
    console.error('Erro ao receber remessa parcial:', error);
    res.status(500).json({ 
      error: 'Erro ao receber remessa parcial',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

