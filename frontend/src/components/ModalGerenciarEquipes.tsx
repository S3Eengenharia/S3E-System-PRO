import React, { useState, useEffect } from 'react';
import { useEquipes, type Equipe, type EquipeData, type EstatisticasEquipes } from '../hooks/useEquipes';
import { useAlocacoes } from '../hooks/useAlocacoes';

// Ícones
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>;
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;

const TIPO_EQUIPE_COLORS = {
  MONTAGEM: 'bg-blue-500',
  MANUTENCAO: 'bg-green-500',
  INSTALACAO: 'bg-purple-500'
};

const TIPO_EQUIPE_BG = {
  MONTAGEM: 'bg-blue-50',
  MANUTENCAO: 'bg-green-50',
  INSTALACAO: 'bg-purple-50'
};

const TIPO_EQUIPE_TEXT = {
  MONTAGEM: 'text-blue-700',
  MANUTENCAO: 'text-green-700',
  INSTALACAO: 'text-purple-700'
};

const TIPO_EQUIPE_BORDER = {
  MONTAGEM: 'border-blue-200',
  MANUTENCAO: 'border-green-200',
  INSTALACAO: 'border-purple-200'
};

interface ModalGerenciarEquipesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ModalGerenciarEquipes: React.FC<ModalGerenciarEquipesProps> = ({ isOpen, onClose }) => {
  const { 
    equipes, 
    estatisticas, 
    loading, 
    error,
    fetchEquipes, 
    criarEquipe, 
    atualizarEquipe, 
    desativarEquipe,
    adicionarMembro,
    removerMembro
  } = useEquipes();
  
