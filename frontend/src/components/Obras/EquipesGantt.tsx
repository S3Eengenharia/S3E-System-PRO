import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { alocacaoObraService, type AlocacaoDTO } from '../../services/AlocacaoObraService';

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

type StatusLabel = 'Planejada' | 'EmAndamento' | 'Concluida' | 'Cancelada' | string;

const EquipesGantt: React.FC = () => {
  const [alocacoes, setAlocacoes] = useState<AlocacaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<'TODAS' | 'Planejada' | 'EmAndamento' | 'Concluida' | 'Cancelada'>('TODAS');
  const now = new Date();
  const [filtroMes, setFiltroMes] = useState<number>(now.getMonth() + 1); // 1-12
  const [filtroAno, setFiltroAno] = useState<number>(now.getFullYear());

  // Carregar todas as alocações (globais)
  const loadAlocacoes = async () => {
    try {
      const response = await alocacaoObraService.getAllAlocacoes();
      if (response.success && Array.isArray(response.data)) {
        setAlocacoes(response.data);
      } else {
        setAlocacoes([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar alocações:', error);
      setError('Erro de conexão ao carregar alocações');
      setAlocacoes([]);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadAlocacoes();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  // Filtragem por status e período (mês/ano)
  const alocacoesFiltradas = React.useMemo(() => {
    const inicioMes = new Date(filtroAno, filtroMes - 1, 1, 0, 0, 0);
    const fimMes = new Date(filtroAno, filtroMes, 0, 23, 59, 59);
    return alocacoes.filter((a) => {
      // Status
      if (filtroStatus !== 'TODAS' && a.status !== filtroStatus) return false;
      // Período (interseção)
      const aInicio = new Date(a.dataInicio as any);
      const aFim = new Date(a.dataFimPrevisto as any);
      const intersects = aInicio <= fimMes && aFim >= inicioMes;
      return intersects;
    });
  }, [alocacoes, filtroStatus, filtroMes, filtroAno]);

  // Preparar resources como Equipes únicas das alocações filtradas
  const calendarResources = Array.from(
    new Map(
      alocacoesFiltradas
        .filter(a => a.equipe)
        .map(a => [a.equipe!.id, {
          id: a.equipe!.id,
          title: a.equipe!.nome,
          extendedProps: { tipo: a.equipe!.tipo }
        }])
    ).values()
  );

  const calendarEvents = alocacoesFiltradas.map(a => ({
    id: a.id,
    resourceId: a.equipe?.id || a.equipeId || '',
    title: a.projeto?.titulo || a.projeto?.id || 'Projeto',
    start: a.dataInicio as any,
    end: a.dataFimPrevisto as any,
    backgroundColor: getStatusColor(a.status as StatusLabel),
    borderColor: getStatusColor(a.status as StatusLabel),
    extendedProps: {
      status: a.status as StatusLabel,
      observacoes: a.observacoes,
      equipe: a.equipe,
      projeto: a.projeto
    }
  }));

  const getStatusColor = (status: StatusLabel) => {
    switch (status) {
      case 'Planejada': return '#3B82F6';
      case 'EmAndamento': return '#F59E0B';
      case 'Concluida': return '#10B981';
      case 'Cancelada': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: StatusLabel) => {
    switch (status) {
      case 'Planejada': return 'Planejada';
      case 'EmAndamento': return 'Em Andamento';
      case 'Concluida': return 'Concluída';
      case 'Cancelada': return 'Cancelada';
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
        
        {/* Filtros */}
        <div className="px-4 pt-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="TODAS">Todas</option>
                <option value="Planejada">Planejada</option>
                <option value="EmAndamento">Em Andamento</option>
                <option value="Concluida">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mês</label>
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, idx) => (
                  <option key={idx} value={idx+1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ano</label>
              <input
                type="number"
                value={filtroAno}
                onChange={(e) => setFiltroAno(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg w-28"
                min={2000}
                max={2100}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {calendarResources.length === 0 ? (
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
                initialDate={new Date(filtroAno, filtroMes - 1, 1) as any}
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
                  return (
                    <div className="flex items-center h-full">
                      <div className="flex-1 text-xs font-medium text-white truncate">
                        {eventInfo.event.title}
                      </div>
                    </div>
                  );
                }}
                eventClick={(info) => {
                  const event = info.event;
                  const status = event.extendedProps.status as StatusLabel;
                  
                  alert(`
                    Projeto: ${event.title}
                    Status: ${getStatusText(status)}
                    Período: ${event.start?.toLocaleDateString()} - ${event.end?.toLocaleDateString()}
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