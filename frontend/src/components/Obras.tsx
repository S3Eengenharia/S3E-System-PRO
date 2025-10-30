import React, { useState, useMemo, useRef, useEffect } from 'react';
import ModalAlocacaoEquipe from './Obras/ModalAlocacaoEquipe';
import { alocacaoObraService, type AlocacaoDTO } from '../services/AlocacaoObraService';
import GanttChart, { type GanttItem } from './GanttChart';
import { 
    type Project, ProjectStatus, ProjectType, 
    type User, UserRole,
    type ProjectStage, ProjectStageStatus
} from '../types';
import { projetosService, type Projeto } from '../services/projetosService';

// ==================== ICONS ====================
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.242 1.434l-1.005.827c-.294.24-.438.613-.438.995a6.473 6.473 0 010 .255c0 .382.144.755.438.995l1.005.827c.48.398.668 1.036.242 1.434l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.242-1.434l1.006-.827c.294-.24.438-.613.438-.995a6.473 6.473 0 010-.255c0-.382-.144-.755-.438-.995l-1.006-.827a1.125 1.125 0 01-.242-1.434l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c.552 0 1.005-.449.95-.998a10.928 10.928 0 00-2.761-6.15m2.761 6.15A9.005 9.005 0 0112 21c-2.172 0-4.15-.774-5.653-2.056M21 12a9.005 9.005 0 00-9.95-8.998c-.801.076-1.05.95-.45 1.45L12 5.25l1.4-1.798c.6-.5 1.351-.374 1.45.45M3 12c-.552 0-1.005.449-.95.998a10.928 10.928 0 002.761 6.15M3 12a9.005 9.005 0 019.95-8.998c.801.076 1.05.95.45 1.45L12 5.25 10.6 3.452c-.6-.5-1.351-.374-1.45.45M12 5.25v13.5" />
    </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);
const BuildingOffice2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
);

