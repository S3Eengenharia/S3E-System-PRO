import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { axiosApiService } from '../../services/axiosApi';
import { ENDPOINTS } from '../../config/api';

// Icons
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
    </svg>
);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

interface Equipe {
  id: string;
  nome: string;
  membros: string[];
  tipo: string;
  especialidades: string[];
  status: 'ativo' | 'inativo';
}

interface Alocacao {
  id: string;
  equipeId: string;
  obraId: string;
  dataInicio: string;
  dataFim: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
  progresso: number;
  observacoes?: string;
}

interface Obra {
  id: string;
  nome: string;
  cliente: string;
  endereco: string;
  dataInicio: string;
  dataFim: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
  progresso: number;
}

const EquipesGantt: React.FC = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Carregar dados das equipes
  const loadEquipes = async () => {
    try {
      console.log('🔍 Carregando equipes...');
      const response = await axiosApiService.get<Equipe[]>(ENDPOINTS.OBRAS.EQUIPES);
      
      console.log('📊 Resposta da API - Equipes:', response);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ Equipes carregadas:', response.data.length);
        setEquipes(response.data);
      } else {
        console.warn('⚠️ Dados de equipes inválidos ou vazios:', response);
        setEquipes([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar equipes:', error);
      setError('Erro de conexão ao carregar equipes');
      setEquipes([]);
    }
  };

  // Carregar dados das alocações
  const loadAlocacoes = async () => {
    try {
      console.log('🔍 Carregando alocações...');
      
      // Obter mês e ano atual
      const now = new Date();
      const mes = now.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
      const ano = now.getFullYear();
      
      console.log(`📅 Carregando alocações para mês ${mes} e ano ${ano}`);
      
      const response = await axiosApiService.get<Alocacao[]>(`${ENDPOINTS.OBRAS.ALOCACOES}/calendario?mes=${mes}&ano=${ano}`);
      
      console.log('📊 Resposta da API - Alocações:', response);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ Alocações carregadas:', response.data.length);
        setAlocacoes(response.data);
      } else {
        console.warn('⚠️ Dados de alocações inválidos ou vazios:', response);
        setAlocacoes([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar alocações:', error);
      setError('Erro de conexão ao carregar alocações');
      setAlocacoes([]);
    }
  };

  // Carregar dados das obras (mock para demonstração)
  const loadObras = async () => {
    try {
      // Mock de obras para demonstração
      const mockObras: Obra[] = [
        {
          id: '1',
          nome: 'Instalação Elétrica Residencial',
          cliente: 'João Silva',
          endereco: 'Rua das Flores, 123',
          dataInicio: '2025-01-15',
          dataFim: '2025-02-15',
          status: 'em_andamento',
          progresso: 65
        },
        {
          id: '2',
          nome: 'Reforma Hidráulica Comercial',
          cliente: 'Maria Santos',
          endereco: 'Av. Principal, 456',
          dataInicio: '2025-01-20',
          dataFim: '2025-03-20',
          status: 'planejada',
          progresso: 0
        }
      ];
      
      setObras(mockObras);
    } catch (error) {
      console.error('❌ Erro ao carregar obras:', error);
      setObras([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🚀 Iniciando carregamento de dados do Gantt...');
        await Promise.all([loadEquipes(), loadAlocacoes(), loadObras()]);
        console.log('✅ Dados do Gantt carregados com sucesso');
      } catch (error) {
        console.error('❌ Erro geral ao carregar dados:', error);
        setError('Erro ao carregar dados do sistema');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Preparar dados para o FullCalendar
  const calendarResources = equipes.map(equipe => ({
    id: equipe.id,
    title: equipe.nome,
    extendedProps: {
      tipo: equipe.tipo,
      membros: equipe.membros,
      especialidades: equipe.especialidades,
      status: equipe.status
    }
  }));

  const calendarEvents = alocacoes.map(alocacao => {
    const obra = obras.find(o => o.id === alocacao.obraId);
    return {
      id: alocacao.id,
      resourceId: alocacao.equipeId,
      title: obra ? obra.nome : `Obra ${alocacao.obraId}`,
      start: alocacao.dataInicio,
      end: alocacao.dataFim,
      backgroundColor: getStatusColor(alocacao.status),
      borderColor: getStatusColor(alocacao.status),
      extendedProps: {
        status: alocacao.status,
        progresso: alocacao.progresso,
        observacoes: alocacao.observacoes,
        obra: obra
      }
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada': return '#3B82F6'; // blue
      case 'em_andamento': return '#F59E0B'; // yellow
      case 'concluida': return '#10B981'; // green
      case 'cancelada': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planejada': return 'Planejada';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        <span className="ml-3 text-brand-gray-600">Carregando dados do Gantt...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-brand-gray-600">Equipes Ativas</p>
              <p className="text-2xl font-bold text-brand-gray-900">
                {equipes.filter(e => e.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-brand-gray-600">Alocações</p>
              <p className="text-2xl font-bold text-brand-gray-900">{alocacoes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-brand-gray-600">Obras em Andamento</p>
              <p className="text-2xl font-bold text-brand-gray-900">
                {obras.filter(o => o.status === 'em_andamento').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Gantt */}
      <div className="bg-white rounded-lg shadow-sm border border-brand-gray-200">
        <div className="p-4 border-b border-brand-gray-200">
          <h3 className="text-lg font-semibold text-brand-gray-800">Cronograma de Alocações</h3>
          <p className="text-sm text-brand-gray-600">Visualização das alocações das equipes nas obras</p>
        </div>
        
        <div className="p-4">
          {equipes.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-brand-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-gray-900 mb-2">Nenhuma equipe cadastrada</h3>
              <p className="text-brand-gray-600 mb-4">Para visualizar o cronograma, é necessário cadastrar equipes primeiro.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-blue/90 transition-colors"
              >
                Atualizar
              </button>
            </div>
          ) : (
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
                resources={calendarResources}
                events={calendarEvents}
                resourceAreaWidth="200px"
                resourceLabelText="Equipes"
                slotMinWidth="100"
                height="100%"
                eventContent={(eventInfo) => {
                  const progresso = eventInfo.event.extendedProps.progresso || 0;
                  return (
                    <div className="flex items-center h-full">
                      <div className="flex-1 text-xs font-medium text-white truncate">
                        {eventInfo.event.title}
                      </div>
                      <div className="ml-1 text-xs text-white/80">
                        {progresso}%
                      </div>
                    </div>
                  );
                }}
                eventClick={(info) => {
                  const event = info.event;
                  const obra = event.extendedProps.obra;
                  const status = event.extendedProps.status;
                  const progresso = event.extendedProps.progresso || 0;
                  
                  alert(`
                    Obra: ${event.title}
                    Status: ${getStatusText(status)}
                    Progresso: ${progresso}%
                    Período: ${event.start?.toLocaleDateString()} - ${event.end?.toLocaleDateString()}
                    ${obra ? `Cliente: ${obra.cliente}` : ''}
                    ${event.extendedProps.observacoes ? `Observações: ${event.extendedProps.observacoes}` : ''}
                  `);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white rounded-lg shadow-sm border border-brand-gray-200 p-4">
        <h4 className="text-sm font-semibold text-brand-gray-800 mb-3">Legenda de Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-brand-gray-600">Planejada</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm text-brand-gray-600">Em Andamento</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-brand-gray-600">Concluída</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-brand-gray-600">Cancelada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipesGantt;