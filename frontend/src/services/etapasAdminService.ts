import { axiosApiService } from './axiosApi';

export interface EtapaAdmin {
  id: string;
  projetoId: string;
  tipo: string;
  nome: string;
  ordem: number;
  concluida: boolean;
  dataInicio?: string;
  dataPrevista: string;
  dataConclusao?: string;
  observacoes?: string;
  motivoExtensao?: string;
  atrasada: boolean;
  horasRestantes: number;
  percentualProgresso: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumoEtapas {
  total: number;
  concluidas: number;
  pendentes: number;
  atrasadas: number;
  noPrazo: number;
  progresso: number;
}

export interface ListaEtapasResponse {
  etapas: EtapaAdmin[];
  resumo: ResumoEtapas;
}

class EtapasAdminService {
  /**
   * Inicializar etapas admin para um projeto
   */
  async inicializar(projetoId: string) {
    return axiosApiService.post<EtapaAdmin[]>(
      `/api/projetos/etapas-admin/${projetoId}/inicializar`
    );
  }

  /**
   * Listar etapas admin de um projeto
   */
  async listar(projetoId: string) {
    return axiosApiService.get<ListaEtapasResponse>(
      `/api/projetos/etapas-admin/${projetoId}`
    );
  }

  /**
   * Obter estatísticas das etapas
   */
  async getEstatisticas(projetoId: string) {
    return axiosApiService.get<any>(
      `/api/projetos/etapas-admin/${projetoId}/estatisticas`
    );
  }

  /**
   * Concluir uma etapa
   */
  async concluir(projetoId: string, etapaId: string, observacoes?: string) {
    return axiosApiService.put<EtapaAdmin>(
      `/api/projetos/etapas-admin/${projetoId}/${etapaId}/concluir`,
      { observacoes }
    );
  }

  /**
   * Estender prazo de uma etapa
   */
  async estenderPrazo(projetoId: string, etapaId: string, novaData: string, motivo: string) {
    return axiosApiService.put<EtapaAdmin>(
      `/api/projetos/etapas-admin/${projetoId}/${etapaId}/estender-prazo`,
      { novaData, motivo }
    );
  }

  /**
   * Reabrir uma etapa concluída
   */
  async reabrir(projetoId: string, etapaId: string) {
    return axiosApiService.put<EtapaAdmin>(
      `/api/projetos/etapas-admin/${projetoId}/${etapaId}/reabrir`
    );
  }

  /**
   * Criar uma nova etapa personalizada
   */
  async criar(projetoId: string, data: { nome: string; dataPrevista: string; tipo: string }) {
    return axiosApiService.post<EtapaAdmin>(
      `/api/projetos/etapas-admin/${projetoId}/criar`,
      data
    );
  }

  /**
   * Atualizar uma etapa
   */
  async atualizar(projetoId: string, etapaId: string, data: { nome?: string; dataPrevista?: string }) {
    return axiosApiService.put<EtapaAdmin>(
      `/api/projetos/etapas-admin/${projetoId}/${etapaId}`,
      data
    );
  }

  /**
   * Excluir uma etapa
   */
  async excluir(projetoId: string, etapaId: string) {
    return axiosApiService.delete<void>(
      `/api/projetos/etapas-admin/${projetoId}/${etapaId}`
    );
  }
}

export const etapasAdminService = new EtapasAdminService();

