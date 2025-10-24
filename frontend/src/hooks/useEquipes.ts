import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface EquipeMembro {
  id: string;
  nome: string;
  funcao: string;
  telefone?: string;
  email?: string;
}

export interface Equipe {
  id: string;
  nome: string;
  tipo: 'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO';
  descricao: string | null;
  ativa: boolean;
  createdAt: string;
  updatedAt: string;
  membros: EquipeMembro[];
  alocacoes: {
    id: string;
    obraId: string;
    dataInicio: string;
    dataFimPrevisto: string | null;
    status: string;
  }[];
}

export interface EstatisticasEquipes {
  total: number;
  ativas: number;
  inativas: number;
  alocadas: number;
  disponiveis: number;
}

export interface EquipeData {
  nome: string;
  tipo: 'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO';
  descricao?: string;
  ativa?: boolean;
}

export const useEquipes = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasEquipes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const baseUrl = '/api/equipes';

  // Fetch equipes
  const fetchEquipes = async (ativa?: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = ativa !== undefined ? `${baseUrl}?ativa=${ativa}` : baseUrl;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar equipes');
      }

      const result = await response.json();
      
      if (result.success) {
        setEquipes(result.data);
      } else {
        throw new Error(result.message || 'Erro ao buscar equipes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar equipes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch estatísticas
  const fetchEstatisticas = async () => {
    try {
      const response = await fetch(`${baseUrl}/estatisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      const result = await response.json();
      
      if (result.success) {
        setEstatisticas(result.data);
      } else {
        throw new Error(result.message || 'Erro ao buscar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  // Criar equipe
  const criarEquipe = async (data: EquipeData): Promise<Equipe | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar equipe');
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchEquipes(); // Recarregar lista
        return result.data;
      } else {
        throw new Error(result.message || 'Erro ao criar equipe');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao criar equipe:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar equipe
  const atualizarEquipe = async (id: string, data: Partial<EquipeData>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar equipe');
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchEquipes(); // Recarregar lista
        return true;
      } else {
        throw new Error(result.message || 'Erro ao atualizar equipe');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao atualizar equipe:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Desativar equipe
  const desativarEquipe = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao desativar equipe');
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchEquipes(); // Recarregar lista
        return true;
      } else {
        throw new Error(result.message || 'Erro ao desativar equipe');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao desativar equipe:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Adicionar membro
  const adicionarMembro = async (equipeId: string, membroData: Omit<EquipeMembro, 'id'>): Promise<EquipeMembro | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/${equipeId}/membros`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(membroData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar membro');
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchEquipes(); // Recarregar lista
        return result.data;
      } else {
        throw new Error(result.message || 'Erro ao adicionar membro');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao adicionar membro:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remover membro
  const removerMembro = async (equipeId: string, membroId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/${equipeId}/membros/${membroId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover membro');
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchEquipes(); // Recarregar lista
        return true;
      } else {
        throw new Error(result.message || 'Erro ao remover membro');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao remover membro:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar equipes disponíveis
  const buscarEquipesDisponiveis = async (dataInicio: string, dataFim: string): Promise<Equipe[]> => {
    try {
      const response = await fetch(`${baseUrl}/disponiveis?dataInicio=${dataInicio}&dataFim=${dataFim}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar equipes disponíveis');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Erro ao buscar equipes disponíveis');
      }
    } catch (err) {
      console.error('Erro ao buscar equipes disponíveis:', err);
      return [];
    }
  };

  // Buscar equipe por ID
  const buscarEquipePorId = async (id: string): Promise<Equipe | null> => {
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar equipe');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Erro ao buscar equipe');
      }
    } catch (err) {
      console.error('Erro ao buscar equipe:', err);
      return null;
    }
  };

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchEquipes();
      fetchEstatisticas();
    }
  }, [token]);

  return {
    equipes,
    estatisticas,
    loading,
    error,
    fetchEquipes,
    fetchEstatisticas,
    criarEquipe,
    atualizarEquipe,
    desativarEquipe,
    adicionarMembro,
    removerMembro,
    buscarEquipesDisponiveis,
    buscarEquipePorId
  };
};
