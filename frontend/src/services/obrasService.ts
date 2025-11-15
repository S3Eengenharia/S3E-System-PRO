import { axiosApiService } from './axiosApi';

export interface Obra {
  id: string;
  projetoId: string | null; // ✅ Opcional para obras de manutenção
  nomeObra: string;
  status: 'BACKLOG' | 'A_FAZER' | 'ANDAMENTO' | 'CONCLUIDO';
  clienteNome: string;
  tipoObra?: 'PROJETO' | 'MANUTENCAO'; // ✅ Tipo da obra
  dataPrevistaFim?: string;
  totalTarefas: number;
  tarefasConcluidas: number;
  progresso: number;
  observacoes?: string;
}

export interface ObraKanbanData {
  BACKLOG: Obra[];
  A_FAZER: Obra[];
  ANDAMENTO: Obra[];
  CONCLUIDO: Obra[];
}

export interface TarefaObra {
  id: string;
  obraId: string;
  descricao: string;
  atribuidoA?: string;
  progresso: number;
  dataPrevista?: string;
  dataConclusaoReal?: string;
  observacoes?: string;
  registrosAtividade?: RegistroAtividade[];
}

export interface RegistroAtividade {
  id: string;
  tarefaId: string;
  dataRegistro: string;
  descricaoAtividade: string;
  horasTrabalhadas: number;
  observacoes?: string;
}

export interface CreateObraData {
  projetoId: string;
  nomeObra?: string;
}

export interface CreateTarefaData {
  descricao: string;
  atribuidoA?: string;
  dataPrevista?: string;
}

export interface CreateRegistroData {
  descricaoAtividade: string;
  horasTrabalhadas: number;
  observacoes?: string;
}

class ObrasService {
  /**
   * Gera uma obra a partir de um projeto
   */
  async gerarObra(data: CreateObraData) {
    return axiosApiService.post('/api/obras/gerar', data);
  }

  /**
   * Cria uma obra de manutenção (sem projeto)
   */
  async criarObraManutencao(data: {
    clienteId: string;
    nomeObra: string;
    descricao?: string;
    endereco?: string;
    dataPrevistaInicio?: string;
    dataPrevistaFim?: string;
  }) {
    return axiosApiService.post('/api/obras/manutencao', data);
  }

  /**
   * Busca obras agrupadas por status (Kanban)
   */
  async getObrasKanban() {
    return axiosApiService.get<ObraKanbanData>('/api/obras/kanban');
  }

  /**
   * Atualiza status da obra (move no Kanban)
   */
  async updateObraStatus(obraId: string, newStatus: string) {
    return axiosApiService.put(`/api/obras/${obraId}/status`, { status: newStatus });
  }

  /**
   * Inicia execução de uma obra (permite eletricistas iniciarem)
   */
  async iniciarExecucao(obraId: string) {
    return axiosApiService.put(`/api/obras/${obraId}/iniciar-execucao`);
  }

  /**
   * Busca detalhes de uma tarefa
   */
  async getTarefa(tarefaId: string) {
    return axiosApiService.get<TarefaObra>(`/api/obras/tarefas/${tarefaId}`);
  }

  /**
   * Adiciona registro de atividade em uma tarefa
   */
  async addRegistroAtividade(tarefaId: string, data: CreateRegistroData) {
    return axiosApiService.post(`/api/obras/tarefas/${tarefaId}/registro`, data);
  }

  /**
   * Cria nova tarefa em uma obra
   */
  async criarTarefa(obraId: string, data: CreateTarefaData) {
    return axiosApiService.post(`/api/obras/${obraId}/tarefas`, data);
  }

  /**
   * Atualiza progresso de uma tarefa
   */
  async atualizarProgressoTarefa(tarefaId: string, progresso: number) {
    return axiosApiService.put(`/api/obras/tarefas/${tarefaId}/progresso`, { progresso });
  }

  /**
   * Busca alocação de equipes (calendário)
   */
  async getAlocacaoEquipes(dataInicio?: string, dataFim?: string) {
    return axiosApiService.get('/api/obras/alocacao', {
      dataInicio,
      dataFim
    });
  }
}

export const obrasService = new ObrasService();

