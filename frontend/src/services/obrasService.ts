import { axiosApiService } from './axiosApi';

export interface Obra {
  id: string;
  projetoId: string;
  nomeObra: string;
  status: 'BACKLOG' | 'A_FAZER' | 'ANDAMENTO' | 'CONCLUIDO';
  clienteNome: string;
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

