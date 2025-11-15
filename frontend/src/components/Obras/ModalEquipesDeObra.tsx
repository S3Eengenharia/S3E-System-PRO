import React, { useEffect, useMemo, useState } from 'react';
import { equipeService, type EquipeDTO } from '../../services/EquipeService';
import { axiosApiService } from '../../services/axiosApi';
<<<<<<< HEAD
import { toast } from 'sonner';
import { alocacaoObraService } from '../../services/AlocacaoObraService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
=======
>>>>>>> 478241a18130cffdb1e72d234262f5f84b2e45a1

interface EletricistaDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface ModalEquipesDeObraProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalEquipesDeObra: React.FC<ModalEquipesDeObraProps> = ({ isOpen, onClose }) => {
  const [eletricistas, setEletricistas] = useState<EletricistaDTO[]>([]);
  const [equipes, setEquipes] = useState<EquipeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nomeEquipe, setNomeEquipe] = useState('');
  const [tipoEquipe, setTipoEquipe] = useState<'MONTAGEM' | 'MANUTENCAO' | 'INSTALACAO' | 'CAMPO' | 'DISTINTA'>('CAMPO');
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [editingEquipeId, setEditingEquipeId] = useState<string | null>(null);
<<<<<<< HEAD
  
  // Estados para diálogos
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [equipeParaExcluir, setEquipeParaExcluir] = useState<EquipeDTO | null>(null);
  const [loadingAlocacoes, setLoadingAlocacoes] = useState(false);
  const [alocacoesAtivas, setAlocacoesAtivas] = useState<any[]>([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [equipeParaRenomear, setEquipeParaRenomear] = useState<EquipeDTO | null>(null);
  const [novoNome, setNovoNome] = useState('');
=======
>>>>>>> 478241a18130cffdb1e72d234262f5f84b2e45a1

  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal aberto, carregando dados...');
      void Promise.all([loadEletricistas(), loadEquipes()]);
    } else {
      // Limpar dados quando o modal fechar
      setEletricistas([]);
      setEquipes([]);
      setSelecionados([]);
      setNomeEquipe('');
      setBusca('');
      setEditingEquipeId(null);
      setError(null);
    }
  }, [isOpen]);

  async function loadEletricistas() {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Carregando eletricistas do backend...');
      
      // Carregar usuários do sistema
      const response = await axiosApiService.get<any[]>('/api/configuracoes/usuarios');
      
      if (response.success && response.data) {
        // Filtrar apenas eletricistas ativos
        const usuariosArray = Array.isArray(response.data) ? response.data : [];
        const eletricistasFiltered = usuariosArray
          .filter((u: any) => 
            u.role?.toLowerCase() === 'eletricista' && 
            (u.active !== false) // Apenas usuários ativos
          )
          .map((u: any) => ({
            id: u.id,
            name: u.name || 'Sem nome',
            email: u.email || 'Sem email',
            role: u.role,
            active: u.active
          }));
        
        console.log('✅ Eletricistas carregados:', eletricistasFiltered);
        setEletricistas(eletricistasFiltered);
      } else {
        console.warn('⚠️ Resposta sem dados de eletricistas:', response);
        setEletricistas([]);
      }
    } catch (e) {
      console.error('❌ Erro ao carregar eletricistas:', e);
      setError(e instanceof Error ? e.message : 'Erro ao carregar eletricistas disponíveis');
      setEletricistas([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadEquipes() {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Carregando equipes do backend...');
      const res = await equipeService.getAllEquipes();
      console.log('📥 Resposta de equipes:', res);
      if (res.success && Array.isArray(res.data)) {
        console.log('✅ Equipes carregadas:', res.data.length);
        setEquipes(res.data);
      } else {
        console.warn('⚠️ Resposta sem dados de equipes:', res);
        setEquipes([]);
      }
    } catch (e) {
      console.error('❌ Erro ao carregar equipes:', e);
      setError(e instanceof Error ? e.message : 'Erro ao carregar equipes');
      setEquipes([]);
    } finally {
      setLoading(false);
    }
  }

  // Verificar se um eletricista já está em outra equipe (exceto a equipe sendo editada)
  const isEletricistaEmOutraEquipe = useMemo(() => {
    return (eletricistaId: string): { emOutraEquipe: boolean; nomeEquipe?: string } => {
      // Se estiver editando uma equipe, ignorar os membros dessa equipe atual
      const equipeAtualId = editingEquipeId;
      
      // Se o eletricista está na equipe atual sendo editada, não está em outra equipe
      if (equipeAtualId && selecionados.includes(eletricistaId)) {
        return { emOutraEquipe: false };
      }
      
      for (const equipe of equipes) {
        // Ignorar a equipe atual se estiver editando
        if (equipeAtualId && equipe.id === equipeAtualId) {
          continue;
        }
        
        // Verificar se o eletricista está nesta equipe (verificar pelos membros)
        const estaNaEquipe = equipe.membros?.some(membro => {
          // Membros podem ser objetos com id ou apenas strings (IDs)
          const membroId = typeof membro === 'string' ? membro : membro.id;
          return membroId === eletricistaId;
        });
        
        if (estaNaEquipe && equipe.ativa !== false) {
          return { emOutraEquipe: true, nomeEquipe: equipe.nome };
        }
      }
      
      return { emOutraEquipe: false };
    };
  }, [editingEquipeId, selecionados, equipes]);

  const eletricistasParaSelecao: EletricistaDTO[] = useMemo(() => {
    // Se estiver editando, incluir os membros atuais da equipe sendo editada
    if (!editingEquipeId) return eletricistas;
    
    const equipeAtual = equipes.find(e => e.id === editingEquipeId);
    if (!equipeAtual) return eletricistas;

    // Criar um mapa de eletricistas por ID
    const eletricistasById = new Map<string, EletricistaDTO>();
    eletricistas.forEach(e => {
      if (e.id) eletricistasById.set(e.id, e);
    });

    // Adicionar membros atuais que não estão na lista de eletricistas
    (equipeAtual.membros || []).forEach((m) => {
      const membroId = typeof m === 'string' ? m : m.id;
      if (!eletricistasById.has(membroId)) {
        // Criar um objeto básico para membros que não estão na lista de eletricistas
        eletricistasById.set(membroId, {
          id: membroId,
          name: (m as any).nome || (m as any).name || 'Sem nome',
          email: (m as any).email || 'Sem email',
          role: (m as any).funcao || (m as any).role || 'eletricista',
          active: true
        });
      }
    });

    return Array.from(eletricistasById.values());
  }, [eletricistas, editingEquipeId, equipes]);

  const filtrados = useMemo(() => {
    const s = busca.toLowerCase();
    
    // Filtrar por busca
    let resultado = eletricistasParaSelecao.filter(e =>
      (e.name || '').toLowerCase().includes(s) ||
      (e.email || '').toLowerCase().includes(s) ||
      (e.role || '').toLowerCase().includes(s)
    );
    
    // Se estiver editando, mostrar apenas eletricistas disponíveis (não em outras equipes)
    // MAS incluir os membros atuais da equipe sendo editada
    if (editingEquipeId) {
      const equipeAtual = equipes.find(e => e.id === editingEquipeId);
      const membrosAtuaisIds = (equipeAtual?.membros || []).map(m => {
        return typeof m === 'string' ? m : m.id;
      });
      
      resultado = resultado.filter(e => {
        // Incluir se é membro atual
        if (membrosAtuaisIds.includes(e.id)) {
          return true;
        }
        // Incluir se não está em nenhuma outra equipe
        const { emOutraEquipe } = isEletricistaEmOutraEquipe(e.id);
        return !emOutraEquipe;
      });
    } else {
      // Ao criar, mostrar apenas eletricistas que não estão em equipes ativas
      resultado = resultado.filter(e => {
        const { emOutraEquipe } = isEletricistaEmOutraEquipe(e.id);
        return !emOutraEquipe;
      });
    }
    
    return resultado;
  }, [eletricistasParaSelecao, busca, editingEquipeId, equipes, isEletricistaEmOutraEquipe]);

  const alternarSelecionado = (id: string) => {
    // Se já está selecionado, permitir desmarcar
    if (selecionados.includes(id)) {
      setSelecionados(prev => prev.filter(x => x !== id));
      return;
    }
    
    // Adicionar às pessoas selecionadas
    setSelecionados(prev => [...prev, id]);
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
        // Atualiza eletricistas disponíveis, pois os selecionados ficaram indisponíveis
        void Promise.all([loadEletricistas(), loadEquipes()]);
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
        void Promise.all([loadEletricistas(), loadEquipes()]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar edição da equipe');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Verificar alocações ativas antes de excluir
  const verificarAlocacoesAtivas = async (equipeId: string) => {
    try {
      setLoadingAlocacoes(true);
      const response = await alocacaoObraService.getAllAlocacoes();
      if (response.success && response.data) {
        const alocacoes = Array.isArray(response.data) ? response.data : [];
        const ativas = alocacoes.filter((a: any) => 
          a.equipe?.id === equipeId && 
          (a.status === 'Planejada' || a.status === 'EmAndamento')
        );
        setAlocacoesAtivas(ativas);
        return ativas;
      }
      return [];
    } catch (e) {
      console.error('Erro ao verificar alocações:', e);
      return [];
    } finally {
      setLoadingAlocacoes(false);
    }
  };

  const abrirDialogExcluir = async (id: string) => {
    const equipe = equipes.find(e => e.id === id);
    if (!equipe) return;
    
    // Verificar alocações ativas
    const ativas = await verificarAlocacoesAtivas(id);
    if (ativas.length > 0) {
      toast.error('Não é possível excluir esta equipe', {
        description: `A equipe possui ${ativas.length} alocação(ões) em andamento ou planejada(s). Finalize ou cancele as alocações antes de excluir.`,
        duration: 5000
      });
      return;
    }
    
    setEquipeParaExcluir(equipe);
    setShowDeleteDialog(true);
  };

  const excluirEquipe = async () => {
    if (!equipeParaExcluir) return;
    const id = equipeParaExcluir.id;
    const nomeEquipe = equipeParaExcluir.nome;

    try {
      setLoading(true);
      setError(null);
      setShowDeleteDialog(false);
      console.log('🗑️ Excluindo equipe:', id);
      
      const res = await equipeService.deleteEquipe(id);
      console.log('📥 Resposta da exclusão:', res);
      
      if (res.success) {
        console.log('✅ Equipe excluída com sucesso');
        // Remover da lista local imediatamente
        setEquipes(prev => prev.filter(e => e.id !== id));
        // Recarregar dados para garantir sincronização
        await Promise.all([loadEletricistas(), loadEquipes()]);
        // Feedback visual de sucesso
        toast.success('Equipe excluída com sucesso!', {
          description: `A equipe "${nomeEquipe}" foi removida do sistema.`,
        });
      } else {
        const errorMsg = res.error || 'Erro desconhecido ao excluir equipe';
        console.error('❌ Erro na resposta:', errorMsg);
        setError(errorMsg);
        toast.error('Erro ao excluir equipe', {
          description: errorMsg,
        });
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Erro ao excluir equipe';
      console.error('❌ Erro ao excluir equipe:', e);
      setError(errorMsg);
      toast.error('Erro ao excluir equipe', {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
      setEquipeParaExcluir(null);
    }
  };

  const abrirDialogRenomear = (equipe: EquipeDTO) => {
    setEquipeParaRenomear(equipe);
    setNovoNome(equipe.nome);
    setShowRenameDialog(true);
  };

  const renomearEquipe = async () => {
    if (!equipeParaRenomear || !novoNome || !novoNome.trim()) {
      toast.error('Nome inválido', {
        description: 'Por favor, informe um nome válido para a equipe.',
      });
      return;
    }
    
    const id = equipeParaRenomear.id;
    const nomeAnterior = equipeParaRenomear.nome;
    
    try {
      setLoading(true);
      setError(null);
      setShowRenameDialog(false);
      const res = await equipeService.updateEquipe(id, { nome: novoNome.trim() });
      if (res.success && res.data) {
        setEquipes(prev => prev.map(e => (e.id === id ? res.data! : e)));
        toast.success('Equipe renomeada com sucesso!', {
          description: `A equipe "${nomeAnterior}" foi renomeada para "${novoNome.trim()}".`,
        });
      } else {
        const errorMsg = res.error || 'Erro ao renomear equipe';
        setError(errorMsg);
        toast.error('Erro ao renomear equipe', {
          description: errorMsg,
        });
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Erro ao renomear equipe';
      setError(errorMsg);
      toast.error('Erro ao renomear equipe', {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
      setEquipeParaRenomear(null);
      setNovoNome('');
=======
  const excluirEquipe = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await equipeService.deleteEquipe(id);
      if (res.success) {
        setEquipes(prev => prev.filter(e => e.id !== id));
        // Ao excluir, membros ficam disponíveis novamente
        void Promise.all([loadEletricistas(), loadEquipes()]);
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
>>>>>>> 478241a18130cffdb1e72d234262f5f84b2e45a1
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gestão de Equipes de Obra</h3>
            <p className="text-sm text-gray-600">Monte equipes a partir dos Eletricistas disponíveis</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
        </div>

<<<<<<< HEAD
        {/* Mensagem de erro */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="ml-auto text-red-600 hover:text-red-800"
                title="Fechar"
              >
                ✕
              </button>
            </div>
          </div>
        )}

=======
>>>>>>> 478241a18130cffdb1e72d234262f5f84b2e45a1
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              {editingEquipeId ? 'Eletricistas Disponíveis para Adicionar' : 'Eletricistas Disponíveis'}
            </h4>
            
            {editingEquipeId && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Mostrando apenas eletricistas que <strong>não estão em outras equipes</strong> + membros atuais desta equipe.
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, email ou função"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button onClick={() => Promise.all([loadEletricistas(), loadEquipes()])} className="px-3 py-2 bg-white border-2 border-brand-blue text-brand-blue font-semibold rounded-lg hover:bg-blue-50 transition-colors">Atualizar</button>
            </div>

            <div className="border border-gray-200 rounded-xl max-h-80 overflow-auto">
              {loading ? (
                <div className="p-4 text-sm text-gray-600">Carregando eletricistas...</div>
              ) : error ? (
                <div className="p-4 text-sm text-red-700 bg-red-50">{error}</div>
              ) : filtrados.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">
                  {eletricistas.length === 0 
                    ? 'Nenhum eletricista cadastrado no sistema.' 
                    : 'Nenhum eletricista disponível. Todos já estão em equipes ativas.'}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filtrados.map(eletricista => {
                    const isSelected = selecionados.includes(eletricista.id);
                    const { emOutraEquipe, nomeEquipe } = isEletricistaEmOutraEquipe(eletricista.id);
                    const isDisabled = emOutraEquipe && !isSelected && !editingEquipeId;
                    
                    return (
                      <li 
                        key={eletricista.id} 
                        className={`flex items-center justify-between p-3 transition-colors ${
                          isDisabled ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-medium text-gray-900">
                              {eletricista.name || 'Sem nome'}
                            </div>
                            {isSelected && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                ✓ Selecionado
                              </span>
                            )}
                            {isDisabled && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                                Em outra equipe
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {eletricista.email || 'Sem email'} • {eletricista.role || 'Eletricista'}
                          </div>
                          {isDisabled && nomeEquipe && (
                            <div className="text-xs text-orange-600 mt-1">
                              Equipe: {nomeEquipe}
                            </div>
                          )}
                        </div>
                        <label 
                          className={`inline-flex items-center gap-2 text-sm ${
                            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && alternarSelecionado(eletricista.id)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <span className={isSelected ? 'text-green-700 font-semibold' : isDisabled ? 'text-gray-400' : 'text-gray-700'}>
                            {isSelected ? 'Selecionado' : isDisabled ? 'Indisponível' : 'Selecionar'}
                          </span>
                        </label>
                      </li>
                    );
                  })}
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
<<<<<<< HEAD
                      <button onClick={() => abrirDialogRenomear(eq)} className="px-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50">Renomear</button>
                      <button onClick={() => abrirDialogExcluir(eq.id)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Excluir</button>
=======
                      <button onClick={() => renomearEquipe(eq.id)} className="px-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50">Renomear</button>
                      <button onClick={() => excluirEquipe(eq.id)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Excluir</button>
>>>>>>> 478241a18130cffdb1e72d234262f5f84b2e45a1
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
<<<<<<< HEAD

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🗑️ Excluir Equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a equipe <strong>"{equipeParaExcluir?.nome}"</strong>?
              <br /><br />
              Esta ação não pode ser desfeita. Todos os membros da equipe ficarão disponíveis novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setEquipeParaExcluir(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={excluirEquipe}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Excluindo...' : 'Excluir Equipe'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Renomear Equipe */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✏️ Renomear Equipe</DialogTitle>
            <DialogDescription>
              Informe o novo nome para a equipe <strong>"{equipeParaRenomear?.nome}"</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Nome da equipe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  renomearEquipe();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowRenameDialog(false);
                setEquipeParaRenomear(null);
                setNovoNome('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={renomearEquipe}
              disabled={loading || !novoNome.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
=======
>>>>>>> 478241a18130cffdb1e72d234262f5f84b2e45a1
    </div>
  );
};

export default ModalEquipesDeObra;


