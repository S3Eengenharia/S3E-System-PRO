import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CSVItem {
  codigo: string;
  nome: string;
  unidade: string;
  quantidade: number;
  preco_unitario: number;
}

export interface ProcessedItem extends CSVItem {
  preco_atual?: number;
  diferenca_percentual?: number;
  status: 'Lower' | 'Higher' | 'Equal' | 'NoHistory';
}

export interface ProcessedCSVResult {
  items: ProcessedItem[];
  summary: {
    total_items: number;
    lower_prices: number;
    higher_prices: number;
    equal_prices: number;
    no_history: number;
    total_savings: number;
    total_extra_cost: number;
  };
}

export class ComparacaoPrecosService {
  /**
   * Processa um arquivo CSV de orçamento de fornecedor
   */
  async processarCSV(csvContent: string): Promise<ProcessedCSVResult> {
    try {
      // Parse do CSV
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          // Converter colunas numéricas
          if (context.column === 'quantidade' || context.column === 'preco_unitario') {
            const numValue = parseFloat(value.replace(',', '.'));
            return isNaN(numValue) ? 0 : numValue;
          }
          return value;
        }
      });

      // Validar estrutura do CSV
      if (!records.length) {
        throw new Error('CSV vazio ou sem dados válidos');
      }

      const requiredColumns = ['codigo', 'nome', 'unidade', 'quantidade', 'preco_unitario'];
      const csvColumns = Object.keys(records[0]);
      
      for (const column of requiredColumns) {
        if (!csvColumns.includes(column)) {
          throw new Error(`Coluna obrigatória não encontrada: ${column}`);
        }
      }

      // Processar cada item
      const processedItems: ProcessedItem[] = [];
      let lowerPrices = 0;
      let higherPrices = 0;
      let equalPrices = 0;
      let noHistory = 0;
      let totalSavings = 0;
      let totalExtraCost = 0;

      for (const record of records) {
        const item = await this.processarItem(record as CSVItem);
        processedItems.push(item);

        // Calcular estatísticas
        switch (item.status) {
          case 'Lower':
            lowerPrices++;
            if (item.preco_atual) {
              totalSavings += (item.preco_atual - item.preco_unitario) * item.quantidade;
            }
            break;
          case 'Higher':
            higherPrices++;
            totalExtraCost += (item.preco_unitario - (item.preco_atual || 0)) * item.quantidade;
            break;
          case 'Equal':
            equalPrices++;
            break;
          case 'NoHistory':
            noHistory++;
            break;
        }
      }

      return {
        items: processedItems,
        summary: {
          total_items: processedItems.length,
          lower_prices: lowerPrices,
          higher_prices: higherPrices,
          equal_prices: equalPrices,
          no_history: noHistory,
          total_savings: totalSavings,
          total_extra_cost: totalExtraCost
        }
      };

    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      throw new Error(`Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Processa um item individual do CSV
   */
  private async processarItem(csvItem: CSVItem): Promise<ProcessedItem> {
    try {
      // Buscar material no banco de dados
      const material = await prisma.material.findFirst({
        where: {
          OR: [
            { codigo: csvItem.codigo },
            { nome: { contains: csvItem.nome, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!material) {
        return {
          ...csvItem,
          status: 'NoHistory'
        };
      }

      const precoAtual = material.preco || 0;
      const diferencaPercentual = precoAtual > 0 
        ? ((csvItem.preco_unitario - precoAtual) / precoAtual) * 100
        : 0;

      let status: 'Lower' | 'Higher' | 'Equal' | 'NoHistory';
      
      if (precoAtual === 0) {
        status = 'NoHistory';
      } else if (csvItem.preco_unitario < precoAtual) {
        status = 'Lower';
      } else if (csvItem.preco_unitario > precoAtual) {
        status = 'Higher';
      } else {
        status = 'Equal';
      }

      return {
        ...csvItem,
        preco_atual: precoAtual,
        diferenca_percentual: diferencaPercentual,
        status
      };

    } catch (error) {
      console.error('Erro ao processar item:', csvItem, error);
      return {
        ...csvItem,
        status: 'NoHistory'
      };
    }
  }

  /**
   * Busca histórico de preços de um material
   */
  async buscarHistoricoPrecos(codigoMaterial: string): Promise<any[]> {
    try {
      const material = await prisma.material.findFirst({
        where: { codigo: codigoMaterial },
        include: {
          movimentacoesEstoque: {
            where: { tipo: 'ENTRADA' },
            orderBy: { data: 'desc' },
            take: 10
          }
        }
      });

      if (!material) {
        return [];
      }

      return material.movimentacoesEstoque.map(mov => ({
        data: mov.data,
        preco_unitario: mov.precoUnitario,
        quantidade: mov.quantidade,
        fornecedor: mov.fornecedor || 'N/A'
      }));

    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  /**
   * Atualiza preços no banco baseado na comparação
   */
  async atualizarPrecos(items: ProcessedItem[]): Promise<{ updated: number; errors: number }> {
    let updated = 0;
    let errors = 0;

    for (const item of items) {
      try {
        if (item.status === 'Lower' && item.preco_unitario > 0) {
          await prisma.material.updateMany({
            where: {
              OR: [
                { codigo: item.codigo },
                { nome: { contains: item.nome, mode: 'insensitive' } }
              ]
            },
            data: {
              preco: item.preco_unitario,
              updatedAt: new Date()
            }
          });
          updated++;
        }
      } catch (error) {
        console.error('Erro ao atualizar preço:', item.codigo, error);
        errors++;
      }
    }

    return { updated, errors };
  }
}

export default new ComparacaoPrecosService();