  const { alocacoes } = useAlocacoes();
  const [equipeExpandida, setEquipeExpandida] = useState<string | null>(null);
  const [equipeSelecionadaParaEdicao, setEquipeSelecionadaParaEdicao] = useState<Equipe | null>(null);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<Usuario[]>([]);
  const [membrosSelecionados, setMembrosSelecionados] = useState<string[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [salvandoEquipe, setSalvandoEquipe] = useState(false);

  // Buscar usuários disponíveis quando abrir o modal de edição
  useEffect(() => {
    if (equipeSelecionadaParaEdicao) {
      fetchUsuariosDisponiveis();
      // Converter membros de EquipeMembro[] para string[] (IDs)
      setMembrosSelecionados(equipeSelecionadaParaEdicao.membros.map(membro => membro.id));
    }
  }, [equipeSelecionadaParaEdicao]);

  const fetchUsuariosDisponiveis = async () => {
    try {
      setLoadingUsuarios(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuariosDisponiveis(data.users || data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleToggleExpandir = (equipeId: string) => {
    setEquipeExpandida(equipeExpandida === equipeId ? null : equipeId);
  };

  const handleAbrirEdicao = (equipe: Equipe) => {
    setEquipeSelecionadaParaEdicao(equipe);
  };

  const handleFecharEdicao = () => {
    setEquipeSelecionadaParaEdicao(null);
    setMembrosSelecionados([]);
  };

  const handleToggleMembro = (userId: string) => {
    if (membrosSelecionados.includes(userId)) {
      setMembrosSelecionados(membrosSelecionados.filter(id => id !== userId));
    } else {
      if (membrosSelecionados.length < 2) {
        setMembrosSelecionados([...membrosSelecionados, userId]);
      } else {
        alert('Cada equipe deve ter exatamente 2 membros');
      }
    }
  };

  const handleSalvarEquipe = async () => {
    if (!equipeSelecionadaParaEdicao) return;

    if (membrosSelecionados.length !== 2) {
      alert('Cada equipe deve ter exatamente 2 membros');
      return;
    }

    try {
      setSalvandoEquipe(true);
      
      // Atualizar dados da equipe
      const sucesso = await atualizarEquipe(equipeSelecionadaParaEdicao.id, {
        nome: equipeSelecionadaParaEdicao.nome,
        tipo: equipeSelecionadaParaEdicao.tipo,
        descricao: equipeSelecionadaParaEdicao.descricao || undefined,
        ativa: equipeSelecionadaParaEdicao.ativa
      });

      if (sucesso) {
        alert('Equipe atualizada com sucesso!');
        handleFecharEdicao();
      } else {
        alert('Erro ao atualizar equipe');
      }
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      alert('Erro ao salvar equipe');
    } finally {
      setSalvandoEquipe(false);
    }
  };

  // Calcular estatísticas
  const alocacoesDoMes = alocacoes.filter(a => a.status === 'Planejada' || a.status === 'EmAndamento');

  // Calcular próxima disponibilidade
  const proximaDisponibilidade = () => {
    const datasDisponiveis: Date[] = [];
    
    equipes.forEach(equipe => {
      const alocacoesEquipe = alocacoes.filter(a => 
        a.equipe.id === equipe.id && (a.status === 'Planejada' || a.status === 'EmAndamento')
      );

      if (alocacoesEquipe.length === 0) {
        datasDisponiveis.push(new Date());
      } else {
        const ultimaAlocacao = alocacoesEquipe.sort((a, b) => 
          new Date(b.dataFimPrevisto || a.dataInicio).getTime() - new Date(a.dataFimPrevisto || a.dataInicio).getTime()
        )[0];
        datasDisponiveis.push(new Date(ultimaAlocacao.dataFimPrevisto || ultimaAlocacao.dataInicio));
      }
    });

    if (datasDisponiveis.length === 0) return null;
    return new Date(Math.min(...datasDisponiveis.map(d => d.getTime())));
  };

  const proximaData = proximaDisponibilidade();

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-blue-light rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-brand-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-gray-900">Gerenciar Equipes Operacionais</h2>
                <p className="text-sm text-brand-gray-600">Gerencie a composição das equipes de campo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-brand-gray-400 hover:bg-brand-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="p-6 bg-brand-gray-50 border-b border-brand-gray-200">
            <h3 className="text-sm font-semibold text-brand-gray-700 mb-3 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Estatísticas Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-brand-gray-200">
                <div className="text-2xl font-bold text-brand-blue">{estatisticas?.total || 0}</div>
                <div className="text-xs text-brand-gray-600 mt-1">Total de Equipes</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-brand-gray-200">
                <div className="text-2xl font-bold text-green-600">{estatisticas?.disponiveis || 0}</div>
                <div className="text-xs text-brand-gray-600 mt-1">Equipes Disponíveis</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-brand-gray-200">
                <div className="text-2xl font-bold text-orange-600">{alocacoesDoMes.length}</div>
                <div className="text-xs text-brand-gray-600 mt-1">Alocações Ativas</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-brand-gray-200">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-brand-gray-500" />
                  <div className="text-sm font-semibold text-brand-gray-900">
                    {proximaData ? proximaData.toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                </div>
                <div className="text-xs text-brand-gray-600 mt-1">Próxima Disponibilidade</div>
              </div>
            </div>
          </div>

          {/* Lista de Equipes */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-sm font-semibold text-brand-gray-700 mb-4">Equipes Operacionais (3 fixas)</h3>
            
            {loading && (
              <div className="text-center py-8 text-brand-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-2"></div>
                Carregando equipes...
              </div>
            )}

            <div className="space-y-4">
              {equipes.map((equipe) => {
                const isExpandida = equipeExpandida === equipe.id;
                const alocacaoAtual = alocacoes.find(
                  a => a.equipe.id === equipe.id && (a.status === 'Planejada' || a.status === 'EmAndamento')
                );

                return (
                  <div
                    key={equipe.id}
                    className={`border-2 rounded-xl overflow-hidden transition-all ${
                      TIPO_EQUIPE_BORDER[equipe.tipo]
                    } ${TIPO_EQUIPE_BG[equipe.tipo]}`}
                  >
                    {/* Header do Card */}
                    <div
                      onClick={() => handleToggleExpandir(equipe.id)}
                      className="p-4 cursor-pointer hover:bg-opacity-80 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg ${TIPO_EQUIPE_COLORS[equipe.tipo]} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                            {equipe.nome.charAt(equipe.nome.length - 1)}
                          </div>
                          <div>
                            <h4 className={`text-lg font-bold ${TIPO_EQUIPE_TEXT[equipe.tipo]}`}>
                              {equipe.nome}
                            </h4>
                            <p className="text-sm text-brand-gray-600 flex items-center gap-2">
                              <span className="font-semibold">{equipe.tipo}</span>
                              <span>•</span>
                              <span>{equipe.membros?.length || 0} membros</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {alocacaoAtual && (
                            <div className="text-right">
                              <div className="text-xs text-brand-gray-600">Alocada em:</div>
                              <div className="text-sm font-semibold text-brand-gray-900">
                                {alocacaoAtual.projeto.titulo}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAbrirEdicao(equipe);
                            }}
                            className={`p-2 ${TIPO_EQUIPE_COLORS[equipe.tipo]} text-white rounded-lg hover:opacity-90 transition-opacity`}
                            title="Editar membros"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <div className={`transform transition-transform ${isExpandida ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo Expandido */}
                    {isExpandida && (
                      <div className="px-4 pb-4 bg-white bg-opacity-50">
                        <div className="border-t border-brand-gray-200 pt-4">
                          <h5 className="text-sm font-semibold text-brand-gray-700 mb-3">Membros da Equipe:</h5>
                          
                          {equipe.membros && equipe.membros.length > 0 ? (
                            <div className="space-y-2">
                              {equipe.membros.map((membro, index) => (
                                <div
                                  key={membro.id}
                                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-brand-gray-200"
                                >
                                  <div className="w-10 h-10 rounded-full bg-brand-gray-200 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-brand-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-brand-gray-900">
                                      {membro.nome}
                                    </div>
                                    <div className="text-xs text-brand-gray-500">{membro.funcao}</div>
                                  </div>
                                  <div className="text-xs font-semibold text-brand-gray-600">
                                    {index === 0 ? 'Líder' : 'Membro'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-brand-gray-500">
                              Nenhum membro alocado
                            </div>
                          )}

                          {alocacaoAtual && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm font-semibold text-blue-900 mb-1">Alocação Atual</div>
                              <div className="text-xs text-blue-700">
                                <div><strong>Projeto:</strong> {alocacaoAtual.projeto.titulo}</div>
                                <div><strong>Cliente:</strong> {alocacaoAtual.projeto.cliente}</div>
                                <div>
                                  <strong>Período:</strong>{' '}
                                  {new Date(alocacaoAtual.dataInicio).toLocaleDateString('pt-BR')} até{' '}
                                  {new Date(alocacaoAtual.dataFimPrevisto).toLocaleDateString('pt-BR')}
                                </div>
                                <div><strong>Status:</strong> {alocacaoAtual.status}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-brand-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-brand-gray-100 text-brand-gray-800 font-semibold rounded-lg hover:bg-brand-gray-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Edição de Equipe */}
      {equipeSelecionadaParaEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-brand-gray-200">
              <h3 className="text-xl font-bold text-brand-gray-900">
                Editar Membros - {equipeSelecionadaParaEdicao.nome}
              </h3>
              <p className="text-sm text-brand-gray-600 mt-1">
                Selecione exatamente 2 membros para esta equipe ({equipeSelecionadaParaEdicao.tipo})
              </p>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingUsuarios ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-2"></div>
                  <p className="text-brand-gray-500">Carregando usuários...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-900">
                      <strong>{membrosSelecionados.length}/2</strong> membros selecionados
                    </div>
                  </div>

                  <div className="space-y-2">
                    {usuariosDisponiveis.map((usuario) => {
                      const isSelected = membrosSelecionados.includes(usuario.id);
                      
                      return (
                        <button
                          key={usuario.id}
                          onClick={() => handleToggleMembro(usuario.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-brand-blue bg-brand-blue-light'
                              : 'border-brand-gray-200 bg-white hover:border-brand-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-brand-blue text-white' : 'bg-brand-gray-200 text-brand-gray-600'
                          }`}>
                            {isSelected ? (
                              <CheckCircleIcon className="w-6 h-6" />
                            ) : (
                              <UserIcon className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-brand-gray-900">{usuario.name}</div>
                            <div className="text-sm text-brand-gray-600">{usuario.email}</div>
                            <div className="text-xs text-brand-gray-500 mt-1">
                              <span className="px-2 py-0.5 bg-brand-gray-100 rounded">
                                {usuario.role}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="text-xs font-semibold text-brand-blue">
                              Selecionado
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
              <button
                onClick={handleFecharEdicao}
                className="px-6 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEquipe}
                disabled={membrosSelecionados.length !== 2 || salvandoEquipe}
                className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvandoEquipe ? 'Salvando...' : 'Salvar Equipe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalGerenciarEquipes;

