import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';
import { etapasAdminService, type EtapaAdmin, type ListaEtapasResponse } from '../services/etapasAdminService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

type ProjetoStatus = 'PROPOSTA' | 'VALIDADO' | 'APROVADO' | 'EXECUCAO' | 'CONCLUIDO';

interface ClienteRef { id: string; nome: string }
interface OrcamentoItemRef { id: string; material?: { nome: string; sku: string } | null; kit?: { nome: string } | null; quantidade?: number; subtotal?: number }
interface OrcamentoRef { id: string; status: string; precoVenda?: number; items?: OrcamentoItemRef[] }

export interface ProjetoDetalhe {
  id: string;
  titulo: string;
  descricao?: string | null;
  cliente: ClienteRef;
  orcamento?: OrcamentoRef;
  status: ProjetoStatus;
  valorTotal?: number;
  createdAt?: string;
}

type Aba = 'Visão Geral' | 'Materiais' | 'EtapasAdmin' | 'Kanban' | 'Qualidade';

interface ModalVizualizacaoProjetoProps {
  projeto: ProjetoDetalhe;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: Aba;
  onRefresh?: () => void; // chamado após alterações (ex: mudança de status)
}

const TABS: Aba[] = ['Visão Geral', 'Materiais', 'EtapasAdmin', 'Kanban', 'Qualidade'];

