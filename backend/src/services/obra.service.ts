import { PrismaClient, StatusObra } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateObraData {
  projetoId: string;
  nomeObra: string;
  dataPrevistaInicio?: Date;
  dataPrevistaFim?: Date;
}

export interface CreateTarefaData {
  descricao: string;
  atribuidoA?: string;
  dataPrevista?: Date;
}

export interface CreateRegistroAtividadeData {
  descricaoAtividade: string;
  horasTrabalhadas: number;
  observacoes?: string;
}

export interface ObraKanbanData {
  BACKLOG: any[];
  A_FAZER: any[];
  ANDAMENTO: any[];
  CONCLUIDO: any[];
}

export class ObraService {
  /**
   * Busca obra por ID do projeto
   */
  async buscarObraPorProjeto(projetoId: string) {
    try {
      const obra = await prisma.obra.findUnique({
        where: { projetoId },
        include: {
          projeto: {
            include: {
              cliente: { select: { id: true, nome: true } }
            }
          },
          tarefas: {
            include: {
              registrosAtividade: true
            }
          }
        }
      });

      return obra;
    } catch (error) {
      console.error('Erro ao buscar obra por projeto:', error);
      throw new Error('Erro ao buscar obra');
    }
  }

  /**
   * Gera uma Obra a partir de um Projeto aprovado
   */
  async gerarObraAPartirDoProjeto(projetoId: string, nomeObra?: string) {
    try {
      // Verificar se projeto existe
      const projeto = await prisma.projeto.findUnique({
        where: { id: projetoId },
        include: { cliente: true }
      });

      if (!projeto) {
        throw new Error('Projeto não encontrado');
      }

      // Verificar se já existe obra para este projeto
      const obraExistente = await prisma.obra.findUnique({
        where: { projetoId }
      });

      if (obraExistente) {
        throw new Error('Já existe uma obra para este projeto');
      }

      // Criar obra
      const obra = await prisma.obra.create({
        data: {
          projetoId,
          nomeObra: nomeObra || `Obra - ${projeto.titulo}`,
          status: 'BACKLOG',
          dataPrevistaInicio: projeto.dataInicio,
          dataPrevistaFim: projeto.dataPrevisao
        },
        include: {
          projeto: {
            include: {
              cliente: true
            }
          }
        }
      });

      // Atualizar status do projeto
      await prisma.projeto.update({
        where: { id: projetoId },
        data: { status: 'EXECUCAO' }
      });

      console.log('✅ Obra criada com sucesso:', obra.id);

      return obra;
    } catch (error) {
      console.error('Erro ao gerar obra:', error);
      throw error;
    }
  }

  /**
   * Cria uma Obra de Manutenção (sem projeto vinculado)
   */
  async criarObraManutencao(data: {
    clienteId: string;
    nomeObra: string;
    descricao?: string;
    endereco?: string;
    dataPrevistaInicio?: Date;
    dataPrevistaFim?: Date;
  }) {
    try {
      console.log('🔧 Criando obra de manutenção:', data);

      // Verificar se cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: data.clienteId }
      });

      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      // Criar obra sem projeto
      const obra = await prisma.obra.create({
        data: {
          projetoId: null, // ✅ Obra de manutenção não tem projeto
          clienteId: data.clienteId, // ✅ Cliente direto
          nomeObra: data.nomeObra,
          descricao: data.descricao || null,
          endereco: data.endereco || null,
          status: 'BACKLOG', // ✅ Inicia no Backlog
          dataPrevistaInicio: data.dataPrevistaInicio || new Date(),
          dataPrevistaFim: data.dataPrevistaFim || null,
          tipoObra: 'MANUTENCAO' // ✅ Marcador de tipo
        },
        include: {
          projeto: {
            include: {
              cliente: true
            }
          },
          cliente: true // ✅ Incluir cliente direto
        }
      });

      console.log('✅ Obra de manutenção criada:', obra.id);

