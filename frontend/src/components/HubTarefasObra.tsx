import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { axiosApiService } from '../services/axiosApi';
import { AuthContext } from '../contexts/AuthContext';

// Types
interface Obra {
  id: string;
  nomeObra: string;
  clienteNome: string;
  endereco?: string;
  descricao?: string;
  dataPrevistaInicio?: string;
  dataPrevistaFim?: string;
  progresso: number;
}

interface TarefaObra {
  id: string;
  descricao: string;
  atribuidoA?: string;
  atribuidoNome?: string;
  progresso: number;
  dataPrevista?: string;
  dataConclusaoReal?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  registrosAtividade: RegistroAtividade[];
}

interface RegistroAtividade {
  id: string;
  tarefaId: string;
  dataRegistro: string;
  descricaoAtividade: string;
  horasTrabalhadas: number;
  observacoes?: string;
  imagens: string[];
  createdAt: string;
  eletricistaNome?: string;
}

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HubTarefasObraProps {
  obraId: string;
  onClose: () => void;
}

// Icons
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HubTarefasObra: React.FC<HubTarefasObraProps> = ({ obraId, onClose }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [obra, setObra] = useState<Obra | null>(null);
  const [tarefas, setTarefas] = useState<TarefaObra[]>([]);
  const [eletricistas, setEletricistas] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Nova Tarefa
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false);
  const [formTarefa, setFormTarefa] = useState({
    descricao: '',
    atribuidoA: '',
    dataPrevista: '',
    observacoes: ''
  });

  // Modal de Edição de Tarefa
  const [modalEditarTarefa, setModalEditarTarefa] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<TarefaObra | null>(null);

  // Modal de Visualização de Registro
  const [modalRegistro, setModalRegistro] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<RegistroAtividade | null>(null);

  // Modal de Imagens
  const [modalImagens, setModalImagens] = useState(false);
  const [imagensVisualizacao, setImagensVisualizacao] = useState<string[]>([]);
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    carregarDados();
  }, [obraId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarObra(),
        carregarTarefas(),
        carregarEletricistas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarObra = async () => {
    try {
      const response = await axiosApiService.get(`/api/obras/${obraId}`);
      setObra(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar obra:', error);
      toast.error('Erro ao carregar obra');
    }
  };

  const carregarTarefas = async () => {
    try {
      const response = await axiosApiService.get(`/api/obras/${obraId}/tarefas`);
      setTarefas(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    }
  };

  const carregarEletricistas = async () => {
    try {
      const response = await axiosApiService.get('/api/configuracoes/usuarios?role=eletricista');
      setEletricistas(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar eletricistas:', error);
    }
  };

  const handleCriarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTarefa.descricao) {
      toast.error('Descrição da tarefa é obrigatória');
      return;
    }

    try {
      await axiosApiService.post('/api/obras/tarefas', {
        obraId,
        ...formTarefa
      });
      toast.success('✅ Tarefa criada com sucesso!');
      setModalNovaTarefa(false);
      setFormTarefa({ descricao: '', atribuidoA: '', dataPrevista: '', observacoes: '' });
      carregarTarefas();
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      toast.error(error?.response?.data?.error || 'Erro ao criar tarefa');
    }
  };

  const handleAtualizarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tarefaEditando) return;

    try {
      await axiosApiService.put(`/api/obras/tarefas/${tarefaEditando.id}`, {
        descricao: tarefaEditando.descricao,
        atribuidoA: tarefaEditando.atribuidoA || null,
        dataPrevista: tarefaEditando.dataPrevista || null,
        observacoes: tarefaEditando.observacoes || null,
        progresso: tarefaEditando.progresso
      });
      toast.success('✅ Tarefa atualizada com sucesso!');
      setModalEditarTarefa(false);
      setTarefaEditando(null);
      carregarTarefas();
    } catch (error: any) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error(error?.response?.data?.error || 'Erro ao atualizar tarefa');
    }
  };

  const handleExcluirTarefa = async (tarefaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await axiosApiService.delete(`/api/obras/tarefas/${tarefaId}`);
      toast.success('✅ Tarefa excluída com sucesso!');
      carregarTarefas();
    } catch (error: any) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error(error?.response?.data?.error || 'Erro ao excluir tarefa');
    }
  };

  const abrirModalEditarTarefa = (tarefa: TarefaObra) => {
    setTarefaEditando(tarefa);
    setModalEditarTarefa(true);
  };

  const abrirModalRegistro = (registro: RegistroAtividade) => {
    setRegistroSelecionado(registro);
    setModalRegistro(true);
  };

  const abrirModalImagens = (imagens: string[]) => {
    setImagensVisualizacao(imagens);
    setImagemAtual(0);
    setModalImagens(true);
  };

  const proximaImagem = () => {
    setImagemAtual((prev) => (prev + 1) % imagensVisualizacao.length);
  };

  const imagemAnterior = () => {
    setImagemAtual((prev) => (prev - 1 + imagensVisualizacao.length) % imagensVisualizacao.length);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Carregando dados da obra...</p>
        </div>
      </div>
    );
  }

  if (!obra) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-red-600 font-semibold mb-4">Obra não encontrada</p>
          <button onClick={onClose} className="btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Principal - Hub de Tarefas */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden my-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{obra.nomeObra}</h2>
                <div className="space-y-1 text-orange-50">
                  <p className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-medium">Cliente:</span> {obra.clienteNome}
                  </p>
                  {obra.endereco && (
                    <p className="text-sm">📍 {obra.endereco}</p>
                  )}
                  {obra.dataPrevistaInicio && obra.dataPrevistaFim && (
                    <p className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4" />
                      {new Date(obra.dataPrevistaInicio).toLocaleDateString('pt-BR')} até {new Date(obra.dataPrevistaFim).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Progresso Geral */}
            <div className="mt-4 bg-white/20 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">Progresso Geral da Obra</span>
                <span className="text-white font-bold text-xl">{obra.progresso}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all shadow-lg"
                  style={{ width: `${obra.progresso}%` }}
                />
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8 overflow-y-auto max-h-[calc(95vh-280px)]">
            {/* Descrição da Obra */}
            {obra.descricao && (
              <div className="card-primary mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-2">Descrição da Obra</h3>
                <p className="text-gray-700 dark:text-dark-text-secondary whitespace-pre-wrap">{obra.descricao}</p>
              </div>
            )}

            {/* Header de Tarefas */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">Tarefas da Obra</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
                  {tarefas.length} {tarefas.length === 1 ? 'tarefa' : 'tarefas'} cadastradas
                </p>
              </div>
              <button
                onClick={() => setModalNovaTarefa(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Nova Tarefa
              </button>
            </div>

            {/* Lista de Tarefas */}
            {tarefas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-dark-card rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border">
                <p className="text-gray-500 dark:text-dark-text-secondary mb-4">Nenhuma tarefa cadastrada ainda</p>
                <button
                  onClick={() => setModalNovaTarefa(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Criar primeira tarefa
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tarefas.map((tarefa) => (
                  <div key={tarefa.id} className="card-secondary border-l-4 border-orange-500">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-dark-text mb-1">{tarefa.descricao}</h4>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                          {tarefa.atribuidoNome && (
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              {tarefa.atribuidoNome}
                            </span>
                          )}
                          {tarefa.dataPrevista && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {new Date(tarefa.dataPrevista).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {tarefa.dataConclusaoReal && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircleIcon className="w-4 h-4" />
                              Concluída em {new Date(tarefa.dataConclusaoReal).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => abrirModalEditarTarefa(tarefa)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar tarefa"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleExcluirTarefa(tarefa.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir tarefa"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progresso da Tarefa */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-dark-text-secondary">Progresso</span>
                        <span className="font-bold text-gray-900 dark:text-dark-text">{tarefa.progresso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${tarefa.progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Observações */}
                    {tarefa.observacoes && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-300">
                          <strong>Observações:</strong> {tarefa.observacoes}
                        </p>
                      </div>
                    )}

                    {/* Registros de Atividade */}
                    {tarefa.registrosAtividade && tarefa.registrosAtividade.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 dark:border-dark-border pt-4">
                        <h5 className="font-semibold text-gray-900 dark:text-dark-text mb-3 flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          Registros de Atividade ({tarefa.registrosAtividade.length})
                        </h5>
                        <div className="space-y-3">
                          {tarefa.registrosAtividade.map((registro) => (
                            <div key={registro.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-dark-text">
                                    {registro.descricaoAtividade}
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600 dark:text-dark-text-secondary">
                                    <span>{new Date(registro.dataRegistro).toLocaleDateString('pt-BR')}</span>
                                    <span>⏱️ {registro.horasTrabalhadas}h trabalhadas</span>
                                    {registro.imagens.length > 0 && (
                                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                        <PhotoIcon className="w-4 h-4" />
                                        {registro.imagens.length} {registro.imagens.length === 1 ? 'foto' : 'fotos'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => abrirModalRegistro(registro)}
                                  className="ml-2 p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Ver detalhes"
                                >
                                  <EyeIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nova Tarefa */}
      {modalNovaTarefa && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Nova Tarefa</h3>
              <button
                onClick={() => setModalNovaTarefa(false)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <form onSubmit={handleCriarTarefa} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Descrição da Tarefa *
                </label>
                <textarea
                  value={formTarefa.descricao}
                  onChange={(e) => setFormTarefa({ ...formTarefa, descricao: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                  placeholder="Descreva o que precisa ser feito..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Atribuir a Eletricista
                </label>
                <select
                  value={formTarefa.atribuidoA}
                  onChange={(e) => setFormTarefa({ ...formTarefa, atribuidoA: e.target.value })}
                  className="select-field"
                >
                  <option value="">Não atribuído</option>
                  {eletricistas.map((eletricista) => (
                    <option key={eletricista.id} value={eletricista.id}>
                      {eletricista.name} ({eletricista.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Data Prevista
                </label>
                <input
                  type="date"
                  value={formTarefa.dataPrevista}
                  onChange={(e) => setFormTarefa({ ...formTarefa, dataPrevista: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Observações
                </label>
                <textarea
                  value={formTarefa.observacoes}
                  onChange={(e) => setFormTarefa({ ...formTarefa, observacoes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Criar Tarefa
                </button>
                <button type="button" onClick={() => setModalNovaTarefa(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Tarefa */}
      {modalEditarTarefa && tarefaEditando && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Editar Tarefa</h3>
              <button
                onClick={() => {
                  setModalEditarTarefa(false);
                  setTarefaEditando(null);
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <form onSubmit={handleAtualizarTarefa} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Descrição da Tarefa *
                </label>
                <textarea
                  value={tarefaEditando.descricao}
                  onChange={(e) => setTarefaEditando({ ...tarefaEditando, descricao: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Atribuir a Eletricista
                </label>
                <select
                  value={tarefaEditando.atribuidoA || ''}
                  onChange={(e) => setTarefaEditando({ ...tarefaEditando, atribuidoA: e.target.value })}
                  className="select-field"
                >
                  <option value="">Não atribuído</option>
                  {eletricistas.map((eletricista) => (
                    <option key={eletricista.id} value={eletricista.id}>
                      {eletricista.name} ({eletricista.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Data Prevista
                </label>
                <input
                  type="date"
                  value={tarefaEditando.dataPrevista ? new Date(tarefaEditando.dataPrevista).toISOString().split('T')[0] : ''}
                  onChange={(e) => setTarefaEditando({ ...tarefaEditando, dataPrevista: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Progresso (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tarefaEditando.progresso}
                  onChange={(e) => setTarefaEditando({ ...tarefaEditando, progresso: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Observações
                </label>
                <textarea
                  value={tarefaEditando.observacoes || ''}
                  onChange={(e) => setTarefaEditando({ ...tarefaEditando, observacoes: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarTarefa(false);
                    setTarefaEditando(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Registro */}
      {modalRegistro && registroSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Detalhes do Registro</h3>
              <button
                onClick={() => {
                  setModalRegistro(false);
                  setRegistroSelecionado(null);
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary mb-1">Data do Registro</h4>
                <p className="text-lg text-gray-900 dark:text-dark-text">
                  {new Date(registroSelecionado.dataRegistro).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary mb-1">Horas Trabalhadas</h4>
                <p className="text-lg text-gray-900 dark:text-dark-text">⏱️ {registroSelecionado.horasTrabalhadas} horas</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary mb-2">Atividades Realizadas</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-dark-text whitespace-pre-wrap">
                    {registroSelecionado.descricaoAtividade}
                  </p>
                </div>
              </div>

              {registroSelecionado.observacoes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary mb-2">Observações</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-900 dark:text-blue-300 whitespace-pre-wrap">
                      {registroSelecionado.observacoes}
                    </p>
                  </div>
                </div>
              )}

              {registroSelecionado.imagens && registroSelecionado.imagens.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary mb-3">
                    Fotos ({registroSelecionado.imagens.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {registroSelecionado.imagens.map((imagem, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-4 hover:ring-orange-500 transition-all"
                        onClick={() => abrirModalImagens(registroSelecionado.imagens)}
                      >
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${imagem}`}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setModalRegistro(false);
                    setRegistroSelecionado(null);
                  }}
                  className="btn-primary w-full"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Imagens (Galeria) */}
      {modalImagens && imagensVisualizacao.length > 0 && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[70] p-4">
          <button
            onClick={() => setModalImagens(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          {imagensVisualizacao.length > 1 && (
            <>
              <button
                onClick={imagemAnterior}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={proximaImagem}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="max-w-6xl max-h-[90vh] flex flex-col items-center">
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${imagensVisualizacao[imagemAtual]}`}
              alt={`Imagem ${imagemAtual + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {imagensVisualizacao.length > 1 && (
              <p className="text-white mt-4 text-lg font-semibold">
                {imagemAtual + 1} / {imagensVisualizacao.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HubTarefasObra;

