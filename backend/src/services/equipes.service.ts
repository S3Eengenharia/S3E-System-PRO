import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EquipeData {
  nome: string;
  tipo: 'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO' | 'CAMPO' | 'DISTINTA';
  descricao?: string;
  ativa?: boolean;
  membrosIds?: string[]; // IDs de Pessoa
}

export interface EquipeMembro {
  id: string;
  nome: string;
  funcao: string;
  email?: string | null;
}

export interface EquipeComMembros {
  id: string;
  nome: string;
  tipo: 'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO' | 'CAMPO' | 'DISTINTA';
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
      const membrosIds = Array.isArray(data.membrosIds) ? Array.from(new Set(data.membrosIds)) : [];

      const result = await prisma.$transaction(async (tx) => {
        const equipe = await tx.equipe.create({
          data: {
            nome: data.nome,
            tipo: data.tipo,
            descricao: data.descricao || '',
            ativa: data.ativa !== false,
            membros: membrosIds
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

        if (membrosIds.length > 0) {
          await tx.pessoa.updateMany({
            where: { id: { in: membrosIds } },
            data: { disponivel: false }
          });
        }

        const pessoas = membrosIds.length
          ? await tx.pessoa.findMany({ where: { id: { in: membrosIds } } })
          : [];

        const membros: EquipeMembro[] = pessoas.map((p) => ({
          id: p.id,
          nome: p.nome,
          funcao: p.funcao as unknown as string,
          email: p.email ?? null
        }));

        return { equipe, membros };
      });

      return {
        ...result.equipe,
        membros: result.membros
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

      const allPessoaIds = Array.from(
        new Set(equipes.flatMap((e) => e.membros))
      );

      const pessoas = allPessoaIds.length
        ? await prisma.pessoa.findMany({ where: { id: { in: allPessoaIds } } })
        : [];
      const pessoaById = new Map(pessoas.map((p) => [p.id, p]));

      return equipes.map((equipe) => {
        const membros: EquipeMembro[] = equipe.membros
          .map((id) => pessoaById.get(id))
          .filter(Boolean)
          .map((p) => ({
            id: (p as any).id,
            nome: (p as any).nome,
            funcao: (p as any).funcao as unknown as string,
            email: (p as any).email ?? null
          }));
        return { ...equipe, membros };
      });

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

      const pessoas = equipe.membros.length
        ? await prisma.pessoa.findMany({ where: { id: { in: equipe.membros } } })
        : [];
      const membros: EquipeMembro[] = pessoas.map((p) => ({
        id: p.id,
        nome: p.nome,
        funcao: p.funcao as unknown as string,
        email: p.email ?? null
      }));

      return { ...equipe, membros };

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
      const current = await prisma.equipe.findUnique({ where: { id } });
      if (!current) {
        throw new Error('Equipe não encontrada');
      }

      const newMembros = Array.isArray(data.membrosIds)
        ? Array.from(new Set(data.membrosIds))
        : current.membros;

      const removed = current.membros.filter((m) => !newMembros.includes(m));
      const added = newMembros.filter((m) => !current.membros.includes(m));

      const result = await prisma.$transaction(async (tx) => {
        const equipe = await tx.equipe.update({
          where: { id },
          data: {
            nome: data.nome ?? current.nome,
            tipo: (data.tipo as any) ?? current.tipo,
            descricao: data.descricao ?? current.descricao,
            ativa: data.ativa ?? current.ativa,
            membros: newMembros,
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

        if (removed.length > 0) {
          await tx.pessoa.updateMany({ where: { id: { in: removed } }, data: { disponivel: true } });
        }
        if (added.length > 0) {
          await tx.pessoa.updateMany({ where: { id: { in: added } }, data: { disponivel: false } });
        }

        const pessoas = newMembros.length
          ? await tx.pessoa.findMany({ where: { id: { in: newMembros } } })
          : [];
        const membros: EquipeMembro[] = pessoas.map((p) => ({
          id: p.id,
          nome: p.nome,
          funcao: p.funcao as unknown as string,
          email: p.email ?? null
        }));

        return { equipe, membros };
      });

      return { ...result.equipe, membros: result.membros };

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

      await prisma.$transaction(async (tx) => {
        const equipe = await tx.equipe.findUnique({ where: { id } });
        if (!equipe) {
          throw new Error('Equipe não encontrada');
        }

        if (equipe.membros.length > 0) {
          await tx.pessoa.updateMany({
            where: { id: { in: equipe.membros } },
            data: { disponivel: true }
          });
        }

        await tx.equipe.update({
          where: { id },
          data: { ativa: false, updatedAt: new Date() }
        });
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
  async adicionarMembro(equipeId: string, pessoaId: string): Promise<boolean> {
    try {
      const equipe = await prisma.equipe.findUnique({ where: { id: equipeId } });
      if (!equipe || !equipe.ativa) {
        throw new Error('Equipe não encontrada ou inativa');
      }

      if (equipe.membros.includes(pessoaId)) {
        return true;
      }

      await prisma.$transaction(async (tx) => {
        await tx.equipe.update({
          where: { id: equipeId },
          data: { membros: [...equipe.membros, pessoaId], updatedAt: new Date() }
        });
        await tx.pessoa.update({ where: { id: pessoaId }, data: { disponivel: false } });
      });

      return true;

    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      throw error;
    }
  }

  /**
   * Remover membro da equipe
   */
  async removerMembro(equipeId: string, pessoaId: string): Promise<boolean> {
    try {
      const equipe = await prisma.equipe.findUnique({ where: { id: equipeId } });
      if (!equipe) {
        throw new Error('Equipe não encontrada');
      }

      if (!equipe.membros.includes(pessoaId)) {
        return true;
      }

      await prisma.$transaction(async (tx) => {
        await tx.equipe.update({
          where: { id: equipeId },
          data: { membros: equipe.membros.filter((m) => m !== pessoaId), updatedAt: new Date() }
        });
        await tx.pessoa.update({ where: { id: pessoaId }, data: { disponivel: true } });
      });

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

      const allPessoaIds = Array.from(new Set(equipes.flatMap((e) => e.membros)));
      const pessoas = allPessoaIds.length
        ? await prisma.pessoa.findMany({ where: { id: { in: allPessoaIds } } })
        : [];
      const pessoaById = new Map(pessoas.map((p) => [p.id, p]));

      return equipes.map((equipe) => {
        const membros: EquipeMembro[] = equipe.membros
          .map((id) => pessoaById.get(id))
          .filter(Boolean)
          .map((p) => ({
            id: (p as any).id,
            nome: (p as any).nome,
            funcao: (p as any).funcao as unknown as string,
            email: (p as any).email ?? null
          }));
        return { ...equipe, membros };
      });

    } catch (error) {
      console.error('Erro ao buscar equipes disponíveis:', error);
      throw new Error('Erro ao buscar equipes disponíveis');
    }
  }

  // Removido mock: agora os membros vêm de Pessoa

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