      return obra;
    } catch (error) {
      console.error('Erro ao criar obra de manutenção:', error);
      throw error;
    }
  }

  /**
   * Lista todas as obras agrupadas por status (Kanban)
   */
  async getObrasKanban(): Promise<ObraKanbanData> {
    try {
      const obras = await prisma.obra.findMany({
        include: {
          projeto: {
            include: {
              cliente: { select: { id: true, nome: true } }
            }
          },
          cliente: { select: { id: true, nome: true } }, // ✅ Cliente direto (manutenção)
          tarefas: {
            include: {
              registrosAtividade: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`📦 Total de obras encontradas: ${obras.length}`);

      // Agrupar por status
      const kanbanData: ObraKanbanData = {
        BACKLOG: [],
        A_FAZER: [],
        ANDAMENTO: [],
        CONCLUIDO: []
      };

      obras.forEach(obra => {
        // ✅ Cliente pode vir de 2 fontes: projeto.cliente OU cliente direto (manutenção)
        const clienteNome = obra.projeto?.cliente?.nome || obra.cliente?.nome || 'Cliente não informado';
        
        const obraFormatada = {
          id: obra.id,
          projetoId: obra.projetoId,
          nomeObra: obra.nomeObra,
          status: obra.status,
          clienteNome, // ✅ Agora funciona para ambos os tipos
          tipoObra: (obra as any).tipoObra || 'PROJETO', // ✅ Identificar tipo
          dataPrevistaFim: obra.dataPrevistaFim,
          totalTarefas: obra.tarefas.length,
          tarefasConcluidas: obra.tarefas.filter(t => t.progresso === 100).length,
          progresso: obra.tarefas.length > 0 
            ? Math.round(obra.tarefas.reduce((sum, t) => sum + t.progresso, 0) / obra.tarefas.length)
            : 0,
          observacoes: obra.observacoes
        };

        console.log(`📋 Obra: ${obra.nomeObra} → ${obra.status} (Cliente: ${clienteNome})`);
        kanbanData[obra.status].push(obraFormatada);
      });

      console.log(`✅ Kanban organizado:`, {
        BACKLOG: kanbanData.BACKLOG.length,
        A_FAZER: kanbanData.A_FAZER.length,
        ANDAMENTO: kanbanData.ANDAMENTO.length,
        CONCLUIDO: kanbanData.CONCLUIDO.length
      });

      return kanbanData;
    } catch (error) {
      console.error('Erro ao buscar obras kanban:', error);
      throw new Error('Erro ao buscar obras para kanban');
    }
  }

  /**
   * Atualiza o status de uma obra (move no Kanban)
   */
  async updateObraStatus(obraId: string, newStatus: StatusObra) {
    try {
      const obra = await prisma.obra.update({
        where: { id: obraId },
        data: { 
          status: newStatus,
          updatedAt: new Date(),
          // Registrar data de início real quando mudar para ANDAMENTO
          dataInicioReal: newStatus === 'ANDAMENTO' ? new Date() : undefined,
          // Registrar data de fim real quando mudar para CONCLUIDO
          dataFimReal: newStatus === 'CONCLUIDO' ? new Date() : undefined
        },
        include: {
          projeto: {
            include: {
              cliente: true
            }
          }
        }
      });

      // Se concluiu a obra, atualizar status do projeto também (se houver projeto)
      if (newStatus === 'CONCLUIDO' && obra.projetoId) {
        await prisma.projeto.update({
          where: { id: obra.projetoId },
          data: { 
            status: 'CONCLUIDO',
            dataFim: new Date()
          }
        });
        console.log(`✅ Projeto ${obra.projetoId} marcado como CONCLUIDO`);
      } else if (newStatus === 'CONCLUIDO' && !obra.projetoId) {
        console.log(`✅ Obra de manutenção concluída (sem projeto vinculado)`);
      }

      return obra;
    } catch (error) {
      console.error('Erro ao atualizar status da obra:', error);
      throw error;
    }
  }

  /**
   * Busca detalhes de uma tarefa
   */
  async getTarefa(tarefaId: string) {
    try {
      const tarefa = await prisma.tarefaObra.findUnique({
        where: { id: tarefaId },
        include: {
          obra: {
            include: {
              projeto: {
                include: {
                  cliente: true
                }
              }
            }
          },
          registrosAtividade: {
            orderBy: { dataRegistro: 'desc' }
          }
        }
      });

      if (!tarefa) {
        throw new Error('Tarefa não encontrada');
      }

      return tarefa;
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      throw error;
    }
  }

  /**
   * Adiciona um registro de atividade em uma tarefa
   */
  async addRegistroAtividade(tarefaId: string, data: CreateRegistroAtividadeData) {
    try {
      const registro = await prisma.registroAtividade.create({
        data: {
          tarefaId,
          descricaoAtividade: data.descricaoAtividade,
          horasTrabalhadas: data.horasTrabalhadas,
          observacoes: data.observacoes
        }
      });

      return registro;
    } catch (error) {
      console.error('Erro ao adicionar registro de atividade:', error);
      throw new Error('Erro ao adicionar registro de atividade');
    }
  }

  /**
   * Cria uma nova tarefa em uma obra
   */
  async criarTarefa(obraId: string, data: CreateTarefaData) {
    try {
      const tarefa = await prisma.tarefaObra.create({
        data: {
          obraId,
          descricao: data.descricao,
          atribuidoA: data.atribuidoA,
          dataPrevista: data.dataPrevista
        }
      });

      return tarefa;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw new Error('Erro ao criar tarefa');
    }
  }

  /**
   * Atualiza progresso de uma tarefa
   */
  async atualizarProgressoTarefa(tarefaId: string, progresso: number) {
    try {
      const tarefa = await prisma.tarefaObra.update({
        where: { id: tarefaId },
        data: { 
          progresso: Math.min(100, Math.max(0, progresso)),
          dataConclusaoReal: progresso === 100 ? new Date() : null
        }
      });

      return tarefa;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  /**
   * Busca alocação de equipes (para visualização de calendário)
   */
  async getAlocacaoEquipes(dataInicio?: Date, dataFim?: Date) {
    try {
      const where: any = {};

      if (dataInicio || dataFim) {
        where.OR = [
          {
            dataInicio: {
              gte: dataInicio,
              lte: dataFim
            }
          },
          {
            dataFimPrevisto: {
              gte: dataInicio,
              lte: dataFim
            }
          }
        ];
      }

      const alocacoes = await prisma.alocacaoObra.findMany({
        where,
        include: {
          equipe: true,
          projeto: {
            include: {
              cliente: { select: { nome: true } }
            }
          }
        },
        orderBy: { dataInicio: 'asc' }
      });

      return alocacoes;
    } catch (error) {
      console.error('Erro ao buscar alocações:', error);
      throw new Error('Erro ao buscar alocações de equipes');
    }
  }
}

export default new ObraService();

