import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EquipeData {
  nome: string;
  tipo: 'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO';
  descricao?: string;
  ativa?: boolean;
}

export interface EquipeMembro {
  id: string;
  nome: string;
  funcao: string;
  telefone?: string;
  email?: string;
}

export interface EquipeComMembros {
  id: string;
  nome: string;
  tipo: 'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO';
  descricao: string | null;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
  membros: EquipeMembro[];
  alocacoes: {
    id: string;
    obraId: string;
    dataInicio: Date;
    dataFimPrevisto: Date | null;
    status: string;
  }[];
}

export class EquipesService {
  /**
   * Criar nova equipe
   */
  async criarEquipe(data: EquipeData): Promise<EquipeComMembros> {
    try {
      const equipe = await prisma.equipe.create({
        data: {
          nome: data.nome,
          tipo: data.tipo,
          descricao: data.descricao || '',
          ativa: data.ativa !== false // Default true
        },
        include: {
          alocacoes: {
            select: {
              id: true,
              obraId: true,
              dataInicio: true,
              dataFimPrevisto: true,
              status: true
            }
          }
        }
      });

      return {
        ...equipe,
        membros: [] // Equipes começam sem membros
      };

    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      throw new Error('Erro ao criar equipe');
    }
  }

  /**
   * Listar todas as equipes
   */
  async listarEquipes(ativa?: boolean): Promise<EquipeComMembros[]> {
    try {
      const equipes = await prisma.equipe.findMany({
        where: ativa !== undefined ? { ativa } : {},
        include: {
          alocacoes: {
            select: {
              id: true,
              obraId: true,
              dataInicio: true,
              dataFimPrevisto: true,
              status: true
            }
          }
        },
        orderBy: { nome: 'asc' }
      });

      // Simular membros (em produção, viria de tabela relacionada)
      return equipes.map(equipe => ({
        ...equipe,
        membros: this.getMockMembros(equipe.id)
      }));

    } catch (error) {
      console.error('Erro ao listar equipes:', error);
      throw new Error('Erro ao listar equipes');
    }
  }

  /**
   * Buscar equipe por ID
   */
  async buscarEquipePorId(id: string): Promise<EquipeComMembros | null> {
    try {
      const equipe = await prisma.equipe.findUnique({
        where: { id },
        include: {
          alocacoes: {
            select: {
              id: true,
              obraId: true,
              dataInicio: true,
              dataFimPrevisto: true,
              status: true
            }
          }
        }
      });

      if (!equipe) {
        return null;
      }

      return {
        ...equipe,
        membros: this.getMockMembros(equipe.id)
      };

    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      throw new Error('Erro ao buscar equipe');
    }
  }