interface ObrasProps {
    toggleSidebar: () => void;
    onViewProject?: (projectId: string) => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const Obras: React.FC<ObrasProps> = ({ toggleSidebar, onViewProject, projects, setProjects }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todos'>('Todos');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAlocacaoModalOpen, setIsAlocacaoModalOpen] = useState(false);
    const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(null);
    const [alocacoesProjeto, setAlocacoesProjeto] = useState<AlocacaoDTO[]>([]);

    // Carregar projetos do backend
    useEffect(() => {
        carregarProjetos();
    }, []);

    const carregarProjetos = async () => {
        try {
            setLoading(true);
            const response = await projetosService.listar();
            
            if (response.success && response.data) {
                // Converter projetos da API para o formato do componente
                const projetosFormatados: Project[] = Array.isArray(response.data)
                    ? response.data.map((proj: Projeto) => ({
                        id: proj.id,
                        titulo: proj.titulo,
                        descricao: proj.descricao || '',
                        cliente: proj.cliente ? {
                            id: proj.cliente.id,
                            nome: proj.cliente.nome,
                            cpfCnpj: ''
                        } : { id: '', nome: 'Cliente não informado', cpfCnpj: '' },
                        tipo: proj.tipo as ProjectType,
                        status: proj.status as ProjectStatus,
                        dataInicio: proj.dataInicio,
                        dataFim: proj.dataPrevisao,
                        orcamento: proj.orcamento?.precoVenda || 0,
                        progresso: 0, // TODO: calcular progresso real
                        responsavel: proj.responsavel ? {
                            id: proj.responsavel.id,
                            nome: proj.responsavel.nome,
                            role: UserRole.Engenheiro
                        } : { id: '', nome: 'Não informado', role: UserRole.Engenheiro },
                        equipe: [],
                        endereco: '',
                        observacoes: '',
                        etapas: []
                    }))
                    : [];
                
                setProjects(projetosFormatados);
            } else {
                console.warn('Nenhum projeto encontrado ou erro na resposta:', response);
                setProjects([]);
            }
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtros
    const filteredProjects = useMemo(() => {
        let filtered = projects;

        // Filtro por status
        if (statusFilter !== 'Todos') {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        // Filtro por busca
        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.endereco.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [projects, statusFilter, searchTerm]);

    // Estatísticas
    const stats = useMemo(() => {
        const total = projects.length;
        const planejamento = projects.filter(p => p.status === ProjectStatus.Planejamento).length;
        const execucao = projects.filter(p => p.status === ProjectStatus.EmExecucao).length;
        const controleQualidade = projects.filter(p => p.status === ProjectStatus.ControleQualidade).length;
        const concluidos = projects.filter(p => p.status === ProjectStatus.Concluido).length;
        const valorTotal = projects.reduce((acc, p) => acc + p.orcamento, 0);

        return { total, planejamento, execucao, controleQualidade, concluidos, valorTotal };
    }, [projects]);

    const getStatusClass = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.Planejamento:
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
            case ProjectStatus.EmExecucao:
                return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
            case ProjectStatus.ControleQualidade:
                return 'bg-purple-100 text-purple-800 ring-1 ring-purple-200';
            case ProjectStatus.Concluido:
                return 'bg-green-100 text-green-800 ring-1 ring-green-200';
            case ProjectStatus.Cancelado:
                return 'bg-red-100 text-red-800 ring-1 ring-red-200';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
        }
    };

    const getStatusIcon = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.Planejamento:
                return '📋';
            case ProjectStatus.EmExecucao:
                return '🔧';
            case ProjectStatus.ControleQualidade:
                return '🔍';
            case ProjectStatus.Concluido:
                return '✅';
            case ProjectStatus.Cancelado:
                return '❌';
            default:
                return '📋';
        }
    };

    const getTypeIcon = (tipo: ProjectType) => {
        switch (tipo) {
            case ProjectType.Residencial:
                return '🏠';
            case ProjectType.Comercial:
                return '🏢';
            case ProjectType.Industrial:
                return '🏭';
            default:
                return '🏗️';
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const handleOpenModal = (project: Project | null = null) => {
        setProjectToEdit(project);
        setIsModalOpen(true);
    };
    useEffect(() => {
        if (selectedProject) {
            void loadAlocacoesDoProjeto(selectedProject.id);
        } else {
            setAlocacoesProjeto([]);
        }
    }, [selectedProject]);

    const loadAlocacoesDoProjeto = async (projetoId: string) => {
        try {
            const res = await alocacaoObraService.getAlocacoesPorProjeto(projetoId);
            if (res.success && Array.isArray(res.data)) {
                setAlocacoesProjeto(res.data);
            } else {
                setAlocacoesProjeto([]);
            }
        } catch (e) {
            console.error('Erro ao carregar alocações do projeto', e);
            setAlocacoesProjeto([]);
        }
    };

    const ganttItems: GanttItem[] = useMemo(() => {
        return alocacoesProjeto.map((a) => ({
            id: a.id,
            title: a.equipe?.nome || 'Equipe',
            startDate: new Date(a.dataInicio as any),
            endDate: new Date(a.dataFimPrevisto as any),
            progress: 0,
            status: a.status === 'EmAndamento' ? 'in-progress' :
                    a.status === 'Concluida' ? 'completed' :
                    a.status === 'Cancelada' ? 'cancelled' : 'planned',
            team: a.equipe?.nome || '',
            color: '#3b82f6'
        }));
    }, [alocacoesProjeto]);

    const ganttRange = useMemo(() => {
        if (ganttItems.length === 0) return null;
        const starts = ganttItems.map(i => i.startDate.getTime());
        const ends = ganttItems.map(i => i.endDate.getTime());
        return { start: new Date(Math.min(...starts)), end: new Date(Math.max(...ends)) };
    }, [ganttItems]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProjectToEdit(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (projectToEdit) {
                // Atualizar projeto existente
                const response = await projetosService.atualizar(projectToEdit.id, {
                    titulo: projectToEdit.titulo,
                    descricao: projectToEdit.descricao,
                    tipo: projectToEdit.tipo,
                    clienteId: projectToEdit.cliente.id,
                    responsavelId: projectToEdit.responsavel.id,
                    dataInicio: projectToEdit.dataInicio,
                    dataPrevisao: projectToEdit.dataFim,
                    status: projectToEdit.status
                });
                
                if (response.success) {
                    alert('✅ Projeto atualizado com sucesso!');
                    handleCloseModal();
                    await carregarProjetos();
                } else {
                    alert(`❌ Erro ao atualizar projeto: ${response.error || 'Erro desconhecido'}`);
                }
            } else {
                // Criar novo projeto (requer implementação completa do formulário)
                alert('✅ Funcionalidade de criação será implementada em breve!');
                handleCloseModal();
            }
        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
            alert('❌ Erro ao salvar projeto. Verifique o console para mais detalhes.');
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-soft">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Obras</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerencie projetos e acompanhe execução</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all shadow-medium font-semibold"
                >
                    <PlusIcon className="w-5 h-5" />
                    Nova Obra
                </button>
            </header>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                            <BuildingOffice2Icon className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total de Obras</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Planejamento</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.planejamento}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                            <Cog6ToothIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Em Execução</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.execucao}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <CheckBadgeIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Controle Qualidade</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.controleQualidade}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Concluídas</p>
                            <p className="text-2xl font-bold text-green-600">{stats.concluidos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Valor Total</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                R$ {(stats.valorTotal / 1000).toFixed(0)}K
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título, cliente ou endereço..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'Todos')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="Todos">Todos os Status</option>
                            <option value={ProjectStatus.Planejamento}>Planejamento</option>
                            <option value={ProjectStatus.EmExecucao}>Em Execução</option>
                            <option value={ProjectStatus.ControleQualidade}>Controle Qualidade</option>
                            <option value={ProjectStatus.Concluido}>Concluído</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Exibindo <span className="font-bold text-gray-900">{filteredProjects.length}</span> de <span className="font-bold text-gray-900">{projects.length}</span> obras
                    </p>
                </div>
            </div>

            {/* Grid de Obras */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando obras...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🏗️</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma obra encontrada</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || statusFilter !== 'Todos'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece criando sua primeira obra'}
                    </p>
                    {!searchTerm && statusFilter === 'Todos' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all shadow-medium font-semibold"
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            Criar Primeira Obra
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-amber-300 transition-all duration-200">
                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{project.titulo}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${getStatusClass(project.status)}`}>
                                            {getStatusIcon(project.status)} {project.status}
                                        </span>
                                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-800 ring-1 ring-gray-200">
                                            {getTypeIcon(project.tipo)} {project.tipo}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>👤</span>
                                    <span className="truncate">{project.cliente.nome}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📍</span>
                                    <span className="truncate">{project.endereco}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>👷</span>
                                    <span className="truncate">{project.responsavel.nome}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <UserGroupIcon className="w-4 h-4" />
                                    <span>{project.equipe.length} pessoas na equipe</span>
                                </div>
                            </div>

                            {/* Progresso */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Progresso</span>
                                    <span className="text-sm font-bold text-gray-900">{project.progresso}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progresso)}`}
                                        style={{ width: `${project.progresso}%` }}
                                    />
                                </div>
                            </div>

                            {/* Valor e Prazo */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-xs text-gray-600 mb-1">Orçamento</p>
                                    <p className="font-bold text-amber-700">
                                        R$ {project.orcamento.toLocaleString('pt-BR')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-xs text-gray-600 mb-1">Prazo</p>
                                    <p className="font-bold text-gray-900">
                                        {new Date(project.dataFim).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setSelectedProject(project)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    Ver
                                </button>
                                <button
                                    onClick={() => handleOpenModal(project)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-semibold"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => { setProjetoSelecionadoId(project.id); setIsAlocacaoModalOpen(true); }}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                                >
                                    📅 Alocar Equipe
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO/EDIÇÃO (Simplificado) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        {/* Header */}
                        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-medium ring-2 ring-amber-100">
                                    {projectToEdit ? <PencilIcon className="w-7 h-7 text-white" /> : <PlusIcon className="w-7 h-7 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {projectToEdit ? 'Editar Obra' : 'Nova Obra'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {projectToEdit ? 'Atualize as informações da obra' : 'Crie um novo projeto de obra'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                <p className="text-blue-800 font-medium">
                                    🚧 Modal simplificado para demonstração. 
                                    A implementação completa incluirá formulários detalhados para criação e edição de obras.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all shadow-medium font-semibold"
                                >
                                    {projectToEdit ? 'Atualizar' : 'Criar'} Obra
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE VISUALIZAÇÃO */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-amber-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Detalhes da Obra</h2>
                                <p className="text-sm text-gray-600 mt-1">{selectedProject.titulo}</p>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informações Básicas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Cliente</h3>
                                    <p className="text-gray-900 font-medium">{selectedProject.cliente.nome}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusClass(selectedProject.status)}`}>
                                        {getStatusIcon(selectedProject.status)} {selectedProject.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Tipo</h3>
                                    <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-800 ring-1 ring-gray-200">
                                        {getTypeIcon(selectedProject.tipo)} {selectedProject.tipo}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Responsável</h3>
                                    <p className="text-gray-900 font-medium">{selectedProject.responsavel.nome}</p>
                                </div>
                            </div>

                            {/* Progresso e Orçamento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Progresso</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className={`h-3 rounded-full ${getProgressColor(selectedProject.progresso)}`}
                                                    style={{ width: `${selectedProject.progresso}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-amber-700">{selectedProject.progresso}%</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Orçamento</h3>
                                    <p className="text-3xl font-bold text-green-700">
                                        R$ {selectedProject.orcamento.toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Descrição e Endereço */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                                    <p className="text-gray-700">{selectedProject.descricao}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Endereço</h3>
                                    <p className="text-gray-700">{selectedProject.endereco}</p>
                                </div>
                            </div>

                            {/* Equipe */}
                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                                <h3 className="font-semibold text-gray-800 mb-3">Equipe do Projeto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedProject.equipe.map((member) => (
                                        <div key={member.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <span className="text-purple-600 font-bold text-sm">
                                                    {member.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.nome}</p>
                                                <p className="text-sm text-gray-600">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline/Gantt de Alocações */
                            }
                            <div className="bg-white border border-gray-200 p-4 rounded-xl">
                                <h3 className="font-semibold text-gray-800 mb-3">Cronograma de Alocações</h3>
                                {ganttItems.length === 0 || !ganttRange ? (
                                    <p className="text-sm text-gray-500">Sem alocações para este projeto.</p>
                                ) : (
                                    <GanttChart
                                        items={ganttItems}
                                        startDate={ganttRange.start}
                                        endDate={ganttRange.end}
                                        onItemClick={(item) => {
                                            alert(`${item.title}: ${item.startDate.toLocaleDateString()} - ${item.endDate.toLocaleDateString()}`);
                                        }}
                                    />
                                )}
                            </div>

                            {/* Observações */}
                            {selectedProject.observacoes && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
                                    <p className="text-gray-700">{selectedProject.observacoes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isAlocacaoModalOpen && projetoSelecionadoId && (
                <ModalAlocacaoEquipe
                    isOpen={isAlocacaoModalOpen}
                    onClose={() => setIsAlocacaoModalOpen(false)}
                    projetoId={projetoSelecionadoId}
                />
            )}
        </div>
    );
};

export default Obras;