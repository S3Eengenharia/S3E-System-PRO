import React, { useEffect, useMemo, useState } from 'react';
import { equipeService, type EquipeDTO } from '../../services/EquipeService';
import { alocacaoObraService, type AlocacaoDTO } from '../../services/AlocacaoObraService';

interface ModalAlocacaoEquipeProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string;
}

const ModalAlocacaoEquipe: React.FC<ModalAlocacaoEquipeProps> = ({ isOpen, onClose, projetoId }) => {
  const [equipes, setEquipes] = useState<EquipeDTO[]>([]);
  const [alocacoes, setAlocacoes] = useState<AlocacaoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [equipeId, setEquipeId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [duracaoDias, setDuracaoDias] = useState<number>(10);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    void loadContext();
  }, [isOpen, projetoId]);

  async function loadContext() {
    try {
      setLoading(true);
      setError(null);
      const [equipesRes, alocRes] = await Promise.all([
        equipeService.getAllEquipes(),
        alocacaoObraService.getAlocacoesPorProjeto(projetoId)
      ]);
      setEquipes(equipesRes.success && Array.isArray(equipesRes.data) ? equipesRes.data : []);
      setAlocacoes(alocRes.success && Array.isArray(alocRes.data) ? alocRes.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados de alocação');
      setEquipes([]);
      setAlocacoes([]);
    } finally {
      setLoading(false);
    }
  }

  const podeAlocar = useMemo(() => {
    return Boolean(equipeId && dataInicio && duracaoDias > 0);
  }, [equipeId, dataInicio, duracaoDias]);

  async function handleAlocar() {
    if (!podeAlocar) return;
    try {
      setLoading(true);
      setError(null);
      const res = await alocacaoObraService.alocarEquipe({
        equipeId,
        projetoId,
        dataInicio,
        duracaoDias,
        observacoes: observacoes || undefined
      });
      if (res.success && res.data) {
        setAlocacoes(prev => [res.data!, ...prev]);
        setEquipeId('');
        setDataInicio('');
        setDuracaoDias(10);
        setObservacoes('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao alocar equipe');
    } finally {
      setLoading(false);
    }
  }

  async function iniciar(id: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await alocacaoObraService.iniciarAlocacao(id);
      if (res.success && res.data) {
        setAlocacoes(prev => prev.map(a => (a.id === id ? res.data! : a)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar alocação');
    } finally {
      setLoading(false);
    }
  }

  async function concluir(id: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await alocacaoObraService.concluirAlocacao(id);
      if (res.success && res.data) {
        setAlocacoes(prev => prev.map(a => (a.id === id ? res.data! : a)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao concluir alocação');
    } finally {
      setLoading(false);
    }
  }

  async function cancelar(id: string) {
    try {
      const motivo = window.prompt('Motivo do cancelamento?') || undefined;
      setLoading(true);
      setError(null);
      const res = await alocacaoObraService.cancelarAlocacao(id, motivo);
      if (res.success && res.data) {
        setAlocacoes(prev => prev.map(a => (a.id === id ? res.data! : a)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao cancelar alocação');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Alocação de Equipes</h3>
            <p className="text-sm text-gray-600">Projeto: {projetoId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Nova Alocação</h4>
            <div className="space-y-3">
              <select
                value={equipeId}
                onChange={e => setEquipeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione a equipe</option>
                {equipes.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nome} • {eq.tipo}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={duracaoDias}
                  onChange={e => setDuracaoDias(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Duração (dias úteis)"
                />
              </div>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Observações (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleAlocar}
                disabled={!podeAlocar || loading}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 font-semibold disabled:opacity-60"
              >
                Alocar Equipe
              </button>
              {loading && <div className="text-sm text-gray-600">Processando...</div>}
              {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Alocações do Projeto</h4>
            <div className="border border-gray-200 rounded-xl max-h-96 overflow-auto">
              {alocacoes.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">Nenhuma alocação encontrada para este projeto.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {alocacoes.map(a => (
                    <li key={a.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{a.equipe.nome} • {a.status}</div>
                        <div className="text-xs text-gray-600">
                          Início: {new Date(a.dataInicio as any).toLocaleDateString()} • Previsto: {new Date(a.dataFimPrevisto as any).toLocaleDateString()}
                          {a.dataFimReal ? ` • Real: ${new Date(a.dataFimReal as any).toLocaleDateString()}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.status === 'Planejada' && (
                          <>
                            <button onClick={() => iniciar(a.id)} className="px-3 py-1.5 text-sm bg-white border-2 border-brand-blue text-brand-blue rounded-lg hover:bg-blue-50">Iniciar</button>
                            <button onClick={() => cancelar(a.id)} className="px-3 py-1.5 text-sm bg-white border-2 border-red-400 text-red-600 rounded-lg hover:bg-red-50">Cancelar</button>
                          </>
                        )}
                        {a.status === 'EmAndamento' && (
                          <button onClick={() => concluir(a.id)} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Concluir</button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalAlocacaoEquipe;


