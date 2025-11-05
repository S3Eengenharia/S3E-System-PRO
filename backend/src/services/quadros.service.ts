import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface QuadroConfig {
  tipo: 'POLICARBONATO' | 'ALUMINIO' | 'COMANDO';
  caixas: { materialId: string; quantidade: number }[];
  disjuntorGeral?: { materialId: string; quantidade: number };
  barramento?: { materialId: string; quantidade: number };
  medidores: { disjuntorId: string; medidorId?: string; quantidade: number }[];
  cabos: { materialId: string; quantidade: number; unidade: 'METROS' | 'CM' }[];
  dps?: {
    classe: 'CLASSE_1' | 'CLASSE_2';
    items: { materialId: string; quantidade: number }[];
  };
  born?: { materialId: string; quantidade: number }[];
  parafusos?: { materialId: string; quantidade: number }[];
  trilhos?: { materialId: string; quantidade: number; unidade: 'METROS' | 'CM' }[];
  componentes: { materialId: string; quantidade: number }[];
}

export class QuadrosService {
  static async criarQuadro(nome: string, descricao: string, config: QuadroConfig) {
    try {
      // Buscar materiais da configuração
      const materiais = await this.buscarMateriaisConfig(config);
      
      // Calcular preço total baseado nos materiais
      const precoTotal = this.calcularPrecoTotal(materiais, config);
      
      // Montar itens do kit
      const itensKit = this.montarItensKit(config);
      
      // Criar Kit com metadata JSON
      const kit = await prisma.kit.create({
        data: {
          nome,
          descricao: JSON.stringify({ 
            descricao_base: descricao, 
            configuracao: config 
          }),
          preco: precoTotal,
          tipo: 'quadro-eletrico',
          items: {
            create: itensKit
          }
        },
        include: { 
          items: { 
            include: { material: true } 
          } 
        }
      });
      
      return kit;
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      throw error;
    }
  }

