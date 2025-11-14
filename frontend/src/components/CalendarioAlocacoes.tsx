import React, { useState, useEffect, useMemo } from 'react';
import { alocacaoService, type AlocacaoEquipeDTO } from '../services/AlocacaoService';
import { toast } from 'sonner';

interface CalendarioAlocacoesProps {
  obraId?: string;
  equipeId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  view?: 'mes' | 'semana' | 'dia';
}

const CalendarioAlocacoes: React.FC<CalendarioAlocacoesProps> = ({
  obraId,
  equipeId,
  dataInicio: dataInicioProp,
  dataFim: dataFimProp,
  view = 'mes'
}) => {
  const [alocacoes, setAlocacoes] = useState<AlocacaoEquipeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<'mes' | 'semana' | 'dia'>(view);

  useEffect(() => {
    carregarAlocacoes();
  }, [obraId, equipeId, mesAtual, visualizacao]);

  const carregarAlocacoes = async () => {
    try {
      setLoading(true);
      
      const dataInicio = dataInicioProp || new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
      const dataFim = dataFimProp || new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

      const response = await alocacaoService.buscarPorPeriodo({
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        obraId,
        equipeId
      });

      if (response.success && response.data) {
        setAlocacoes(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar alocações:', error);
      toast.error('Erro ao carregar alocações do calendário');
    } finally {
      setLoading(false);
    }
  };

  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    const dias: Date[] = [];
    for (let dia = new Date(primeiroDia); dia <= ultimoDia; dia.setDate(dia.getDate() + 1)) {
      dias.push(new Date(dia));
    }
    
    return dias;
  }, [mesAtual]);

  const obterAlocacoesDoDia = (dia: Date) => {
    return alocacoes.filter(alocacao => {
      const inicio = new Date(alocacao.dataInicio);
      const fim = new Date(alocacao.dataFim);
      return dia >= inicio && dia <= fim;
    });
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const mesNomeCompleto = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Agrupar alocações por equipe para visualização em timeline
  const alocacoesPorEquipe = useMemo(() => {
    const mapa = new Map<string, AlocacaoEquipeDTO[]>();
    
    alocacoes.forEach(alocacao => {
      const key = alocacao.equipeNome;
      if (!mapa.has(key)) {
        mapa.set(key, []);
      }
      mapa.get(key)!.push(alocacao);
    });
    
    return Array.from(mapa.entries()).map(([equipeNome, alocacoesEquipe]) => ({
      equipeNome,
      alocacoes: alocacoesEquipe
    }));
  }, [alocacoes]);

  const getStatusColor = (status: AlocacaoEquipeDTO['status']) => {
    switch (status) {
      case 'PLANEJADA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CONCLUIDA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!obraId && !equipeId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-yellow-800">⚠️ Especifique uma obra ou equipe para visualizar alocações</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={mesAnterior}
            className="p-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
            {mesNomeCompleto}
          </h3>
          <button
            onClick={proximoMes}
            className="p-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setMesAtual(new Date())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Hoje
          </button>
        </div>

        {/* Seletor de Visualização */}
        <div className="flex gap-2">
          <button
            onClick={() => setVisualizacao('dia')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              visualizacao === 'dia'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setVisualizacao('semana')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              visualizacao === 'semana'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setVisualizacao('mes')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              visualizacao === 'mes'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Timeline de Alocações por Equipe (Estilo Gantt) */}
          <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft overflow-x-auto">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Timeline de Alocações (Gantt)
            </h4>

            {alocacoesPorEquipe.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Nenhuma alocação neste período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alocacoesPorEquipe.map(({ equipeNome, alocacoes: alocacoesEquipe }) => (
                  <div key={equipeNome} className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {equipeNome}
                      </h5>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-xs font-bold">
                        {alocacoesEquipe.length} {alocacoesEquipe.length === 1 ? 'alocação' : 'alocações'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {alocacoesEquipe.map((alocacao) => (
                        <div
                          key={alocacao.id}
                          className={`p-3 border-2 rounded-lg ${getStatusColor(alocacao.status)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                📋 Tarefa #{alocacao.tarefaId.substring(0, 8)}
                              </p>
                              {alocacao.observacoes && (
                                <p className="text-xs opacity-80 mt-1">{alocacao.observacoes}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              alocacao.status === 'PLANEJADA' ? 'bg-yellow-200 text-yellow-900' :
                              alocacao.status === 'EM_ANDAMENTO' ? 'bg-blue-200 text-blue-900' :
                              alocacao.status === 'CONCLUIDA' ? 'bg-green-200 text-green-900' :
                              'bg-red-200 text-red-900'
                            }`}>
                              {alocacao.status === 'PLANEJADA' ? '⏳ Planejada' :
                               alocacao.status === 'EM_ANDAMENTO' ? '⚡ Em Andamento' :
                               alocacao.status === 'CONCLUIDA' ? '✅ Concluída' : '❌ Cancelada'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(alocacao.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span>→</span>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(alocacao.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          
                          {/* Mostrar membros da equipe */}
                          {alocacao.membros && alocacao.membros.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-current opacity-50">
                              <div className="flex flex-wrap gap-1">
                                {alocacao.membros.map((membro) => (
                                  <span key={membro.id} className="px-2 py-0.5 bg-white/50 rounded text-xs">
                                    {membro.nome}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendário de Grid (Visualização por Dias) */}
          {visualizacao === 'mes' && (
            <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendário Mensal
              </h4>

              {/* Grid do Calendário */}
              <div className="grid grid-cols-7 gap-2">
                {/* Cabeçalho dos dias da semana */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                  <div key={dia} className="text-center font-bold text-gray-700 dark:text-gray-300 py-2">
                    {dia}
                  </div>
                ))}

                {/* Espaços vazios antes do primeiro dia */}
                {Array.from({ length: diasDoMes[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Dias do mês */}
                {diasDoMes.map((dia) => {
                  const alocacoesDia = obterAlocacoesDoDia(dia);
                  const isHoje = dia.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={dia.toISOString()}
                      className={`aspect-square border-2 rounded-lg p-2 transition-all ${
                        isHoje
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : alocacoesDia.length > 0
                          ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100'
                          : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                        {dia.getDate()}
                      </div>
                      {alocacoesDia.length > 0 && (
                        <div className="space-y-1">
                          {alocacoesDia.slice(0, 2).map((alocacao) => (
                            <div
                              key={alocacao.id}
                              className="text-[10px] px-1 py-0.5 bg-purple-600 text-white rounded truncate"
                              title={`${alocacao.equipeNome}`}
                            >
                              {alocacao.equipeNome.substring(0, 10)}
                            </div>
                          ))}
                          {alocacoesDia.length > 2 && (
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                              +{alocacoesDia.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resumo de Alocações */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Resumo do Período</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white dark:bg-dark-card rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600">{alocacoes.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Alocações</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-dark-card rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-600">
                  {alocacoes.filter(a => a.status === 'EM_ANDAMENTO').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Em Andamento</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-dark-card rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600">
                  {alocacoes.filter(a => a.status === 'CONCLUIDA').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Concluídas</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-dark-card rounded-xl border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-yellow-600">
                  {alocacoes.filter(a => a.status === 'PLANEJADA').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Planejadas</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarioAlocacoes;

