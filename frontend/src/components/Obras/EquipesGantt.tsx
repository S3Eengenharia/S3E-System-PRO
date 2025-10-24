import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { apiService } from '../../services/api';

interface Equipe {
  id: string;
  nome: string;
  membros: string[];
  status: 'disponivel' | 'ocupada' | 'manutencao';
  proximaDisponibilidade?: string;
}

interface Alocacao {
  id: string;
  equipeId: string;
  projetoId: string;
  projetoNome: string;
  inicio: string;
  fim: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
  observacoes?: string;
}

interface EquipesGanttProps {
  onEquipeClick?: (equipe: Equipe) => void;
  onAlocacaoClick?: (alocacao: Alocacao) => void;
}

const EquipesGantt: React.FC<EquipesGanttProps> = ({ onEquipeClick, onAlocacaoClick }) => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Carregar dados das equipes
  const loadEquipes = async () => {
    try {
      console.log('🔍 Carregando equipes...');
      const response = await apiService.get<Equipe[]>('/api/obras/equipes');
      
      if (response.success && response.data) {
        console.log('✅ Equipes carregadas:', response.data.length);
        setEquipes(response.data);
      } else {
        const errorMsg = response.error || 'Erro ao carregar equipes';
        console.error('❌ Erro ao carregar equipes:', errorMsg);
        setError(errorMsg);
        setEquipes([]); // Fallback para array vazio
      }
    } catch (error) {
      console.error('❌ Erro ao carregar equipes:', error);
      setError('Erro de conexão ao carregar equipes');
      setEquipes([]); // Fallback para array vazio
    }
  };

  // Carregar dados das alocações
  const loadAlocacoes = async () => {
    try {
      console.log('🔍 Carregando alocações...');
      const response = await apiService.get<Alocacao[]>('/api/obras/alocacoes/calendario');
      
      if (response.success && response.data) {
        console.log('✅ Alocações carregadas:', response.data.length);
        setAlocacoes(response.data);
      } else {
        const errorMsg = response.error || 'Erro ao carregar alocações';
        console.error('❌ Erro ao carregar alocações:', errorMsg);
        setError(errorMsg);
        setAlocacoes([]); // Fallback para array vazio
      }
    } catch (error) {
      console.error('❌ Erro ao carregar alocações:', error);
      setError('Erro de conexão ao carregar alocações');
      setAlocacoes([]); // Fallback para array vazio
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🚀 Iniciando carregamento de dados do Gantt...');
        await Promise.all([loadEquipes(), loadAlocacoes()]);
        console.log('✅ Dados do Gantt carregados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Gantt:', error);
        setError('Erro ao carregar dados do Gantt');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Converter dados para formato do FullCalendar
  const getResources = () => {
    return equipes.map(equipe => ({
      id: equipe.id,
      title: equipe.nome,
      extendedProps: {
        status: equipe.status,
        membros: equipe.membros,
        proximaDisponibilidade: equipe.proximaDisponibilidade
      }
    }));
  };

  const getEvents = () => {
    return alocacoes.map(alocacao => ({
      id: alocacao.id,
      resourceId: alocacao.equipeId,
      title: alocacao.projetoNome,
      start: alocacao.inicio,
      end: alocacao.fim,
      backgroundColor: getStatusColor(alocacao.status),
      borderColor: getStatusColor(alocacao.status),
      extendedProps: {
        status: alocacao.status,
        observacoes: alocacao.observacoes,
        projetoId: alocacao.projetoId
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada': return '#3B82F6'; // Azul
      case 'em_andamento': return '#F59E0B'; // Amarelo
      case 'concluida': return '#10B981'; // Verde
      case 'cancelada': return '#EF4444'; // Vermelho
      default: return '#6B7280'; // Cinza
    }
  };

  const handleResourceClick = (info: any) => {
    const equipe = equipes.find(e => e.id === info.resource.id);
    if (equipe && onEquipeClick) {
      onEquipeClick(equipe);
    }
  };

  const handleEventClick = (info: any) => {
    const alocacao = alocacoes.find(a => a.id === info.event.id);
    if (alocacao && onAlocacaoClick) {
      onAlocacaoClick(alocacao);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    // Aqui você pode implementar a criação de novas alocações
    console.log('Nova alocação:', selectInfo);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
          <p className="mt-4 text-gray-600">Carregando Gantt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Timeline de Alocações</h3>
            <p className="text-sm text-gray-600">Visualização Gantt das equipes e suas alocações</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Planejada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Em Andamento</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Concluída</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Cancelada</span>
            </div>
          </div>
        </div>

        <div className="h-96">
          <FullCalendar
            ref={calendarRef}
            plugins={[resourceTimelinePlugin, interactionPlugin]}
            initialView="resourceTimelineMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
            }}
            resources={getResources()}
            events={getEvents()}
            resourceAreaWidth="200px"
            resourceLabelText="Equipes"
            resourceColumns={[
              {
                field: 'title',
                headerContent: 'Equipe'
              }
            ]}
            slotMinWidth="100"
            slotDuration="1 day"
            slotLabelInterval="1 day"
            resourceClick={handleResourceClick}
            eventClick={handleEventClick}
            selectable={true}
            selectMirror={true}
            select={handleDateSelect}
            height="100%"
            locale="pt-br"
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia'
            }}
            eventContent={(eventInfo) => {
              return (
                <div className="p-1 text-xs">
                  <div className="font-medium truncate">{eventInfo.event.title}</div>
                  <div className="text-gray-500">
                    {eventInfo.event.extendedProps.status}
                  </div>
                </div>
              );
            }}
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>💡 <strong>Dica:</strong> Clique nas equipes para ver detalhes e nas barras para editar alocações.</p>
        </div>
      </div>
    </div>
  );
};

export default EquipesGantt;