  static async listarQuadros() {
    try {
      const quadros = await prisma.kit.findMany({
        where: { tipo: 'quadro-eletrico', ativo: true },
        include: { 
          items: { 
            include: { material: true } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return quadros;
    } catch (error) {
      console.error('Erro ao listar quadros:', error);
      throw error;
    }
  }

  private static async buscarMateriaisConfig(config: QuadroConfig) {
    const ids = this.extrairIdsConfig(config);
    return prisma.material.findMany({ 
      where: { id: { in: ids } } 
    });
  }

  private static calcularPrecoTotal(materiais: any[], config: QuadroConfig): number {
    let total = 0;
    
    // Mapa de materiais por ID para acesso rápido
    const materiaisMap = new Map(materiais.map(m => [m.id, m]));
    
    // Caixas
    config.caixas.forEach(item => {
      const material = materiaisMap.get(item.materialId);
      if (material) total += material.preco * item.quantidade;
    });
    
    // Disjuntor Geral
    if (config.disjuntorGeral) {
      const material = materiaisMap.get(config.disjuntorGeral.materialId);
      if (material) total += material.preco * config.disjuntorGeral.quantidade;
    }
    
    // Barramento
    if (config.barramento) {
      const material = materiaisMap.get(config.barramento.materialId);
      if (material) total += material.preco * config.barramento.quantidade;
    }
    
    // Medidores
    config.medidores.forEach(item => {
      const materialDisjuntor = materiaisMap.get(item.disjuntorId);
      if (materialDisjuntor) total += materialDisjuntor.preco * item.quantidade;
      
      if (item.medidorId) {
        const materialMedidor = materiaisMap.get(item.medidorId);
        if (materialMedidor) total += materialMedidor.preco * item.quantidade;
      }
    });
    
    // Cabos
    config.cabos.forEach(item => {
      const material = materiaisMap.get(item.materialId);
      if (material) {
        const qtd = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
        total += material.preco * qtd;
      }
    });
    
    // DPS
    if (config.dps) {
      config.dps.items.forEach(item => {
        const material = materiaisMap.get(item.materialId);
        if (material) total += material.preco * item.quantidade;
      });
    }
    
    // Born
    if (config.born) {
      config.born.forEach(item => {
        const material = materiaisMap.get(item.materialId);
        if (material) total += material.preco * item.quantidade;
      });
    }
    
    // Parafusos
    if (config.parafusos) {
      config.parafusos.forEach(item => {
        const material = materiaisMap.get(item.materialId);
        if (material) total += material.preco * item.quantidade;
      });
    }
    
    // Trilhos
    if (config.trilhos) {
      config.trilhos.forEach(item => {
        const material = materiaisMap.get(item.materialId);
        if (material) {
          const qtd = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
          total += material.preco * qtd;
        }
      });
    }
    
    // Componentes finais
    config.componentes.forEach(item => {
      const material = materiaisMap.get(item.materialId);
      if (material) total += material.preco * item.quantidade;
    });
    
    return total;
  }

  private static montarItensKit(config: QuadroConfig) {
    const itens: any[] = [];
    
    // Caixas
    config.caixas.forEach(item => {
      itens.push({
        materialId: item.materialId,
        quantidade: item.quantidade
      });
    });
    
    // Disjuntor Geral
    if (config.disjuntorGeral) {
      itens.push({
        materialId: config.disjuntorGeral.materialId,
        quantidade: config.disjuntorGeral.quantidade
      });
    }
    
    // Barramento
    if (config.barramento) {
      itens.push({
        materialId: config.barramento.materialId,
        quantidade: config.barramento.quantidade
      });
    }
    
    // Medidores
    config.medidores.forEach(item => {
      itens.push({
        materialId: item.disjuntorId,
        quantidade: item.quantidade
      });
      if (item.medidorId) {
        itens.push({
          materialId: item.medidorId,
          quantidade: item.quantidade
        });
      }
    });
    
    // Cabos
    config.cabos.forEach(item => {
      const qtd = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
      itens.push({
        materialId: item.materialId,
        quantidade: qtd
      });
    });
    
    // DPS
    if (config.dps) {
      config.dps.items.forEach(item => {
        itens.push({
          materialId: item.materialId,
          quantidade: item.quantidade
        });
      });
    }
    
    // Born
    if (config.born) {
      config.born.forEach(item => {
        itens.push({
          materialId: item.materialId,
          quantidade: item.quantidade
        });
      });
    }
    
    // Parafusos
    if (config.parafusos) {
      config.parafusos.forEach(item => {
        itens.push({
          materialId: item.materialId,
          quantidade: item.quantidade
        });
      });
    }
    
    // Trilhos
    if (config.trilhos) {
      config.trilhos.forEach(item => {
        const qtd = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
        itens.push({
          materialId: item.materialId,
          quantidade: qtd
        });
      });
    }
    
    // Componentes finais
    config.componentes.forEach(item => {
      itens.push({
        materialId: item.materialId,
        quantidade: item.quantidade
      });
    });
    
    return itens;
  }

  private static extrairIdsConfig(config: QuadroConfig): string[] {
    const ids: string[] = [];
    
    // Caixas
    config.caixas.forEach(item => ids.push(item.materialId));
    
    // Disjuntor Geral
    if (config.disjuntorGeral) ids.push(config.disjuntorGeral.materialId);
    
    // Barramento
    if (config.barramento) ids.push(config.barramento.materialId);
    
    // Medidores
    config.medidores.forEach(item => {
      ids.push(item.disjuntorId);
      if (item.medidorId) ids.push(item.medidorId);
    });
    
    // Cabos
    config.cabos.forEach(item => ids.push(item.materialId));
    
    // DPS
    if (config.dps) {
      config.dps.items.forEach(item => ids.push(item.materialId));
    }
    
    // Born
    if (config.born) {
      config.born.forEach(item => ids.push(item.materialId));
    }
    
    // Parafusos
    if (config.parafusos) {
      config.parafusos.forEach(item => ids.push(item.materialId));
    }
    
    // Trilhos
    if (config.trilhos) {
      config.trilhos.forEach(item => ids.push(item.materialId));
    }
    
    // Componentes
    config.componentes.forEach(item => ids.push(item.materialId));
    
    // Remover duplicatas
    return [...new Set(ids)];
  }
}