  /**
   * Atualizar equipe
   */
  async atualizarEquipe(id: string, data: Partial<EquipeData>): Promise<EquipeComMembros> {
    try {
      const equipe = await prisma.equipe.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          alocacoes: {
            select: {
              id: true,
              obraId: true,
              dataInicio: true,
              dataFimPrevisto: true,
              status: true
            }
          }
        }
      });

      return {
        ...equipe,
        membros: this.getMockMembros(equipe.id)
      };

    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      throw new Error('Erro ao atualizar equipe');
    }
  }

  /**
   * Desativar equipe (soft delete)
   */
  async desativarEquipe(id: string): Promise<boolean> {
    try {
      // Verificar se há alocações ativas
      const alocacoesAtivas = await prisma.alocacaoObra.findFirst({
        where: {
          equipeId: id,
          status: {
            in: ['ALOCADA', 'EM_ANDAMENTO']
          }
        }
      });

      if (alocacoesAtivas) {
        throw new Error('Não é possível desativar equipe com alocações ativas');
      }

      await prisma.equipe.update({
        where: { id },
        data: {
          ativa: false,
          updatedAt: new Date()
        }
      });

      return true;

    } catch (error) {
      console.error('Erro ao desativar equipe:', error);
      throw error;
    }
  }

  /**
   * Adicionar membro à equipe
   */
  async adicionarMembro(equipeId: string, membroData: Omit<EquipeMembro, 'id'>): Promise<EquipeMembro> {
    try {
      // Verificar se equipe existe e está ativa
      const equipe = await prisma.equipe.findUnique({
        where: { id: equipeId, ativa: true }
      });

      if (!equipe) {
        throw new Error('Equipe não encontrada ou inativa');
      }

      // Em produção, isso seria uma tabela separada
      const membro: EquipeMembro = {
        id: `membro_${Date.now()}`,
        ...membroData
      };

      return membro;

    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      throw error;
    }
  }

  /**
   * Remover membro da equipe
   */
  async removerMembro(equipeId: string, membroId: string): Promise<boolean> {
    try {
      // Verificar se equipe existe
      const equipe = await prisma.equipe.findUnique({
        where: { id: equipeId }
      });

      if (!equipe) {
        throw new Error('Equipe não encontrada');
      }

      // Em produção, isso seria uma operação na tabela de membros
      return true;

    } catch (error) {
      console.error('Erro ao remover membro:', error);
      throw error;
    }
  }

  /**
   * Buscar equipes disponíveis para alocação
   */
  async buscarEquipesDisponiveis(dataInicio: Date, dataFim: Date): Promise<EquipeComMembros[]> {
    try {
      const equipes = await prisma.equipe.findMany({
        where: {
          ativa: true,
          // Verificar se não há conflitos de alocação
          alocacoes: {
            none: {
              OR: [
                {
                  dataInicio: {
                    lte: dataFim
                  },
                  dataFimPrevisto: {
                    gte: dataInicio
                  }
                }
              ],
              status: {
                in: ['ALOCADA', 'EM_ANDAMENTO']
              }
            }
          }
        },
        include: {
          alocacoes: {
            select: {
              id: true,
              obraId: true,
              dataInicio: true,
              dataFimPrevisto: true,
              status: true
            }
          }
        },
        orderBy: { nome: 'asc' }
      });

      return equipes.map(equipe => ({
        ...equipe,
        membros: this.getMockMembros(equipe.id)
      }));

    } catch (error) {
      console.error('Erro ao buscar equipes disponíveis:', error);
      throw new Error('Erro ao buscar equipes disponíveis');
    }
  }

  /**
   * Mock de membros (em produção, viria do banco)
   */
  private getMockMembros(equipeId: string): EquipeMembro[] {
    const mockMembros = {
      'equipe-1': [
        { id: 'm1', nome: 'João Silva', funcao: 'Eletricista Senior', telefone: '(11) 99999-1111', email: 'joao@email.com' },
        { id: 'm2', nome: 'Maria Santos', funcao: 'Ajudante', telefone: '(11) 99999-2222', email: 'maria@email.com' }
      ],
      'equipe-2': [
        { id: 'm3', nome: 'Pedro Costa', funcao: 'Eletricista', telefone: '(11) 99999-3333', email: 'pedro@email.com' },
        { id: 'm4', nome: 'Ana Lima', funcao: 'Técnica', telefone: '(11) 99999-4444', email: 'ana@email.com' }
      ],
      'equipe-3': [
        { id: 'm5', nome: 'Carlos Oliveira', funcao: 'Supervisor', telefone: '(11) 99999-5555', email: 'carlos@email.com' }
      ]
    };

    return mockMembros[equipeId as keyof typeof mockMembros] || [];
  }

  /**
   * Estatísticas das equipes
   */
  async getEstatisticasEquipes(): Promise<{
    total: number;
    ativas: number;
    inativas: number;
    alocadas: number;
    disponiveis: number;
  }> {
    try {
      const [total, ativas, alocadas] = await Promise.all([
        prisma.equipe.count(),
        prisma.equipe.count({ where: { ativa: true } }),
        prisma.equipe.count({
          where: {
            ativa: true,
            alocacoes: {
              some: {
                status: {
                  in: ['ALOCADA', 'EM_ANDAMENTO']
                }
              }
            }
          }
        })
      ]);

      return {
        total,
        ativas,
        inativas: total - ativas,
        alocadas,
        disponiveis: ativas - alocadas
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas');
    }
  }
}

export default new EquipesService();