const ModalVizualizacaoProjeto: React.FC<ModalVizualizacaoProjetoProps> = ({ projeto, isOpen, onClose, initialTab = 'Visão Geral', onRefresh }) => {
  const [activeTab, setActiveTab] = useState<Aba>(initialTab);
  const [loadingAcao, setLoadingAcao] = useState(false);

  // Etapas Admin
  const [etapasResp, setEtapasResp] = useState<ListaEtapasResponse | null>(null);
  const [loadingEtapas, setLoadingEtapas] = useState(false);
  const [erroEtapas, setErroEtapas] = useState<string | null>(null);

  // Modal adiar
  const [adiarAberto, setAdiarAberto] = useState<{ etapa: EtapaAdmin | null; novaData: string; justificativa: string }>({ etapa: null, novaData: '', justificativa: '' });

  // Tasks Kanban
  interface Task {
    id: string;
    titulo: string;
    descricao: string;
    status: 'A Fazer' | 'Em Andamento' | 'Concluído';
    prazo: string;
    responsavelId?: string;
    responsavelNome?: string;
  }
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskEditando, setTaskEditando] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({ titulo: '', descricao: '', prazo: '', responsavelId: '', status: 'A Fazer' as 'A Fazer' | 'Em Andamento' | 'Concluído' });
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<any[]>([]);

  // Documentos
  const [documentos, setDocumentos] = useState<Array<{ id: string; nome: string; tipo: string; url: string }>>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // AlertDialog
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    title: '',
    description: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (isOpen && activeTab === 'EtapasAdmin') {
      carregarEtapas();
    }
    if (isOpen && activeTab === 'Kanban') {
      carregarUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, projeto?.id]);

  async function carregarUsuarios() {
    try {
      const response = await axiosApiService.get('/api/configuracoes/usuarios');
      const todosUsuarios = response.data || response || [];
      // Filtrar apenas roles técnicas: admin, gerente, engenheiro, orcamentista
      const usuariosFiltrados = Array.isArray(todosUsuarios) 
        ? todosUsuarios.filter((u: any) => 
            ['admin', 'gerente', 'engenheiro', 'orcamentista'].includes(u.role?.toLowerCase())
          )
        : [];
      setUsuariosDisponiveis(usuariosFiltrados);
      console.log('👥 Usuários técnicos carregados:', usuariosFiltrados.length);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  async function carregarEtapas() {
    try {
      setLoadingEtapas(true);
      setErroEtapas(null);
      const res = await etapasAdminService.listar(projeto.id);
      if (res.success) {
        setEtapasResp(res.data);
      } else {
        setErroEtapas('Falha ao carregar etapas');
      }
    } catch (e) {
      setErroEtapas('Erro ao carregar etapas');
    } finally {
      setLoadingEtapas(false);
    }
  }

  const podeGerarObra = useMemo(() => projeto.status === 'APROVADO', [projeto.status]);
  const podeValidar = useMemo(() => projeto.status === 'PROPOSTA', [projeto.status]);
  const podeAprovar = useMemo(() => projeto.status === 'VALIDADO', [projeto.status]);

  async function handleValidarProjeto() {
    setAlertConfig({
      title: '✅ Validar Proposta',
      description: 'Deseja validar esta proposta tecnicamente? Após validada, poderá ser enviada para aprovação do cliente.',
      onConfirm: async () => {
        try {
          setLoadingAcao(true);
          await axiosApiService.put(`${ENDPOINTS.PROJETOS}/${projeto.id}/status`, { status: 'VALIDADO' });
          toast.success('✅ Proposta validada com sucesso!');
          if (onRefresh) onRefresh();
        } catch (error) {
          toast.error('❌ Erro ao validar proposta');
        } finally {
          setLoadingAcao(false);
        }
      }
    });
    setAlertOpen(true);
  }

  async function handleAprovarProjeto() {
    setAlertConfig({
      title: '🎉 Aprovar Projeto',
      description: 'Deseja aprovar este projeto? Isso reservará os materiais do estoque e permitirá iniciar a obra.',
      onConfirm: async () => {
        try {
          setLoadingAcao(true);
          const response = await axiosApiService.put(`${ENDPOINTS.PROJETOS}/${projeto.id}/status`, { status: 'APROVADO' });
          
          if (response.success) {
            toast.success('🎉 Projeto aprovado com sucesso!', {
              description: 'Materiais reservados do estoque. O projeto está pronto para iniciar a obra.'
            });
            if (onRefresh) onRefresh();
          } else {
            // Erro pode conter informação de items frios
            const mensagemErro = response.error || 'Erro ao aprovar projeto';
            
            // Verificar se é erro de items frios
            if (mensagemErro.includes('BLOQUEADA') || mensagemErro.includes('sem estoque')) {
              toast.error('⚠️ Aprovação Bloqueada!', {
                description: mensagemErro,
                duration: 10000
              });
            } else {
              toast.error('❌ Erro ao aprovar projeto', {
                description: mensagemErro
              });
            }
          }
        } catch (error: any) {
          const mensagemErro = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Erro desconhecido';
          
          // Verificar se é erro de items frios
          if (mensagemErro.includes('BLOQUEADA') || mensagemErro.includes('sem estoque')) {
            toast.error('⚠️ Aprovação Bloqueada!', {
              description: mensagemErro,
              duration: 10000,
              action: {
                label: 'Ver Detalhes',
                onClick: () => {
                  alert(mensagemErro);
                }
              }
            });
          } else {
            toast.error('❌ Erro ao aprovar projeto', {
              description: mensagemErro
            });
          }
        } finally {
          setLoadingAcao(false);
        }
      }
    });
    setAlertOpen(true);
  }

  async function handleGerarObra() {
    try {
      setLoadingAcao(true);
      await axiosApiService.put(`${ENDPOINTS.PROJETOS}/${projeto.id}/status`, { status: 'EXECUCAO' });
      if (onRefresh) onRefresh();
      setActiveTab('EtapasAdmin');
      await carregarEtapas();
    } finally {
      setLoadingAcao(false);
    }
  }

  async function handleConcluirEtapa(etapa: EtapaAdmin) {
    await etapasAdminService.concluir(projeto.id, etapa.id);
    await carregarEtapas();
  }

  async function handleAdiarEnviar() {
    if (!adiarAberto.etapa) return;
    await etapasAdminService.estenderPrazo(
      projeto.id,
      adiarAberto.etapa.id,
      adiarAberto.novaData,
      adiarAberto.justificativa
    );
    setAdiarAberto({ etapa: null, novaData: '', justificativa: '' });
    await carregarEtapas();
  }

  // Funções de Tasks
  function handleAbrirModalTask(task?: Task) {
    if (task) {
      setTaskEditando(task);
      setTaskForm({
        titulo: task.titulo,
        descricao: task.descricao,
        prazo: task.prazo,
        responsavelId: task.responsavelId || '',
        status: task.status
      });
    } else {
      setTaskEditando(null);
      setTaskForm({ titulo: '', descricao: '', prazo: '', responsavelId: '', status: 'A Fazer' });
    }
    setTaskModalOpen(true);
  }

  function handleSalvarTask() {
    if (!taskForm.titulo || !taskForm.descricao || !taskForm.prazo) {
      toast.error('❌ Preencha todos os campos obrigatórios');
      return;
    }

    const usuario = usuariosDisponiveis.find(u => u.id === taskForm.responsavelId);

    if (taskEditando) {
      // Editar task existente
      setTasks(prev => prev.map(t => 
        t.id === taskEditando.id 
          ? { 
              ...t, 
              titulo: taskForm.titulo, 
              descricao: taskForm.descricao, 
              prazo: taskForm.prazo,
              responsavelId: taskForm.responsavelId,
              responsavelNome: usuario?.nome || '',
              status: taskForm.status
            }
          : t
      ));
    } else {
      // Criar nova task
      const novaTask: Task = {
        id: Date.now().toString(),
        titulo: taskForm.titulo,
        descricao: taskForm.descricao,
        prazo: taskForm.prazo,
        responsavelId: taskForm.responsavelId,
        responsavelNome: usuario?.nome || '',
        status: taskForm.status
      };
      setTasks(prev => [...prev, novaTask]);
    }

    setTaskModalOpen(false);
    setTaskEditando(null);
    setTaskForm({ titulo: '', descricao: '', prazo: '', responsavelId: '', status: 'A Fazer' });
  }

  function handleMoverTask(taskId: string, novoStatus: 'A Fazer' | 'Em Andamento' | 'Concluído') {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: novoStatus } : t));
  }

  function handleExcluirTask(taskId: string) {
    setAlertConfig({
      title: '🗑️ Excluir Tarefa',
      description: 'Deseja realmente excluir esta tarefa? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success('✅ Tarefa excluída com sucesso!');
      }
    });
    setAlertOpen(true);
  }

  // Calcular tempo decorrido desde criação da etapa
  function calcularTempoDecorrido(dataCriacao: string): { horas: number; atrasada: boolean; cor: string; texto: string } {
    const agora = new Date();
    const criacao = new Date(dataCriacao);
    const diferencaMs = agora.getTime() - criacao.getTime();
    const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
    const atrasada = horas > 24;
    
    let cor = 'text-green-600';
    let texto = `${horas}h`;
    
    if (horas > 24) {
      cor = 'text-red-600 font-bold';
      const dias = Math.floor(horas / 24);
      texto = `${dias}d ${horas % 24}h ⚠️`;
    } else if (horas > 18) {
      cor = 'text-orange-600';
    } else if (horas > 12) {
      cor = 'text-yellow-600';
    }
    
    return { horas, atrasada, cor, texto };
  }

  // Calcular progresso do projeto baseado em Etapas Admin + Tasks + Obras
  const progressoProjeto = useMemo(() => {
    // Etapas Admin concluídas
    const etapasTotal = etapasResp?.etapas?.length || 0;
    const etapasConcluidas = etapasResp?.etapas?.filter(e => e.concluida).length || 0;
    
    // Tasks concluídas
    const tasksTotal = tasks.length;
    const tasksConcluidas = tasks.filter(t => t.status === 'Concluído').length;
    
    // Obras concluídas (simulado - será integrado com o backend)
    // TODO: Buscar obras do backend quando integrado
    const obrasTotal = projeto.status === 'EXECUCAO' || projeto.status === 'CONCLUIDO' ? 1 : 0;
    const obrasConcluidas = projeto.status === 'CONCLUIDO' ? 1 : 0;
    
    // Calcular totais
    const totalItens = etapasTotal + tasksTotal + obrasTotal;
    const totalConcluidos = etapasConcluidas + tasksConcluidas + obrasConcluidas;
    
    const percentual = totalItens > 0 ? Math.round((totalConcluidos / totalItens) * 100) : 0;
    
    return {
      percentual,
      etapasTotal,
      etapasConcluidas,
      tasksTotal,
      tasksConcluidas,
      obrasTotal,
      obrasConcluidas,
      totalItens,
      totalConcluidos
    };
  }, [etapasResp, tasks, projeto.status]);

  async function handleIniciarObra() {
    setAlertConfig({
      title: '🚀 Iniciar Obra',
      description: 'Deseja iniciar a obra? Isso criará automaticamente uma nova entrada no Kanban de Obras na etapa Backlog.',
      onConfirm: async () => {
        try {
          setLoadingAcao(true);
          
          console.log('🚀 Iniciando obra para projeto:', projeto.id);
          
          // Verificar se já existe obra para este projeto
          try {
            const obraExistente = await axiosApiService.get(`/api/obras/projeto/${projeto.id}`);
            if (obraExistente && obraExistente.data) {
              toast.warning('⚠️ Já existe uma obra criada para este projeto!');
              setLoadingAcao(false);
              return;
            }
          } catch (err) {
            // Obra não existe, pode prosseguir
            console.log('✅ Nenhuma obra existente, criando nova...');
          }
          
          // Gerar obra automaticamente (backend já atualiza status do projeto)
          const obraData = {
            projetoId: projeto.id,
            nomeObra: projeto.titulo,
            dataPrevistaInicio: new Date().toISOString(),
            dataPrevistaFim: null
          };
          
          const response = await axiosApiService.post('/api/obras/gerar', obraData);
          
          console.log('✅ Obra criada:', response);
          
          toast.success('✅ Obra iniciada com sucesso! Acesse o Kanban de Obras (Backlog).');
          
          if (onRefresh) onRefresh();
          onClose();
        } catch (error: any) {
          console.error('❌ Erro ao iniciar obra:', error);
          const mensagem = error?.response?.data?.message || error?.message || 'Erro ao iniciar obra';
          toast.error(`❌ ${mensagem}`);
        } finally {
          setLoadingAcao(false);
        }
      }
    });
    setAlertOpen(true);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-7xl bg-white dark:bg-dark-card rounded-2xl shadow-strong overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-medium">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
          </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{projeto.titulo}</h2>
              <p className="text-sm text-white/80 mt-1">Cliente: {projeto.cliente?.nome}</p>
            </div>
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
          <div className="flex gap-2 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-medium' 
                    : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-dark-hover'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
          {activeTab === 'Visão Geral' && (
              <div className="space-y-6 animate-fade-in">
                {/* Cards de Informações Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Status do Projeto</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{projeto.status}</p>
                  </div>

                  {/* Valor Total */}
                  {projeto.valorTotal != null && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-soft">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Valor Total</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        R$ {projeto.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}

                  {/* Data de Criação */}
                  {projeto.createdAt && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-soft">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                </div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Data de Criação</h3>
                      </div>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                        {new Date(projeto.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card de Progresso do Projeto */}
                <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Progresso do Projeto
                    </h3>
                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {progressoProjeto.percentual}%
                    </span>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 rounded-full"
                        style={{ width: `${progressoProjeto.percentual}%` }}
                      />
                    </div>
                  </div>

                  {/* Detalhes do Progresso */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Etapas Admin */}
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Etapas Admin</div>
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                        {progressoProjeto.etapasConcluidas}/{progressoProjeto.etapasTotal}
                      </div>
                    </div>
                    
                    {/* Tasks */}
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tasks Kanban</div>
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                        {progressoProjeto.tasksConcluidas}/{progressoProjeto.tasksTotal}
                      </div>
                    </div>
                    
                    {/* Obras */}
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Obras</div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                        {progressoProjeto.obrasConcluidas}/{progressoProjeto.obrasTotal}
                      </div>
                    </div>
                  </div>

                  {/* Informação */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        O progresso é calculado com base em: <strong>Etapas Admin concluídas</strong> + <strong>Tasks concluídas</strong> + <strong>Obras concluídas</strong>
                      </span>
                    </p>
                  </div>
                </div>

                {/* Botão Validar Proposta */}
                {podeValidar && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📋 Proposta Pendente</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Este projeto está em fase de proposta. Valide tecnicamente antes de enviar para aprovação do cliente.
                        </p>
                      </div>
                  <button
                        onClick={handleValidarProjeto}
                    disabled={loadingAcao}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-medium font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                        {loadingAcao ? '⏳ Validando...' : '✅ Validar Proposta'}
                  </button>
                    </div>
                  </div>
                )}

                {/* Botão Aprovar Projeto */}
                {podeAprovar && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">✅ Proposta Validada</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          A proposta foi validada tecnicamente. Agora pode ser aprovada pelo cliente para gerar a venda.
                        </p>
              </div>
                      <button
                        onClick={handleAprovarProjeto}
                        disabled={loadingAcao}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-medium font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {loadingAcao ? '⏳ Aprovando...' : '🎉 Aprovar Projeto'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Botão Iniciar Obra */}
                {(podeGerarObra || projeto.status === 'VALIDADO') && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {podeGerarObra ? '🏗️ Iniciar Execução' : '🚧 Obra Pré-Aprovada'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {podeGerarObra 
                            ? 'O projeto foi aprovado e está pronto. Clique para iniciar a obra e criar entrada no Kanban de Obras.'
                            : 'O projeto foi validado. Aguarde aprovação do cliente para iniciar a obra.'}
                        </p>
                      </div>
                      <button
                        onClick={handleIniciarObra}
                        disabled={loadingAcao || !podeGerarObra}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-medium font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {loadingAcao ? '⏳ Iniciando...' : '🚀 INICIAR OBRA'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Links Rápidos e Documentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Links Rápidos */}
                  <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Links Rápidos
                    </h3>
                    <div className="space-y-3">
                      {projeto.orcamento && (
                        <a
                          href={`#orcamento-${projeto.orcamento.id}`}
                          className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                        >
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">Orçamento Vinculado</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Ver detalhes do orçamento</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => toast.info('📋 Navegando para página do cliente...')}
                        className="w-full flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                      >
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">Perfil do Cliente</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{projeto.cliente.nome}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Documentos Técnicos */}
                  <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Documentos
                      </h3>
                      <button
                        onClick={() => setUploadModalOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all font-semibold text-sm"
                      >
                        + Upload
                      </button>
                    </div>
                    {documentos.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum documento</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">ART, TRT, etc.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {documentos.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-bg rounded-lg">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="flex-1 text-sm text-gray-900 dark:text-white">{doc.nome}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{doc.tipo}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações do Cliente e Endereço */}
                <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Informações do Cliente e Local
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{projeto.cliente?.nome}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Endereço da Obra</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {(projeto as any).enderecoObra || 'Não informado'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cidade/Estado</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {(projeto as any).cidade || 'Não informado'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Responsável na Obra</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {(projeto as any).responsavelObra || 'Não atribuído'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descrição do Projeto */}
              {projeto.descricao && (
                  <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descrição do Projeto
                    </h3>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {projeto.descricao}
                    </div>
                  </div>
                )}

                {/* Informações do Orçamento */}
                {projeto.orcamento && (
                  <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Informações do Orçamento
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status do Orçamento</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{projeto.orcamento.status}</p>
                      </div>
                      {projeto.orcamento.precoVenda && (
                        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preço de Venda</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            R$ {projeto.orcamento.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                      {projeto.orcamento.items && (
                        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Itens</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{projeto.orcamento.items.length} itens</p>
                        </div>
                      )}
                    </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Materiais' && (
              <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Materiais do Projeto (BOM)
                  </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                      placeholder="🔍 Buscar materiais..."
                      className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-white"
                  />
                    <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all">
                    Localizar
                  </button>
                </div>
              </div>

                <div className="overflow-x-auto bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl shadow-soft">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-dark-bg border-b-2 border-gray-200 dark:border-dark-border">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Item</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">SKU</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Quantidade</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Subtotal</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Alocação</th>
                    </tr>
                  </thead>
                  <tbody>
                      {projeto.orcamento?.items?.map((i, idx) => (
                        <tr key={i.id} className="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                            {i.material?.nome || i.kit?.nome || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {i.material?.sku || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {i.quantidade ?? '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                            {i.subtotal != null ? `R$ ${i.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <select className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-white">
                            <option>Não alocado</option>
                            <option>Reservar do estoque</option>
                            <option>Solicitar compra</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                      {(!projeto.orcamento?.items || projeto.orcamento.items.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <p className="font-medium">Nenhum material cadastrado</p>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'EtapasAdmin' && (
              <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Etapas Administrativas
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toast.info('🔨 Funcionalidade de criar etapa será implementada em breve')} 
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Criar Etapa
                    </button>
                    <button 
                      onClick={carregarEtapas} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-medium"
                    >
                      🔄 Atualizar
                    </button>
                  </div>
              </div>

                {loadingEtapas && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Carregando etapas...</p>
                    </div>
                  </div>
                )}
                
                {erroEtapas && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                    <p className="text-red-800 dark:text-red-300 font-medium">⚠️ {erroEtapas}</p>
                  </div>
                )}

                {!loadingEtapas && !erroEtapas && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {etapasResp?.etapas.map((etapa) => {
                  const atrasada = etapa.atrasada;
                      const realizada = etapa.concluida;
                      const tempoDecorrido = calcularTempoDecorrido(etapa.dataCriacao || etapa.dataPrevista);
                      
                  return (
                        <div 
                          key={etapa.id} 
                          className={`rounded-2xl border-2 p-6 shadow-soft transition-all ${
                            atrasada && !realizada 
                              ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20' 
                              : realizada
                              ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900 dark:text-white">{etapa.nome || etapa.tipo}</h4>
                            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                              realizada 
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                                : atrasada 
                                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                                : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                            }`}>
                              {realizada ? '✓ Concluída' : atrasada ? '⚠ Atrasada' : '⏳ Pendente'}
                        </span>
                      </div>
                          <div className="space-y-2 mb-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(etapa.dataPrevista).toLocaleString('pt-BR')}
                            </div>
                            {!realizada && (
                              <div className={`text-sm flex items-center gap-2 ${tempoDecorrido.cor}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">⏱️ {tempoDecorrido.texto}</span>
                                {tempoDecorrido.atrasada && (
                                  <span className="text-xs bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-full">
                                    +24h
                                  </span>
                                )}
                              </div>
                            )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={realizada}
                              onClick={() => {
                                setAlertConfig({
                                  title: '✅ Concluir Etapa',
                                  description: `Deseja marcar a etapa "${etapa.nome || etapa.tipo}" como concluída?`,
                                  onConfirm: async () => {
                                    await handleConcluirEtapa(etapa);
                                    toast.success('✅ Etapa concluída com sucesso!');
                                  }
                                });
                                setAlertOpen(true);
                              }}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✓ Concluir
                        </button>
                        <button
                          disabled={realizada}
                          onClick={() => setAdiarAberto({ etapa, novaData: '', justificativa: '' })}
                              className="px-4 py-2 bg-white dark:bg-dark-card border-2 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-dark-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ⏰
                            </button>
                            <button
                              disabled={realizada}
                              onClick={() => toast.info('🔨 Editar etapa será implementado em breve')}
                              className="px-4 py-2 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-600 dark:text-gray-400 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✏️
                        </button>
                      </div>
                    </div>
                  );
                })}
                    {(!etapasResp?.etapas || etapasResp.etapas.length === 0) && (
                      <div className="col-span-3 text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
              </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma etapa administrativa cadastrada</p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}

          {activeTab === 'Kanban' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Tarefas do Projeto
                  </h3>
                  <button
                    onClick={() => handleAbrirModalTask()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-medium font-semibold flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nova Tarefa
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* A Fazer */}
                  <div className="bg-white dark:bg-dark-card border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">A Fazer</h4>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {tasks.filter(t => t.status === 'A Fazer').length}
                      </span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                      {tasks.filter(t => t.status === 'A Fazer').map(task => (
                        <div key={task.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 cursor-pointer hover:shadow-medium transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{task.titulo}</h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAbrirModalTask(task)}
                                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleExcluirTask(task.id)}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{task.descricao}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              📅 {new Date(task.prazo).toLocaleDateString('pt-BR')}
                            </span>
                            {task.responsavelNome && (
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-full font-medium">
                                👤 {task.responsavelNome.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleMoverTask(task.id, 'Em Andamento')}
                              className="flex-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-xs font-semibold"
                            >
                              → Iniciar
                            </button>
                          </div>
                  </div>
                ))}
                      {tasks.filter(t => t.status === 'A Fazer').length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                          Nenhuma tarefa
              </div>
                      )}
            </div>
                  </div>

                  {/* Em Andamento */}
                  <div className="bg-white dark:bg-dark-card border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Em Andamento</h4>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {tasks.filter(t => t.status === 'Em Andamento').length}
                      </span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                      {tasks.filter(t => t.status === 'Em Andamento').map(task => (
                        <div key={task.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 cursor-pointer hover:shadow-medium transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{task.titulo}</h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAbrirModalTask(task)}
                                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleExcluirTask(task.id)}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{task.descricao}</p>
                          <div className="flex items-center justify-between text-xs mb-3">
                            <span className="text-gray-600 dark:text-gray-400">
                              📅 {new Date(task.prazo).toLocaleDateString('pt-BR')}
                            </span>
                            {task.responsavelNome && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                                👤 {task.responsavelNome.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMoverTask(task.id, 'A Fazer')}
                              className="flex-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all text-xs font-semibold"
                            >
                              ← Voltar
                            </button>
                            <button
                              onClick={() => handleMoverTask(task.id, 'Concluído')}
                              className="flex-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all text-xs font-semibold"
                            >
                              ✓ Concluir
                            </button>
                          </div>
                        </div>
                      ))}
                      {tasks.filter(t => t.status === 'Em Andamento').length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                          Nenhuma tarefa
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Concluído */}
                  <div className="bg-white dark:bg-dark-card border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Concluído</h4>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {tasks.filter(t => t.status === 'Concluído').length}
                      </span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                      {tasks.filter(t => t.status === 'Concluído').map(task => (
                        <div key={task.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 cursor-pointer opacity-75 hover:opacity-100 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm line-through">{task.titulo}</h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAbrirModalTask(task)}
                                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleExcluirTask(task.id)}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{task.descricao}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              ✓ Concluída
                            </span>
                            {task.responsavelNome && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full font-medium">
                                👤 {task.responsavelNome.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleMoverTask(task.id, 'Em Andamento')}
                            className="w-full mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-xs font-semibold"
                          >
                            ↺ Reabrir
                          </button>
                        </div>
                      ))}
                      {tasks.filter(t => t.status === 'Concluído').length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                          Nenhuma tarefa
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          )}

          {activeTab === 'Qualidade' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Controle de Qualidade
                </h3>

                {/* Visita Técnica */}
                <div className="bg-white dark:bg-dark-card border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-soft">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Visita Técnica
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Status da Visita */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status da Visita</p>
                        <select className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-dark-bg dark:text-white font-semibold">
                          <option value="pendente">⏳ Pendente</option>
                          <option value="agendada">📅 Agendada</option>
                          <option value="realizada">✅ Realizada</option>
                          <option value="cancelada">❌ Cancelada</option>
                        </select>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data da Visita</p>
                        <input
                          type="date"
                          className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-dark-bg dark:text-white"
                        />
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Responsável</p>
                        <input
                          type="text"
                          placeholder="Nome do técnico"
                          className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-dark-bg dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Checklist de Qualidade */}
                    <div className="bg-gray-50 dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl p-6">
                      <h5 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Checklist de Verificação
                      </h5>
                      <div className="space-y-3">
                        {[
                          'Inspeção do local',
                          'Medições realizadas',
                          'Fotos documentadas',
                          'Condições elétricas verificadas',
                          'Requisitos técnicos confirmados',
                          'Orçamento validado com cliente'
                        ].map((item, idx) => (
                          <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Observações da Visita */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Observações da Visita Técnica
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Descreva detalhes importantes da visita técnica, condições encontradas, pontos de atenção..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-dark-bg dark:text-white"
                      />
                    </div>

                    {/* Fotos da Visita */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📸 Fotos da Visita Técnica
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Clique para fazer upload de fotos</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">PNG, JPG até 10MB</p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3">
                      <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium font-semibold">
                        💾 Salvar Visita Técnica
                      </button>
                      <button className="px-6 py-3 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-all font-semibold">
                        🖨️ Gerar Relatório
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inspeções e Aprovações */}
                <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-soft">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Inspeções e Aprovações
                  </h4>
                  
                  <div className="space-y-3">
                    {[
                      { nome: 'Inspeção Inicial', status: 'pendente' },
                      { nome: 'Aprovação do Cliente', status: 'pendente' },
                      { nome: 'Teste de Qualidade', status: 'pendente' },
                      { nome: 'Vistoria Final', status: 'pendente' }
                    ].map((inspecao, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl hover:shadow-soft transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            inspecao.status === 'aprovado' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                          }`}>
                            {inspecao.status === 'aprovado' ? (
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{inspecao.nome}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {inspecao.status === 'aprovado' ? '✅ Aprovado' : '⏳ Pendente'}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-semibold text-sm">
                          Aprovar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Adiar */}
        {adiarAberto.etapa && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-strong overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-yellow-600 to-orange-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
              </div>
                  <h3 className="text-lg font-bold text-white">Adiar Prazo</h3>
                </div>
                <button 
                  onClick={() => setAdiarAberto({ etapa: null, novaData: '', justificativa: '' })} 
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Nome da Etapa */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Etapa</p>
                  <p className="font-bold text-gray-900 dark:text-white">{adiarAberto.etapa.nome || adiarAberto.etapa.tipo}</p>
                </div>

                {/* Nova Data */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📅 Nova Data e Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={adiarAberto.novaData}
                    onChange={(e) => setAdiarAberto(prev => ({ ...prev, novaData: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-dark-bg dark:text-white"
                  />
                </div>

                {/* Justificativa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📝 Justificativa *
                  </label>
                  <textarea
                    rows={4}
                    value={adiarAberto.justificativa}
                    onChange={(e) => setAdiarAberto(prev => ({ ...prev, justificativa: e.target.value }))}
                    placeholder="Explique o motivo do adiamento do prazo..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-yellow-500 dark:bg-dark-bg dark:text-white"
                  />
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <button 
                    onClick={() => setAdiarAberto({ etapa: null, novaData: '', justificativa: '' })} 
                    className="px-6 py-2.5 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAdiarEnviar} 
                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all shadow-medium"
                  >
                    ⏰ Confirmar Adiamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Task */}
        {taskModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl shadow-strong overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">{taskEditando ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                </div>
                <button 
                  onClick={() => setTaskModalOpen(false)} 
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📝 Título da Tarefa *
                  </label>
                  <input
                    type="text"
                    value={taskForm.titulo}
                    onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })}
                    placeholder="Ex: Instalação de quadro elétrico"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-white"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📄 Descrição Detalhada *
                  </label>
                  <textarea
                    rows={4}
                    value={taskForm.descricao}
                    onChange={(e) => setTaskForm({ ...taskForm, descricao: e.target.value })}
                    placeholder="Descreva o que deve ser feito pelos engenheiros e técnicos..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-white"
                  />
                </div>

                {/* Grid com Prazo e Responsável */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prazo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      📅 Prazo *
                    </label>
                    <input
                      type="date"
                      value={taskForm.prazo}
                      onChange={(e) => setTaskForm({ ...taskForm, prazo: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-white"
                    />
                  </div>

                  {/* Responsável */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      👤 Responsável
                    </label>
                    <select
                      value={taskForm.responsavelId}
                      onChange={(e) => setTaskForm({ ...taskForm, responsavelId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-white"
                    >
                      <option value="">Selecione um técnico</option>
                      {usuariosDisponiveis.map(usuario => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nome} - {usuario.funcao || 'Técnico'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🎯 Status Inicial
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-white"
                  >
                    <option value="A Fazer">⏳ A Fazer</option>
                    <option value="Em Andamento">⚡ Em Andamento</option>
                    <option value="Concluído">✓ Concluído</option>
                  </select>
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <button 
                    onClick={() => setTaskModalOpen(false)} 
                    className="px-6 py-2.5 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSalvarTask} 
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-medium"
                  >
                    💾 {taskEditando ? 'Atualizar' : 'Criar'} Tarefa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Upload de Documentos */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-strong overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-purple-600 to-purple-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Upload de Documentos</h3>
                </div>
                <button 
                  onClick={() => setUploadModalOpen(false)} 
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Tipo de Documento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📋 Tipo de Documento
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-dark-bg dark:text-white">
                    <option value="ART">ART - Anotação de Responsabilidade Técnica</option>
                    <option value="TRT">TRT - Termo de Responsabilidade Técnica</option>
                    <option value="PROJETO">Projeto Elétrico</option>
                    <option value="MEMORIAL">Memorial Descritivo</option>
                    <option value="CONTRATO">Contrato</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                {/* Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📎 Arquivo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Clique para selecionar arquivo</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">PDF, DOC, DOCX até 20MB</p>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    💬 Observações
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Adicione observações sobre o documento..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-dark-bg dark:text-white"
                  />
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <button 
                    onClick={() => setUploadModalOpen(false)} 
                    className="px-6 py-2.5 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      toast.info('📤 Funcionalidade de upload será implementada em breve');
                      setUploadModalOpen(false);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium"
                  >
                    📤 Fazer Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AlertDialog para Confirmações */}
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
              <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAlertOpen(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  alertConfig.onConfirm();
                  setAlertOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default ModalVizualizacaoProjeto;


