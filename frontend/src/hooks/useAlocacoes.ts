import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Tipos
export interface Equipe {
  id: string;
  nome: string;
  tipo: 'MONTAGEM' | 'CAMPO' | 'DISTINTA';
  membros: string[];
  ativa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Projeto {
  id: string;
  titulo: string;
  cliente: {
    nome: string;
  };
}

export interface AlocacaoCalendario {
  id: string;
  equipe: {
    id: string;
    nome: string;
    tipo: 'MONTAGEM' | 'CAMPO' | 'DISTINTA';
  };
  projeto: {
    id: string;
    titulo: string;
    cliente: string;
  };
  dataInicio: string;
  dataFimPrevisto: string;
  dataFimReal?: string;
  status: 'Planejada' | 'EmAndamento' | 'Concluida' | 'Cancelada';
  observacoes?: string;
}

export interface NovaAlocacao {
  equipeId: string;
  projetoId: string;
  dataInicio: string;
  duracaoDias: number;
  observacoes?: string;
}

export interface Estatisticas {
  totalEquipes: number;
  equipesOcupadas: number;
  equipesDisponiveis: number;
  alocacoesAtivas: number;
  alocacoesConcluidas: number;
}

const API_BASE_URL = '/api';

/**
 * Hook personalizado para gerenciar alocações de equipes
 */
export const useAlocacoes = () => {
  const { token } = useContext(AuthContext)!;
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [alocacoes, setAlocacoes] = useState<AlocacaoCalendario[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Headers de autenticação
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  /**
   * Buscar todas as equipes
   */
  const fetchEquipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/obras/equipes`;
      console.log('🔍 Buscando equipes:', url);
      
      const response = await fetch(url, {
        headers: getHeaders()
      });

      if (!response.ok) {
        // Verificar se a resposta é JSON antes de tentar parsear
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setEquipes(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar equipes:', err);
      setEquipes([]); // Fallback para array vazio
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Buscar alocações do calendário
   */
  const fetchAlocacoesCalendario = useCallback(async (mes: number, ano: number) => {
    // Validação de parâmetros obrigatórios
    if (!mes || !ano || mes < 1 || mes > 12 || ano < 2020 || ano > 2030) {
      console.warn('Parâmetros inválidos para buscar alocações:', { mes, ano });
      setAlocacoes([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/obras/alocacoes/calendario?mes=${mes}&ano=${ano}`;
      console.log('🔍 Buscando alocações:', url);
      
      const response = await fetch(url, {
        headers: getHeaders()
      });

      if (!response.ok) {
        // Verificar se a resposta é JSON antes de tentar parsear
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setAlocacoes(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar alocações:', err);
      setAlocacoes([]); // Fallback para array vazio
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Buscar estatísticas
   */
  const fetchEstatisticas = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/obras/estatisticas`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      const data = await response.json();
      setEstatisticas(data.data || null);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, [getHeaders]);

  /**
   * Buscar equipes disponíveis em um período
   */
  const fetchEquipesDisponiveis = useCallback(async (dataInicio: string, dataFim: string): Promise<Equipe[]> => {
    // Validação de parâmetros obrigatórios
    if (!dataInicio || !dataFim) {
      console.warn('Parâmetros de data obrigatórios não fornecidos');
      return [];
    }

    // Validar formato de data
    const inicioDate = new Date(dataInicio);
    const fimDate = new Date(dataFim);
    
    if (isNaN(inicioDate.getTime()) || isNaN(fimDate.getTime())) {
      console.warn('Formato de data inválido:', { dataInicio, dataFim });
      return [];
    }

    if (inicioDate > fimDate) {
      console.warn('Data de início não pode ser posterior à data de fim');
      return [];
    }

    try {
      const url = `${API_BASE_URL}/obras/equipes/disponiveis?dataInicio=${dataInicio}&dataFim=${dataFim}`;
      console.log('🔍 Buscando equipes disponíveis:', url);
      
      const response = await fetch(url, { headers: getHeaders() });

      if (!response.ok) {
        // Verificar se a resposta é JSON antes de tentar parsear
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error('Erro ao buscar equipes disponíveis:', err);
      return []; // Fallback para array vazio
    }
  }, [getHeaders]);

  /**
   * Criar nova alocação
   */
  const criarAlocacao = useCallback(async (novaAlocacao: NovaAlocacao) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/obras/alocar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(novaAlocacao)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar alocação');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Iniciar alocação
   */
  const iniciarAlocacao = useCallback(async (alocacaoId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/obras/alocacoes/${alocacaoId}/iniciar`, {
        method: 'PUT',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar alocação');
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: message };
    }
  }, [getHeaders]);

  /**
   * Concluir alocação
   */
  const concluirAlocacao = useCallback(async (alocacaoId: string, dataFimReal?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/obras/alocacoes/${alocacaoId}/concluir`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ dataFimReal })
      });

      if (!response.ok) {
        throw new Error('Erro ao concluir alocação');
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: message };
    }
  }, [getHeaders]);

  /**
   * Cancelar alocação
   */
  const cancelarAlocacao = useCallback(async (alocacaoId: string, motivo?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/obras/alocacoes/${alocacaoId}/cancelar`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ motivo })
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar alocação');
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: message };
    }
  }, [getHeaders]);

  // Carregar dados iniciais
  useEffect(() => {
    if (token) {
      fetchEquipes();
      fetchEstatisticas();
      
      // Carregar alocações do mês atual
      const hoje = new Date();
      fetchAlocacoesCalendario(hoje.getMonth() + 1, hoje.getFullYear());
    }
  }, [token, fetchEquipes, fetchEstatisticas, fetchAlocacoesCalendario]);

  return {
    equipes,
    alocacoes,
    estatisticas,
    loading,
    error,
    fetchEquipes,
    fetchAlocacoesCalendario,
    fetchEstatisticas,
    fetchEquipesDisponiveis,
    criarAlocacao,
    iniciarAlocacao,
    concluirAlocacao,
    cancelarAlocacao
  };
};

