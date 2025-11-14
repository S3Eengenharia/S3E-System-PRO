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
  fonteDados?: 'ESTOQUE' | 'COTACOES';
  temItensCotacao?: boolean;
}

export class QuadrosService {
  static async criarQuadro(nome: string, descricao: string, config: QuadroConfig) {
    try {
      // Buscar materiais da configuração
      const materiais = await this.buscarMateriaisConfig(config);
      
      // Validar estoque e identificar itens faltantes
      const validacao = await this.validarEstoque(config, materiais);
      
      // Calcular preço total baseado nos materiais
      const precoTotal = this.calcularPrecoTotal(materiais, config);
      
      // Montar itens do kit (apenas os que NÃO são de cotações)
      const itensKit = this.montarItensKit(config);
      
      // Determinar status do estoque
      const statusEstoque = validacao.itensFaltantes.length > 0 
        ? 'PENDENTE' 
        : 'COMPLETO';
      
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
          temItensCotacao: config.temItensCotacao || false,
          itensFaltantes: validacao.itensFaltantes.length > 0 
            ? JSON.parse(JSON.stringify(validacao.itensFaltantes)) 
            : null,
          statusEstoque,
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
      
      console.log(`✅ Quadro criado - Status: ${statusEstoque}, Itens faltantes: ${validacao.itensFaltantes.length}`);
      return kit;
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      throw error;
    }
  }

  // Validar estoque dos materiais do quadro
  private static async validarEstoque(config: QuadroConfig, materiais: any[]) {
    const itensFaltantes: any[] = [];
    
    // Se for do banco frio, todos os itens estão "faltantes"
    if (config.fonteDados === 'COTACOES' || config.temItensCotacao) {
      // Extrair todos os IDs e quantidades
      const todosItens = this.extrairTodosItens(config);
      
      todosItens.forEach(item => {
        // Itens de cotação começam com 'cotacao_'
        if (item.materialId.startsWith('cotacao_')) {
          const material = materiais.find(m => m.id === item.materialId);
          if (material) {
            itensFaltantes.push({
              materialId: item.materialId,
              quantidade: item.quantidade,
              nome: material.nome || material.descricao,
              tipo: 'COTACAO'
            });
          }
        }
      });
      
      return { itensFaltantes, statusEstoque: 'PENDENTE' };
    }
    
    // Se for do estoque, validar disponibilidade
    const todosItens = this.extrairTodosItens(config);
    
    for (const item of todosItens) {
      const material = materiais.find(m => m.id === item.materialId);
      if (material && material.estoque < item.quantidade) {
        itensFaltantes.push({
          materialId: item.materialId,
          quantidade: item.quantidade,
          quantidadeFaltante: item.quantidade - material.estoque,
          nome: material.nome || material.descricao,
          tipo: 'ESTOQUE_INSUFICIENTE'
        });
      }
    }
    
    return { itensFaltantes, statusEstoque: itensFaltantes.length > 0 ? 'PENDENTE' : 'COMPLETO' };
  }

  // Extrair todos os itens da configuração
  private static extrairTodosItens(config: QuadroConfig) {
    const itens: { materialId: string; quantidade: number }[] = [];
    
    // Caixas
    config.caixas.forEach(c => itens.push({ materialId: c.materialId, quantidade: c.quantidade }));
    
    // Disjuntor Geral
    if (config.disjuntorGeral) {
      itens.push({ materialId: config.disjuntorGeral.materialId, quantidade: config.disjuntorGeral.quantidade });
    }
    
    // Barramento
    if (config.barramento) {
      itens.push({ materialId: config.barramento.materialId, quantidade: config.barramento.quantidade });
    }
    
    // Medidores
    config.medidores.forEach(m => {
      itens.push({ materialId: m.disjuntorId, quantidade: m.quantidade });
      if (m.medidorId) {
        itens.push({ materialId: m.medidorId, quantidade: m.quantidade });
      }
    });
    
    // Cabos
    config.cabos.forEach(c => {
      const qty = c.unidade === 'CM' ? c.quantidade / 100 : c.quantidade;
      itens.push({ materialId: c.materialId, quantidade: qty });
    });
    
    // DPS
    if (config.dps) {
      config.dps.items.forEach(d => itens.push({ materialId: d.materialId, quantidade: d.quantidade }));
    }
    
    // Born
    if (config.born) {
      config.born.forEach(b => itens.push({ materialId: b.materialId, quantidade: b.quantidade }));
    }
    
    // Parafusos
    if (config.parafusos) {
      config.parafusos.forEach(p => itens.push({ materialId: p.materialId, quantidade: p.quantidade }));
    }
    
    // Trilhos
    if (config.trilhos) {
      config.trilhos.forEach(t => {
        const qty = t.unidade === 'CM' ? t.quantidade / 100 : t.quantidade;
        itens.push({ materialId: t.materialId, quantidade: qty });
      });
    }
    
    // Componentes
    config.componentes.forEach(c => itens.push({ materialId: c.materialId, quantidade: c.quantidade }));
    
    return itens;
  }

  // Revalidar estoque de um quadro (chamado após entrada de materiais)
  static async revalidarEstoque(kitId: string) {
    try {
      const kit = await prisma.kit.findUnique({
        where: { id: kitId },
        include: { items: { include: { material: true } } }
      });
      
      if (!kit || kit.tipo !== 'quadro-eletrico') {
        return { success: false, message: 'Quadro não encontrado' };
      }
      
      // Extrair configuração
      const metadata = JSON.parse(kit.descricao || '{}');
      const config: QuadroConfig = metadata.configuracao;
      
      if (!config) {
        return { success: false, message: 'Configuração inválida' };
      }
      
      // Buscar materiais atualizados
      const materiais = await this.buscarMateriaisConfig(config);
      
      // Revalidar estoque
      const validacao = await this.validarEstoque(config, materiais);
      
      // Atualizar kit
      const kitAtualizado = await prisma.kit.update({
        where: { id: kitId },
        data: {
          itensFaltantes: validacao.itensFaltantes.length > 0 
            ? JSON.parse(JSON.stringify(validacao.itensFaltantes)) 
            : null,
          statusEstoque: validacao.statusEstoque
        }
      });
      
      console.log(`✅ Quadro ${kitId} revalidado - Status: ${validacao.statusEstoque}`);
      
      return { 
        success: true, 
        data: kitAtualizado,
        itensFaltantes: validacao.itensFaltantes,
        statusAnterior: kit.statusEstoque,
        statusNovo: validacao.statusEstoque
      };
    } catch (error) {
      console.error('Erro ao revalidar estoque:', error);
      return { success: false, message: 'Erro ao revalidar estoque' };
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

