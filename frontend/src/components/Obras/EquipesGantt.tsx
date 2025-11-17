import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { alocacaoObraService, type AlocacaoDTO } from '../../services/AlocacaoObraService';

import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

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

interface Equipe {
  id: string;
  nome: string;
  tipo: string;
  ativa: boolean;
  membros?: any[];
}

interface Obra {
  id: string;
  nomeObra: string;
  status: string;
}

interface EquipesGanttProps {
  equipes?: Equipe[];
  obras?: Obra[];
  alocacoes?: AlocacaoDTO[];
  onRefresh?: () => void;
}

const EquipesGantt: React.FC<EquipesGanttProps> = ({ 
  equipes = [], 
  obras = [], 
  alocacoes: alocacoesProp = [],
  onRefresh 
}) => {
  const [alocacoes, setAlocacoes] = useState<AlocacaoDTO[]>(alocacoesProp);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<AlocacaoDTO | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<'TODAS' | 'Planejada' | 'EmAndamento' | 'Concluida' | 'Cancelada'>('TODAS');
  const now = new Date();
  const [filtroMes, setFiltroMes] = useState<number>(now.getMonth() + 1); // 1-12
  const [filtroAno, setFiltroAno] = useState<number>(now.getFullYear());
  // Drafts
  const [filtroStatusDraft, setFiltroStatusDraft] = useState<typeof filtroStatus>(filtroStatus);
  const [filtroMesDraft, setFiltroMesDraft] = useState<number>(filtroMes);
  const [filtroAnoDraft, setFiltroAnoDraft] = useState<number>(filtroAno);
  const handleAplicarFiltros = () => {
    setFiltroStatus(filtroStatusDraft);
    setFiltroMes(filtroMesDraft);
    setFiltroAno(filtroAnoDraft);
  };


  // Carregar todas as alocações (globais) - apenas se não foram passadas como prop
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

    // Se alocações foram passadas como prop, usar elas
    if (alocacoesProp.length > 0) {
      setAlocacoes(alocacoesProp);
      setLoading(false);
      return;
    }

    // Caso contrário, carregar do backend
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

  }, [alocacoesProp]);

  const getEquipeInfo = (alocacao: AlocacaoDTO) => {
    if (alocacao.equipe) {
      return alocacao.equipe;
    }

    if (alocacao.equipeId) {
      const equipeFallback = equipes.find(eq => eq.id === alocacao.equipeId);
      if (equipeFallback) {
        return {
          id: equipeFallback.id,
          nome: equipeFallback.nome,
          tipo: equipeFallback.tipo,
        };
      }
    }

    return null;
  };

  const getDataFimSafe = (alocacao: AlocacaoDTO) => {
    return (
      alocacao.dataFimPrevisto ||
      (alocacao as any).dataFim ||
      alocacao.dataFimReal ||
      alocacao.dataInicio
    );
  };

  // Filtragem por status e período (mês/ano)
  const alocacoesFiltradas = React.useMemo(() => {
    const inicioMes = new Date(filtroAno, filtroMes - 1, 1, 0, 0, 0);
    const fimMes = new Date(filtroAno, filtroMes, 0, 23, 59, 59);
    return alocacoes.filter((a) => {
      // Status
      if (filtroStatus !== 'TODAS' && a.status !== filtroStatus) return false;
      // Período (interseção)
      const aInicio = new Date(a.dataInicio as any);
      const aFim = new Date(getDataFimSafe(a) as any);

      if (Number.isNaN(aInicio.getTime()) || Number.isNaN(aFim.getTime())) {
        return false;
      }

      const intersects = aInicio <= fimMes && aFim >= inicioMes;
      return intersects;
    });
  }, [alocacoes, filtroStatus, filtroMes, filtroAno]);

  // Preparar resources como Equipes únicas das alocações filtradas
  const calendarResources = Array.from(
    new Map(
      alocacoesFiltradas
        .map(a => {
          const equipeInfo = getEquipeInfo(a);
          if (!equipeInfo) return null;
          return [
            equipeInfo.id,
            {
              id: equipeInfo.id,
              title: equipeInfo.nome,
              extendedProps: { tipo: equipeInfo.tipo },
            },
          ] as const;
        })
        .filter((entry): entry is readonly [string, { id: string; title: string; extendedProps: { tipo: string } }] => entry !== null)
    ).values()
  );

  const calendarEvents = alocacoesFiltradas
    .map(a => {
      const equipeInfo = getEquipeInfo(a);
      const resourceId = equipeInfo?.id || a.equipeId;

      if (!resourceId) {
        return null;
      }

      return {
        id: a.id,
        resourceId,
        title: a.projeto?.titulo || a.projeto?.id || 'Projeto',
        start: a.dataInicio as any,
        end: getDataFimSafe(a) as any,
        backgroundColor: getStatusColor(a.status as StatusLabel),
        borderColor: getStatusColor(a.status as StatusLabel),
        extendedProps: {
          status: a.status as StatusLabel,
          observacoes: a.observacoes,
          equipe: equipeInfo,
          projeto: a.projeto,
        },
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null);

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

                {equipes.filter(e => e.ativa).length}
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

                {obras.filter(o => o.status === 'ANDAMENTO' || o.status === 'em_andamento').length}
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
                value={filtroStatusDraft}
                onChange={(e) => setFiltroStatusDraft(e.target.value as any)}
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
                value={filtroMesDraft}
                onChange={(e) => setFiltroMesDraft(Number(e.target.value))}
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
                value={filtroAnoDraft}
                onChange={(e) => setFiltroAnoDraft(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg w-28"
                min={2000}
                max={2100}
              />
            </div>
            <div className="md:ml-auto">
              <button
                onClick={handleAplicarFiltros}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 font-semibold"
              >
                Aplicar Filtros
              </button>
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
                  const alocacao = alocacoes.find(a => a.id === event.id);
                  if (alocacao) {
                    setSelectedEvent(alocacao);
                    setShowEventDialog(true);
                  }
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

      {/* Dialog de Detalhes da Alocação */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📅 Detalhes da Alocação</DialogTitle>
            <DialogDescription>
              Informações sobre a alocação da equipe
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Projeto:</p>
                <p className="text-sm text-gray-900">{selectedEvent.projeto?.titulo || 'Sem projeto'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Equipe:</p>
                <p className="text-sm text-gray-900">{selectedEvent.equipe?.nome || 'Sem equipe'}</p>
                <p className="text-xs text-gray-500">{selectedEvent.equipe?.tipo || ''}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Status:</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                  selectedEvent.status === 'EmAndamento' ? 'bg-green-100 text-green-800' :
                  selectedEvent.status === 'Planejada' ? 'bg-blue-100 text-blue-800' :
                  selectedEvent.status === 'Concluida' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusText(selectedEvent.status as StatusLabel)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Período:</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedEvent.dataInicio).toLocaleDateString('pt-BR')} até{' '}
                  {new Date(selectedEvent.dataFimPrevisto).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {selectedEvent.observacoes && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Observações:</p>
                  <p className="text-sm text-gray-900">{selectedEvent.observacoes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={() => {
                setShowEventDialog(false);
                setSelectedEvent(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Fechar
            </button>
            {onRefresh && (
              <button
                onClick={() => {
                  onRefresh();
                  toast.success('Dados atualizados!');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Atualizar
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipesGantt;