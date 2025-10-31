import { apiService } from './api';
import { type PurchaseOrder } from '../types';

export interface ItemCompra {
  id: string;
  materialId: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  material?: any;
}

export interface Compra {
  id: string;
  fornecedorId: string;
  valorTotal: number;
  status: 'Pendente' | 'Aprovado' | 'Recebido' | 'Cancelado';
  dataCompra: string;
  dataEntregaPrevista?: string;
  dataEntregaReal?: string;
  notaFiscal?: string;
  observacoes?: string;
  itens?: ItemCompra[];
  fornecedor?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedXMLData {
  fornecedor: {
    cnpj: string;
    nome: string;
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  valorTotal: number;
  numeroNota: string;
  dataEmissao: string;
}

class ComprasService {
  /**
   * Converte o DTO do backend em um PurchaseOrder usado na UI
   */
  mapCompraToPurchaseOrder(compraDTO: any): PurchaseOrder {
    return {
      id: compraDTO.id,
      supplierId: compraDTO.fornecedorId || compraDTO.fornecedor?.id || '',
      supplierName: compraDTO.fornecedorNome || compraDTO.fornecedor?.nome || compraDTO.supplierName || 'Fornecedor',
      orderDate: compraDTO.dataCompra || compraDTO.orderDate,
      invoiceNumber: compraDTO.numeroNF || compraDTO.invoiceNumber,
      status: (compraDTO.status as any) || 'Pendente',
      items: (compraDTO.items || compraDTO.itens || []).map((it: any) => ({
        productId: it.materialId || it.productId || it.id || '',
        productName: it.nomeProduto || it.productName || it.nome || 'Item',
        quantity: it.quantidade || it.quantity || 0,
        unitCost: it.valorUnit || it.precoUnitario || it.unitCost || 0,
        totalCost: (it.quantidade || it.quantity || 0) * (it.valorUnit || it.precoUnitario || it.unitCost || 0)
      })),
      totalAmount: compraDTO.valorTotal || compraDTO.totalAmount || 0,
      notes: compraDTO.observacoes || compraDTO.notes || ''
    } as PurchaseOrder;
  }
  /**
   * Listar todas as compras
   */
  async getCompras(params?: {
    status?: string;
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) {
    const resp = await apiService.get<any>('/api/compras', params);
    // Desenvelopa: alguns endpoints retornam { success, data } ou apenas []
    const raw = Array.isArray(resp)
      ? resp
      : Array.isArray((resp as any).data)
      ? (resp as any).data
      : Array.isArray((resp as any)?.data?.data)
      ? (resp as any).data.data
      : [];
    return (raw as any[]).map((c) => this.mapCompraToPurchaseOrder(c));
  }

  /**
   * Criar nova compra
   */
  async createCompra(data: any) {
    const resp = await apiService.post<any>('/api/compras', data);
    return (resp as any)?.data ?? resp;
  }

  /**
   * Atualizar status da compra
   */
  async updateCompraStatus(id: string, status: 'Pendente' | 'Aprovado' | 'Recebido' | 'Cancelado', dataEntregaReal?: string) {
    return apiService.put<Compra>(`/api/compras/${id}/status`, { 
      status,
      dataEntregaReal 
    });
  }

  /**
   * Fazer parse de XML de nota fiscal no backend
   * Envia o conteúdo XML como JSON { xml: string }
   */
  async parseXML(xmlText: string) {
    return apiService.post<any>('/api/compras/parse-xml', { xml: xmlText });
  }
}

export const comprasService = new ComprasService();

