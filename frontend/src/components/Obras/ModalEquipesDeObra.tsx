import React, { useEffect, useMemo, useState } from 'react';
import { pessoaService, type PessoaDTO } from '../../services/PessoaService';
import { equipeService, type EquipeDTO } from '../../services/EquipeService';

interface ModalEquipesDeObraProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalEquipesDeObra: React.FC<ModalEquipesDeObraProps> = ({ isOpen, onClose }) => {
  const [disponiveis, setDisponiveis] = useState<PessoaDTO[]>([]);
  const [equipes, setEquipes] = useState<EquipeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nomeEquipe, setNomeEquipe] = useState('');
  const [tipoEquipe, setTipoEquipe] = useState<'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO' | 'CAMPO' | 'DISTINTA'>('CAMPO');
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [editingEquipeId, setEditingEquipeId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      void Promise.all([loadDisponiveis(), loadEquipes()]);
    }
  }, [isOpen]);

  async function loadDisponiveis() {
    try {
      setLoading(true);
      setError(null);
      const res = await pessoaService.getDisponiveisParaEquipe();
      if (res.success && Array.isArray(res.data)) {
        setDisponiveis(res.data);
      } else {
        setDisponiveis([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar pessoas disponíveis');
      setDisponiveis([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadEquipes() {
    try {
      setLoading(true);
      setError(null);
      const res = await equipeService.getAllEquipes();
      if (res.success && Array.isArray(res.data)) {
        setEquipes(res.data);
      } else {
        setEquipes([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar equipes');
      setEquipes([]);
    } finally {
      setLoading(false);
    }
  }

  const pessoasParaSelecao: PessoaDTO[] = useMemo(() => {
    if (!editingEquipeId) return disponiveis;
    const equipeAtual = equipes.find(e => e.id === editingEquipeId);
    if (!equipeAtual) return disponiveis;

    const currentMembers: PessoaDTO[] = (equipeAtual.membros || []).map((m) => ({
      id: m.id,
      nome: m.nome,
      email: m.email || undefined,
      funcao: (m.funcao as unknown as PessoaDTO['funcao'])
    }));

    const byId = new Map<string, PessoaDTO>();
    [...disponiveis, ...currentMembers].forEach((p) => {
      if (p.id) byId.set(p.id, p);
    });
    return Array.from(byId.values());
  }, [disponiveis, editingEquipeId, equipes]);

  const filtrados = useMemo(() => {
    const s = busca.toLowerCase();
    return pessoasParaSelecao.filter(p =>
      p.nome.toLowerCase().includes(s) ||
      (p.email || '').toLowerCase().includes(s) ||
      (p.funcao || '').toLowerCase().includes(s)
    );
  }, [pessoasParaSelecao, busca]);

  const alternarSelecionado = (id: string) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const criarEquipe = async () => {
    if (!nomeEquipe.trim() || selecionados.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const res = await equipeService.createEquipe({
        nome: nomeEquipe.trim(),
        tipo: tipoEquipe,
        membrosIds: selecionados
      });
      if (res.success && res.data) {
        setEquipes(prev => [res.data!, ...prev]);
        setNomeEquipe('');
        setSelecionados([]);
        setEditingEquipeId(null);
        // Atualiza pessoas disponíveis, pois as selecionadas ficaram indisponíveis
        void loadDisponiveis();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar equipe');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (eq: EquipeDTO) => {
    setEditingEquipeId(eq.id);
    setNomeEquipe(eq.nome);
    setTipoEquipe(eq.tipo);
    setSelecionados((eq.membros || []).map(m => m.id));
  };

  const cancelarEdicao = () => {
    setEditingEquipeId(null);
    setNomeEquipe('');
    setSelecionados([]);
  };

  const salvarEdicao = async () => {
    if (!editingEquipeId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await equipeService.updateEquipe(editingEquipeId, {
        nome: nomeEquipe.trim() || undefined,
        tipo: tipoEquipe,
        membrosIds: selecionados
      });
      if (res.success && res.data) {
        setEquipes(prev => prev.map(e => (e.id === editingEquipeId ? res.data! : e)));
        setEditingEquipeId(null);
        setNomeEquipe('');
        setSelecionados([]);
        // Atualiza disponibilidade após mudar membros
        void loadDisponiveis();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar edição da equipe');
    } finally {
      setLoading(false);
    }
  };

  const excluirEquipe = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await equipeService.deleteEquipe(id);
      if (res.success) {
        setEquipes(prev => prev.filter(e => e.id !== id));
        // Ao excluir, membros ficam disponíveis novamente
        void loadDisponiveis();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir equipe');
    } finally {
      setLoading(false);
    }
  };

  const renomearEquipe = async (id: string) => {
    const novoNome = window.prompt('Novo nome da equipe');
    if (!novoNome || !novoNome.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await equipeService.updateEquipe(id, { nome: novoNome.trim() });
      if (res.success && res.data) {
        setEquipes(prev => prev.map(e => (e.id === id ? res.data! : e)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao renomear equipe');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gestão de Equipes de Obra</h3>
            <p className="text-sm text-gray-600">Monte equipes a partir das Pessoas disponíveis</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Pessoas Disponíveis</h4>
            <div className="flex items-center gap-2 mb-3">
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, email ou função"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button onClick={loadDisponiveis} className="px-3 py-2 bg-white border-2 border-brand-blue text-brand-blue font-semibold rounded-lg">Atualizar</button>
            </div>

            <div className="border border-gray-200 rounded-xl max-h-80 overflow-auto">
              {loading ? (
                <div className="p-4 text-sm text-gray-600">Carregando...</div>
              ) : error ? (
                <div className="p-4 text-sm text-red-700 bg-red-50">{error}</div>
              ) : filtrados.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">Nenhuma pessoa disponível</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filtrados.map(p => (
                    <li key={p.id} className="flex items-center justify-between p-3">
                      <div>
                        <div className="font-medium text-gray-900">{p.nome}</div>
                        <div className="text-xs text-gray-600">{p.email || 'sem email'} • {p.funcao}</div>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selecionados.includes(p.id!)}
                          onChange={() => alternarSelecionado(p.id!)}
                        />
                        Selecionar
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Nova Equipe</h4>
            <div className="space-y-3">
              <input
                value={nomeEquipe}
                onChange={e => setNomeEquipe(e.target.value)}
                placeholder="Nome da equipe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={tipoEquipe}
                onChange={e => setTipoEquipe(e.target.value as typeof tipoEquipe)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="CAMPO">CAMPO</option>
                <option value="MONTAGEM">MONTAGEM</option>
                <option value="INSTALACAO">INSTALACAO</option>
                <option value="MANUTENCAO">MANUTENCAO</option>
                <option value="DISTINTA">DISTINTA</option>
              </select>
              {editingEquipeId ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={salvarEdicao}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 font-semibold"
                    disabled={selecionados.length === 0}
                  >
                    Salvar Alterações
                  </button>
                  <button
                    onClick={cancelarEdicao}
                    className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={criarEquipe}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 font-semibold"
                  disabled={!nomeEquipe.trim() || selecionados.length === 0}
                >
                  Criar Equipe
                </button>
              )}

              <h4 className="font-semibold text-gray-900 mt-6">Equipes Criadas</h4>
              <div className="space-y-2">
                {equipes.length === 0 && (
                  <div className="text-sm text-gray-600">Nenhuma equipe criada ainda.</div>
                )}
                {equipes.map(eq => (
                  <div key={eq.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{eq.nome}</div>
                      <div className="text-xs text-gray-600">Membros: {eq.membros?.length || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => iniciarEdicao(eq)} className="px-3 py-1.5 text-sm bg-white border-2 border-brand-blue text-brand-blue rounded-lg hover:bg-blue-50">Editar membros</button>
                      <button onClick={() => renomearEquipe(eq.id)} className="px-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50">Renomear</button>
                      <button onClick={() => excluirEquipe(eq.id)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
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

export default ModalEquipesDeObra;


