import React, { useState, useMemo, useEffect, useRef } from 'react';
import { projetosService, type Projeto, type CreateProjetoData, type UpdateProjetoData } from '../services/projetosService';
import { clientesService, type Cliente } from '../services/clientesService';
import { etapasAdminService, type EtapaAdmin } from '../services/etapasAdminService';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';

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
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);
const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
);
const DocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
);
const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

// ==================== INTERFACES ====================
interface Material {
    id: string;
    nome: string;
    quantidade: number;
    status: 'Pendente' | 'Alocado' | 'Em Falta';
}

interface Etapa {
    id: string;
    titulo: string;
    descricao: string;
    status: 'A Fazer' | 'Em Andamento' | 'Concluído';
    prazo: string;
}

interface QualityCheck {
    id: string;
    item: string;
    status: 'Pendente' | 'Aprovado' | 'Reprovado';
    observacoes?: string;
}

interface Anexo {
    id: string;
    nome: string;
    url: string;
    tipo: string;
    tamanho: number;
    dataUpload: string;
}

interface Usuario {
    id: string;
    nome: string;
    email: string;
    funcao: string;
}

interface ProjetosProps {
    toggleSidebar: () => void;
    onNavigate: (view: string) => void;
    onViewBudget: (budgetId: string) => void;
}

type ViewModalTab = 'geral' | 'etapasAdmin' | 'materiais' | 'etapas' | 'qualidade';

const ProjetosModerno: React.FC<ProjetosProps> = ({ toggleSidebar, onNavigate, onViewBudget }) => {
    // ==================== ESTADOS ====================
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Todos');
    const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');

    // Modais
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    
    const [projetoToEdit, setProjetoToEdit] = useState<Projeto | null>(null);
    const [projetoToView, setProjetoToView] = useState<Projeto | null>(null);
    const [projetoToDelete, setProjetoToDelete] = useState<Projeto | null>(null);
    
    // Estados do modal de visualização
    const [viewModalActiveTab, setViewModalActiveTab] = useState<ViewModalTab>('geral');
    const [etapasAdmin, setEtapasAdmin] = useState<EtapaAdmin[]>([]);
    const [resumoEtapasAdmin, setResumoEtapasAdmin] = useState<any>(null);
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [etapas, setEtapas] = useState<Etapa[]>([]);
    const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
    const [anexos, setAnexos] = useState<Anexo[]>([]);
    
    // Estado para extensão de prazo
    const [extendPrazoModalOpen, setExtendPrazoModalOpen] = useState(false);
    const [etapaToExtend, setEtapaToExtend] = useState<EtapaAdmin | null>(null);
    const [extendFormState, setExtendFormState] = useState({
        novaData: '',
        motivo: ''
    });
    
    // Drag and Drop Kanban
    const [draggingTask, setDraggingTask] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    
    // Gestão de tarefas
    const [taskToEdit, setTaskToEdit] = useState<Etapa | null>(null);
    const [taskFormState, setTaskFormState] = useState({
        titulo: '',
        descricao: '',
        status: 'A Fazer' as 'A Fazer' | 'Em Andamento' | 'Concluído',
        prazo: ''
    });
    
    // Gestão de equipe
    const [teamManagementMode, setTeamManagementMode] = useState<'view' | 'add' | 'edit'>('view');
    const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<Usuario | null>(null);
    const [usuarioFormState, setUsuarioFormState] = useState({
        nome: '',
        email: '',
        funcao: ''
    });

    // Ref para upload de arquivos
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state para criar/editar projeto
    const [formState, setFormState] = useState<CreateProjetoData>({
        titulo: '',
        descricao: '',
        tipo: 'Instalacao',
        clienteId: '',
        responsavelId: '',
        dataInicio: '',
        dataPrevisao: '',
        orcamentoId: ''
    });

    // Dropdown menu state
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // ==================== CARREGAMENTO DE DADOS ====================
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [projetosRes, clientesRes] = await Promise.all([
                projetosService.listar(),
                clientesService.listar()
            ]);

            if (projetosRes.success && projetosRes.data) {
                setProjetos(projetosRes.data);
            }

            if (clientesRes.success && clientesRes.data) {
                setClientes(clientesRes.data);
            }

            // Carregar usuários mockados (pode ser substituído por API real)
            setUsuarios([
                { id: '1', nome: 'João Silva', email: 'joao@s3e.com', funcao: 'Engenheiro Elétrico' },
                { id: '2', nome: 'Maria Santos', email: 'maria@s3e.com', funcao: 'Técnica em Elétrica' },
                { id: '3', nome: 'Pedro Costa', email: 'pedro@s3e.com', funcao: 'Gerente de Projetos' }
            ]);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ==================== FILTROS ====================
    const filteredProjetos = useMemo(() => {
        return projetos.filter(projeto => {
            const matchesSearch = 
                projeto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                projeto.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                projeto.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'Todos' || projeto.status === statusFilter;
            const matchesResponsavel = responsavelFilter === 'Todos' || projeto.responsavelId === responsavelFilter;
            
            return matchesSearch && matchesStatus && matchesResponsavel;
        });
    }, [projetos, searchTerm, statusFilter, responsavelFilter]);

    // ==================== HANDLERS ====================
    const handleOpenCreateModal = (projeto: Projeto | null = null) => {
        if (projeto) {
            setProjetoToEdit(projeto);
            setFormState({
                titulo: projeto.titulo,
                descricao: projeto.descricao,
                tipo: projeto.tipo,
                clienteId: projeto.clienteId,
                responsavelId: projeto.responsavelId,
                dataInicio: projeto.dataInicio,
                dataPrevisao: projeto.dataPrevisao,
                orcamentoId: projeto.orcamentoId || ''
            });
        } else {
            setProjetoToEdit(null);
            setFormState({
                titulo: '',
                descricao: '',
                tipo: 'Instalacao',
                clienteId: '',
                responsavelId: '',
                dataInicio: '',
                dataPrevisao: '',
                orcamentoId: ''
            });
        }
        setIsCreateModalOpen(true);
    };

    const handleOpenViewModal = async (projeto: Projeto) => {
        setProjetoToView(projeto);
        setViewModalActiveTab('geral');
        
        // Carregar etapas admin do backend
        await loadEtapasAdmin(projeto.id);
        
        // Inicializar dados mockados para demonstração
        setMateriais([
            { id: '1', nome: 'Cabo Flexível 2.5mm²', quantidade: 100, status: 'Pendente' },
            { id: '2', nome: 'Disjuntor 20A', quantidade: 10, status: 'Alocado' },
            { id: '3', nome: 'Tomada 10A', quantidade: 50, status: 'Em Falta' }
        ]);
        
        setEtapas([
            { id: '1', titulo: 'Levantamento de requisitos', descricao: 'Análise inicial', status: 'Concluído', prazo: '2025-11-05' },
            { id: '2', titulo: 'Elaboração do projeto', descricao: 'Desenho técnico', status: 'Em Andamento', prazo: '2025-11-15' },
            { id: '3', titulo: 'Aprovação do cliente', descricao: 'Validação final', status: 'A Fazer', prazo: '2025-11-20' }
        ]);
        
        setQualityChecks([
            { id: '1', item: 'Conformidade com normas NBR 5410', status: 'Pendente' },
            { id: '2', item: 'Dimensionamento de condutores', status: 'Aprovado', observacoes: 'OK' },
            { id: '3', item: 'Proteção contra sobrecorrente', status: 'Pendente' }
        ]);
        
        setAnexos([]);
        
        setIsViewModalOpen(true);
    };

    const loadEtapasAdmin = async (projetoId: string) => {
        try {
            const response = await etapasAdminService.listar(projetoId);
            
            if (response.success && response.data) {
                setEtapasAdmin(response.data.etapas);
                setResumoEtapasAdmin(response.data.resumo);
            } else {
                // Se não existir, tentar inicializar
                const initResponse = await etapasAdminService.inicializar(projetoId);
                if (initResponse.success) {
                    await loadEtapasAdmin(projetoId); // Recarregar após inicializar
                }
            }
        } catch (err) {
            console.error('Erro ao carregar etapas admin:', err);
            setEtapasAdmin([]);
        }
    };

    const handleConcluirEtapaAdmin = async (etapa: EtapaAdmin) => {
        if (!projetoToView) return;
        
        try {
            const response = await etapasAdminService.concluir(projetoToView.id, etapa.id);
            
            if (response.success) {
                await loadEtapasAdmin(projetoToView.id);
            } else {
                alert('Erro ao concluir etapa');
            }
        } catch (err) {
            console.error('Erro ao concluir etapa:', err);
            alert('Erro ao concluir etapa');
        }
    };

    const handleOpenExtendPrazoModal = (etapa: EtapaAdmin) => {
        setEtapaToExtend(etapa);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setExtendFormState({
            novaData: tomorrow.toISOString().split('T')[0],
            motivo: ''
        });
        setExtendPrazoModalOpen(true);
    };

    const handleSubmitExtendPrazo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!etapaToExtend || !projetoToView) return;

        if (extendFormState.motivo.trim().length < 10) {
            alert('O motivo deve ter pelo menos 10 caracteres');
            return;
        }

        try {
            const response = await etapasAdminService.estenderPrazo(
                projetoToView.id,
                etapaToExtend.id,
                extendFormState.novaData,
                extendFormState.motivo
            );

            if (response.success) {
                await loadEtapasAdmin(projetoToView.id);
                setExtendPrazoModalOpen(false);
                setEtapaToExtend(null);
            } else {
                alert('Erro ao estender prazo');
            }
        } catch (err) {
            console.error('Erro ao estender prazo:', err);
            alert('Erro ao estender prazo');
        }
    };

    const getEtapaAdminColor = (etapa: EtapaAdmin) => {
        if (etapa.concluida) {
            return 'bg-green-500 border-green-600 text-white hover:bg-green-600';
        }
        if (etapa.atrasada) {
            return 'bg-red-500 border-red-600 text-white hover:bg-red-600';
        }
        return 'bg-gray-300 border-gray-400 text-gray-700 hover:bg-gray-400';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (projetoToEdit) {
                const response = await projetosService.atualizar(projetoToEdit.id, formState);
                if (response.success && response.data) {
                    setProjetos(prev => prev.map(p => p.id === projetoToEdit.id ? response.data! : p));
                    setIsCreateModalOpen(false);
                    setProjetoToEdit(null);
                }
            } else {
                const response = await projetosService.criar(formState);
                if (response.success && response.data) {
                    setProjetos(prev => [response.data!, ...prev]);
                    setIsCreateModalOpen(false);
                }
            }
        } catch (err) {
            alert('Erro ao salvar projeto');
        }
    };

    const handleDelete = async () => {
        if (!projetoToDelete) return;
        
        try {
            await projetosService.desativar(projetoToDelete.id);
            setProjetos(prev => prev.filter(p => p.id !== projetoToDelete.id));
            setProjetoToDelete(null);
        } catch (err) {
            alert('Erro ao excluir projeto');
        }
    };

    // Upload de anexos
    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !projetoToView) return;

        Array.from(files).forEach(file => {
            const newAnexo: Anexo = {
                id: Date.now().toString(),
                nome: file.name,
                url: URL.createObjectURL(file),
                tipo: file.type,
                tamanho: file.size,
                dataUpload: new Date().toISOString()
            };
            setAnexos(prev => [...prev, newAnexo]);
        });
    };

    const handleDeleteAnexo = (anexoId: string) => {
        setAnexos(prev => prev.filter(a => a.id !== anexoId));
    };

    // Alocar material
    const handleAlocarMaterial = (materialId: string) => {
        setMateriais(prev => prev.map(m => {
            if (m.id === materialId) {
                // Simular verificação de estoque
                const hasStock = Math.random() > 0.3;
                return { ...m, status: hasStock ? 'Alocado' : 'Em Falta' };
            }
            return m;
        }));
    };

    // Drag and Drop para Kanban
    const handleDragStart = (taskId: string) => {
        setDraggingTask(taskId);
    };

    const handleDragOver = (e: React.DragEvent, column: 'A Fazer' | 'Em Andamento' | 'Concluído') => {
        e.preventDefault();
        setDragOverColumn(column);
    };

    const handleDrop = (e: React.DragEvent, newStatus: 'A Fazer' | 'Em Andamento' | 'Concluído') => {
        e.preventDefault();
        if (!draggingTask) return;

        setEtapas(prev => prev.map(etapa => 
            etapa.id === draggingTask ? { ...etapa, status: newStatus } : etapa
        ));

        setDraggingTask(null);
        setDragOverColumn(null);
    };

    // Gerenciar tarefas/etapas
    const handleOpenTaskModal = (etapa: Etapa | null = null) => {
        if (etapa) {
            setTaskToEdit(etapa);
            setTaskFormState({
                titulo: etapa.titulo,
                descricao: etapa.descricao,
                status: etapa.status,
                prazo: etapa.prazo
            });
        } else {
            setTaskToEdit(null);
            setTaskFormState({
                titulo: '',
                descricao: '',
                status: 'A Fazer',
                prazo: ''
            });
        }
        setIsTaskModalOpen(true);
    };

    const handleSubmitTask = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (taskToEdit) {
            setEtapas(prev => prev.map(et => 
                et.id === taskToEdit.id ? { ...et, ...taskFormState } : et
            ));
        } else {
            const newEtapa: Etapa = {
                id: Date.now().toString(),
                ...taskFormState
            };
            setEtapas(prev => [...prev, newEtapa]);
        }
        
        setIsTaskModalOpen(false);
        setTaskToEdit(null);
    };

    // Quality Check
    const handleUpdateQualityCheck = (checkId: string, newStatus: 'Aprovado' | 'Reprovado') => {
        setQualityChecks(prev => prev.map(qc => 
            qc.id === checkId ? { ...qc, status: newStatus } : qc
        ));
    };

    // Gerar Obra
    const handleGerarObra = async () => {
        if (!projetoToView) return;
        
        if (window.confirm(`Gerar obra a partir do projeto "${projetoToView.titulo}"?`)) {
            try {
                const response = await projetosService.atualizar(projetoToView.id, {
                    status: 'Em Execução'
                });
                
                if (response.success) {
                    alert('Obra gerada com sucesso! Você pode acessá-la na página de Obras.');
                    setProjetos(prev => prev.map(p => 
                        p.id === projetoToView.id ? { ...p, status: 'Em Execução' } : p
                    ));
                    setIsViewModalOpen(false);
                    onNavigate('Obras');
                }
            } catch (err) {
                alert('Erro ao gerar obra');
            }
        }
    };

    // Gestão de Equipe/Usuários
    const handleOpenTeamModal = () => {
        setTeamManagementMode('view');
        setIsTeamModalOpen(true);
    };

    const handleSubmitUsuario = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (usuarioToEdit) {
            setUsuarios(prev => prev.map(u => 
                u.id === usuarioToEdit.id ? { ...u, ...usuarioFormState } : u
            ));
        } else {
            const newUsuario: Usuario = {
                id: Date.now().toString(),
                ...usuarioFormState
            };
            setUsuarios(prev => [...prev, newUsuario]);
        }
        
        setTeamManagementMode('view');
        setUsuarioToEdit(null);
        setUsuarioFormState({ nome: '', email: '', funcao: '' });
    };

    const handleDeleteUsuario = () => {
        if (!memberToDelete) return;
        setUsuarios(prev => prev.filter(u => u.id !== memberToDelete.id));
        setMemberToDelete(null);
    };

    // Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ativo':
            case 'Em Execução':
                return 'bg-green-100 text-green-800 ring-1 ring-green-200';
            case 'Pendente':
            case 'Planejamento':
                return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
            case 'Concluído':
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
            case 'Cancelado':
                return 'bg-red-100 text-red-800 ring-1 ring-red-200';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
        }
    };

    const calcularProgresso = (projeto: Projeto): number => {
        // Calcular baseado nas etapas
        if (etapas.length === 0) return 0;
        const concluidas = etapas.filter(e => e.status === 'Concluído').length;
        return Math.round((concluidas / etapas.length) * 100);
    };

    // ==================== RENDER ====================
    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando projetos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-soft">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Projetos</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Hub central de gerenciamento de projetos</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleOpenTeamModal}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold shadow-soft"
                    >
                        <UsersIcon className="w-5 h-5" />
                        Gerenciar Equipe
                    </button>
                    <button
                        onClick={() => handleOpenCreateModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Novo Projeto
                    </button>
                </div>
            </header>

            {/* Filtros e Busca */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Busca */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, cliente ou ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Filtro por Status */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                            <option value="Todos">Todos os Status</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Planejamento">Planejamento</option>
                            <option value="Em Execução">Em Execução</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>

                    {/* Filtro por Responsável */}
                    <div>
                        <select
                            value={responsavelFilter}
                            onChange={(e) => setResponsavelFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                            <option value="Todos">Todos Responsáveis</option>
                            {usuarios.map(usuario => (
                                <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Resultado da Busca */}
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Exibindo <span className="font-bold text-gray-900">{filteredProjetos.length}</span> de <span className="font-bold text-gray-900">{projetos.length}</span> projetos
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Limpar busca
                        </button>
                    )}
                </div>
            </div>

            {/* Grid de Projetos */}
            {filteredProjetos.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <ClipboardIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || statusFilter !== 'Todos' || responsavelFilter !== 'Todos'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece criando seu primeiro projeto'}
                    </p>
                    {!searchTerm && statusFilter === 'Todos' && responsavelFilter === 'Todos' && (
                        <button
                            onClick={() => handleOpenCreateModal()}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            Criar Primeiro Projeto
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjetos.map((projeto) => {
                        const progresso = Math.random() * 100; // Pode ser calculado baseado nas etapas
                        
                        return (
                            <div key={projeto.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-200 hover:border-blue-300 relative group">
                                {/* Menu de Ações */}
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === projeto.id ? null : projeto.id)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                    
                                    {activeDropdown === projeto.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-strong border border-gray-200 py-1 z-10">
                                            <button
                                                onClick={() => {
                                                    handleOpenViewModal(projeto);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                                Visualizar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleOpenCreateModal(projeto);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProjetoToDelete(projeto);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Conteúdo do Card */}
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 pr-8">{projeto.titulo}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{projeto.descricao}</p>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Cliente:</span>
                                        <span className="text-sm font-semibold text-gray-900">{projeto.cliente?.nome || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Responsável:</span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {usuarios.find(u => u.id === projeto.responsavelId)?.nome || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Status:</span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${getStatusColor(projeto.status)}`}>
                                            {projeto.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-600">Progresso</span>
                                        <span className="text-xs font-bold text-blue-600">{Math.round(progresso)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${progresso}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Datas */}
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                                    <span>Início: {new Date(projeto.dataInicio).toLocaleDateString('pt-BR')}</span>
                                    <span>Previsão: {new Date(projeto.dataPrevisao).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {projetoToEdit ? 'Editar Projeto' : 'Novo Projeto'}
                            </h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Título do Projeto *
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.titulo}
                                        onChange={(e) => setFormState({...formState, titulo: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Ex: Instalação Elétrica Ed. Phoenix"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formState.descricao}
                                        onChange={(e) => setFormState({...formState, descricao: e.target.value})}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Descreva o projeto..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cliente *
                                    </label>
                                    <select
                                        value={formState.clienteId}
                                        onChange={(e) => setFormState({...formState, clienteId: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecione o cliente</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Responsável Técnico *
                                    </label>
                                    <select
                                        value={formState.responsavelId}
                                        onChange={(e) => setFormState({...formState, responsavelId: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecione o responsável</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tipo de Projeto *
                                    </label>
                                    <select
                                        value={formState.tipo}
                                        onChange={(e) => setFormState({...formState, tipo: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Instalacao">Instalação</option>
                                        <option value="Manutencao">Manutenção</option>
                                        <option value="Retrofit">Retrofit</option>
                                        <option value="Automacao">Automação</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Orçamento Vinculado
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.orcamentoId}
                                        onChange={(e) => setFormState({...formState, orcamentoId: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="ID do orçamento (opcional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Data de Início *
                                    </label>
                                    <input
                                        type="date"
                                        value={formState.dataInicio}
                                        onChange={(e) => setFormState({...formState, dataInicio: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Data de Previsão *
                                    </label>
                                    <input
                                        type="date"
                                        value={formState.dataPrevisao}
                                        onChange={(e) => setFormState({...formState, dataPrevisao: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                                >
                                    {projetoToEdit ? 'Atualizar' : 'Criar'} Projeto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE VISUALIZAÇÃO DE PROJETO (Hub Completo) */}
            {isViewModalOpen && projetoToView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-strong max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-slide-in-up my-8">
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{projetoToView.titulo}</h2>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <span className={`px-3 py-1.5 text-sm font-bold rounded-lg ${getStatusColor(projetoToView.status)}`}>
                                            {projetoToView.status}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Cliente: <strong>{projetoToView.cliente?.nome}</strong>
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Tipo: <strong>{projetoToView.tipo}</strong>
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="mt-6 border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    {(['geral', 'etapasAdmin', 'materiais', 'etapas', 'qualidade'] as ViewModalTab[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setViewModalActiveTab(tab)}
                                            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors capitalize ${
                                                viewModalActiveTab === tab
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {tab === 'geral' && '📋 Visão Geral'}
                                            {tab === 'etapasAdmin' && '⚡ Etapas Admin'}
                                            {tab === 'materiais' && '📦 Materiais'}
                                            {tab === 'etapas' && '📊 Etapas (Kanban)'}
                                            {tab === 'qualidade' && '✅ Qualidade'}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Conteúdo das Tabs */}
                        <div className="p-6">
                            {/* ABA: VISÃO GERAL */}
                            {viewModalActiveTab === 'geral' && (
                                <div className="space-y-6">
                                    {/* Informações Principais */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h3 className="font-bold text-gray-900 mb-4">Informações do Projeto</h3>
                                            <dl className="space-y-3">
                                                <div>
                                                    <dt className="text-xs text-gray-500 font-medium">Descrição</dt>
                                                    <dd className="text-sm text-gray-900 mt-1">{projetoToView.descricao}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-gray-500 font-medium">Tipo</dt>
                                                    <dd className="text-sm text-gray-900 mt-1">{projetoToView.tipo}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-gray-500 font-medium">Responsável</dt>
                                                    <dd className="text-sm text-gray-900 mt-1">
                                                        {usuarios.find(u => u.id === projetoToView.responsavelId)?.nome || 'N/A'}
                                                    </dd>
                                                </div>
                                                {projetoToView.orcamentoId && (
                                                    <div>
                                                        <dt className="text-xs text-gray-500 font-medium">Orçamento</dt>
                                                        <dd className="text-sm mt-1">
                                                            <button
                                                                onClick={() => onViewBudget(projetoToView.orcamentoId!)}
                                                                className="text-blue-600 hover:text-blue-700 font-medium"
                                                            >
                                                                Ver Orçamento →
                                                            </button>
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h3 className="font-bold text-gray-900 mb-4">Cronograma</h3>
                                            <dl className="space-y-3">
                                                <div>
                                                    <dt className="text-xs text-gray-500 font-medium">Data de Início</dt>
                                                    <dd className="text-sm text-gray-900 mt-1">
                                                        {new Date(projetoToView.dataInicio).toLocaleDateString('pt-BR')}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-gray-500 font-medium">Previsão de Término</dt>
                                                    <dd className="text-sm text-gray-900 mt-1">
                                                        {new Date(projetoToView.dataPrevisao).toLocaleDateString('pt-BR')}
                                                    </dd>
                                                </div>
                                                {projetoToView.dataConclusao && (
                                                    <div>
                                                        <dt className="text-xs text-gray-500 font-medium">Data de Conclusão</dt>
                                                        <dd className="text-sm text-gray-900 mt-1">
                                                            {new Date(projetoToView.dataConclusao).toLocaleDateString('pt-BR')}
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>
                                    </div>

                                    {/* Anexos */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-900">Anexos e Documentação</h3>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                onChange={handleAttachmentUpload}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                            >
                                                <PaperClipIcon className="w-4 h-4" />
                                                Upload
                                            </button>
                                        </div>
                                        
                                        {anexos.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500 text-sm">
                                                Nenhum anexo adicionado
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {anexos.map(anexo => (
                                                    <div key={anexo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <DocumentIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{anexo.nome}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(anexo.tamanho / 1024).toFixed(2)} KB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAnexo(anexo.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Ação: Gerar Obra */}
                                    {projetoToView.status !== 'Concluído' && projetoToView.status !== 'Cancelado' && (
                                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                                            <h3 className="font-bold text-purple-900 mb-2">Iniciar Obra</h3>
                                            <p className="text-sm text-purple-700 mb-4">
                                                Este projeto está pronto para iniciar a obra? Isso mudará o status para "Em Execução" e criará uma nova entrada na gestão de obras.
                                            </p>
                                            <button
                                                onClick={handleGerarObra}
                                                className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium font-semibold"
                                            >
                                                🚀 Gerar Obra
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ABA: ETAPAS ADMIN */}
                            {viewModalActiveTab === 'etapasAdmin' && (
                                <div className="space-y-6">
                                    {/* Header com Resumo */}
                                    {resumoEtapasAdmin && (
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                                <p className="text-xs font-medium text-blue-600 mb-1">Total</p>
                                                <p className="text-2xl font-bold text-blue-900">{resumoEtapasAdmin.total}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                                <p className="text-xs font-medium text-green-600 mb-1">Concluídas</p>
                                                <p className="text-2xl font-bold text-green-900">{resumoEtapasAdmin.concluidas}</p>
                                            </div>
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                                <p className="text-xs font-medium text-yellow-600 mb-1">No Prazo</p>
                                                <p className="text-2xl font-bold text-yellow-900">{resumoEtapasAdmin.noPrazo}</p>
                                            </div>
                                            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                                <p className="text-xs font-medium text-red-600 mb-1">Atrasadas</p>
                                                <p className="text-2xl font-bold text-red-900">{resumoEtapasAdmin.atrasadas}</p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                                <p className="text-xs font-medium text-purple-600 mb-1">Progresso</p>
                                                <p className="text-2xl font-bold text-purple-900">{resumoEtapasAdmin.progresso}%</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Grid de Etapas */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Fluxo de Trabalho Administrativo</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {etapasAdmin.map((etapa, index) => (
                                                <div key={etapa.id} className="relative">
                                                    {/* Caixa da Etapa */}
                                                    <button
                                                        onClick={() => !etapa.concluida && handleConcluirEtapaAdmin(etapa)}
                                                        disabled={etapa.concluida}
                                                        className={`w-full aspect-square rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-4 ${getEtapaAdminColor(etapa)} ${
                                                            !etapa.concluida ? 'cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105' : 'cursor-default shadow-sm'
                                                        }`}
                                                    >
                                                        {/* Número da Etapa */}
                                                        <div className={`text-xs font-bold mb-2 px-2 py-1 rounded-full ${
                                                            etapa.concluida ? 'bg-white/30' :
                                                            etapa.atrasada ? 'bg-white/30' :
                                                            'bg-white/20'
                                                        }`}>
                                                            #{index + 1}
                                                        </div>
                                                        
                                                        {/* Nome da Etapa */}
                                                        <p className="text-xs font-bold text-center leading-tight">
                                                            {etapa.nome}
                                                        </p>
                                                        
                                                        {/* Ícone de Status */}
                                                        <div className="mt-2">
                                                            {etapa.concluida ? (
                                                                <CheckCircleIcon className="w-6 h-6" />
                                                            ) : etapa.atrasada ? (
                                                                <XCircleIcon className="w-6 h-6" />
                                                            ) : (
                                                                <span className="text-2xl">⏱️</span>
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* Info de Prazo */}
                                                    <div className="mt-2 text-center">
                                                        {etapa.concluida ? (
                                                            <p className="text-xs text-green-600 font-semibold">
                                                                ✓ Concluída
                                                            </p>
                                                        ) : etapa.atrasada ? (
                                                            <div>
                                                                <p className="text-xs text-red-600 font-semibold mb-1">
                                                                    ⚠️ Atrasada
                                                                </p>
                                                                <button
                                                                    onClick={() => handleOpenExtendPrazoModal(etapa)}
                                                                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline"
                                                                >
                                                                    Estender Prazo
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <p className="text-xs text-gray-600 font-medium">
                                                                    {Math.abs(etapa.horasRestantes)}h restantes
                                                                </p>
                                                                <button
                                                                    onClick={() => handleOpenExtendPrazoModal(etapa)}
                                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                                                                >
                                                                    Estender
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Motivação de Extensão (se houver) */}
                                                    {etapa.motivoExtensao && (
                                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <p className="text-xs text-yellow-800 font-medium">
                                                                📝 {etapa.motivoExtensao}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Legenda */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <h4 className="font-bold text-gray-900 mb-4">Legenda</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 rounded-lg"></div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">Pendente</p>
                                                    <p className="text-xs text-gray-600">Clique para concluir</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-green-500 border-2 border-green-600 rounded-lg flex items-center justify-center">
                                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-green-900">Concluída</p>
                                                    <p className="text-xs text-green-700">No prazo</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-red-500 border-2 border-red-600 rounded-lg flex items-center justify-center">
                                                    <XCircleIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-red-900">Atrasada</p>
                                                    <p className="text-xs text-red-700">Prazo vencido</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instruções */}
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                        <h4 className="font-bold text-blue-900 mb-2">💡 Como Usar</h4>
                                        <ul className="space-y-2 text-sm text-blue-800">
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">1.</span>
                                                <span>Clique na caixa cinza para marcar a etapa como concluída (ficará verde)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">2.</span>
                                                <span>Cada etapa tem prazo padrão de 24 horas</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">3.</span>
                                                <span>Se o prazo vencer sem conclusão, a caixa ficará vermelha (atrasada)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">4.</span>
                                                <span>Clique em "Estender Prazo" para adicionar mais tempo (requer justificativa)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">5.</span>
                                                <span>O progresso geral é calculado automaticamente</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* ABA: MATERIAIS */}
                            {viewModalActiveTab === 'materiais' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">Lista de Materiais (Bill of Materials)</h3>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                                            + Adicionar Material
                                        </button>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Material</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Quantidade</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {materiais.map((material) => (
                                                    <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.nome}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">{material.quantidade}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                                                                material.status === 'Alocado' ? 'bg-green-100 text-green-800 ring-1 ring-green-200' :
                                                                material.status === 'Em Falta' ? 'bg-red-100 text-red-800 ring-1 ring-red-200' :
                                                                'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
                                                            }`}>
                                                                {material.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {material.status === 'Pendente' && (
                                                                <button
                                                                    onClick={() => handleAlocarMaterial(material.id)}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold transition-colors"
                                                                >
                                                                    Alocar
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ABA: ETAPAS (KANBAN) */}
                            {viewModalActiveTab === 'etapas' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">Kanban de Etapas</h3>
                                        <button
                                            onClick={() => handleOpenTaskModal()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                                        >
                                            + Nova Tarefa
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Coluna: A Fazer */}
                                        <div
                                            onDragOver={(e) => handleDragOver(e, 'A Fazer')}
                                            onDrop={(e) => handleDrop(e, 'A Fazer')}
                                            className={`bg-gray-50 rounded-xl p-4 min-h-[400px] border-2 border-dashed transition-all ${
                                                dragOverColumn === 'A Fazer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                        >
                                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                                                A Fazer ({etapas.filter(e => e.status === 'A Fazer').length})
                                            </h4>
                                            <div className="space-y-3">
                                                {etapas.filter(e => e.status === 'A Fazer').map(etapa => (
                                                    <div
                                                        key={etapa.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(etapa.id)}
                                                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all"
                                                    >
                                                        <h5 className="font-semibold text-gray-900 text-sm mb-2">{etapa.titulo}</h5>
                                                        <p className="text-xs text-gray-600 mb-3">{etapa.descricao}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">
                                                                📅 {new Date(etapa.prazo).toLocaleDateString('pt-BR')}
                                                            </span>
                                                            <button
                                                                onClick={() => handleOpenTaskModal(etapa)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Coluna: Em Andamento */}
                                        <div
                                            onDragOver={(e) => handleDragOver(e, 'Em Andamento')}
                                            onDrop={(e) => handleDrop(e, 'Em Andamento')}
                                            className={`bg-blue-50 rounded-xl p-4 min-h-[400px] border-2 border-dashed transition-all ${
                                                dragOverColumn === 'Em Andamento' ? 'border-blue-500 bg-blue-100' : 'border-blue-200'
                                            }`}
                                        >
                                            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                                Em Andamento ({etapas.filter(e => e.status === 'Em Andamento').length})
                                            </h4>
                                            <div className="space-y-3">
                                                {etapas.filter(e => e.status === 'Em Andamento').map(etapa => (
                                                    <div
                                                        key={etapa.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(etapa.id)}
                                                        className="bg-white p-4 rounded-lg shadow-sm border border-blue-300 cursor-move hover:shadow-md transition-all"
                                                    >
                                                        <h5 className="font-semibold text-gray-900 text-sm mb-2">{etapa.titulo}</h5>
                                                        <p className="text-xs text-gray-600 mb-3">{etapa.descricao}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">
                                                                📅 {new Date(etapa.prazo).toLocaleDateString('pt-BR')}
                                                            </span>
                                                            <button
                                                                onClick={() => handleOpenTaskModal(etapa)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Coluna: Concluído */}
                                        <div
                                            onDragOver={(e) => handleDragOver(e, 'Concluído')}
                                            onDrop={(e) => handleDrop(e, 'Concluído')}
                                            className={`bg-green-50 rounded-xl p-4 min-h-[400px] border-2 border-dashed transition-all ${
                                                dragOverColumn === 'Concluído' ? 'border-green-500 bg-green-100' : 'border-green-200'
                                            }`}
                                        >
                                            <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                                Concluído ({etapas.filter(e => e.status === 'Concluído').length})
                                            </h4>
                                            <div className="space-y-3">
                                                {etapas.filter(e => e.status === 'Concluído').map(etapa => (
                                                    <div
                                                        key={etapa.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(etapa.id)}
                                                        className="bg-white p-4 rounded-lg shadow-sm border border-green-300 cursor-move hover:shadow-md transition-all"
                                                    >
                                                        <h5 className="font-semibold text-gray-900 text-sm mb-2">{etapa.titulo}</h5>
                                                        <p className="text-xs text-gray-600 mb-3">{etapa.descricao}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">
                                                                ✓ Concluído
                                                            </span>
                                                            <button
                                                                onClick={() => handleOpenTaskModal(etapa)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ABA: QUALIDADE */}
                            {viewModalActiveTab === 'qualidade' && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900">Controle de Qualidade (QC)</h3>
                                    
                                    <div className="space-y-3">
                                        {qualityChecks.map(check => (
                                            <div key={check.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{check.item}</h4>
                                                        {check.observacoes && (
                                                            <p className="text-xs text-gray-600">{check.observacoes}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {check.status === 'Pendente' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateQualityCheck(check.id, 'Aprovado')}
                                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-semibold flex items-center gap-1"
                                                                >
                                                                    <CheckCircleIcon className="w-4 h-4" />
                                                                    Aprovar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateQualityCheck(check.id, 'Reprovado')}
                                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-semibold flex items-center gap-1"
                                                                >
                                                                    <XCircleIcon className="w-4 h-4" />
                                                                    Reprovar
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className={`px-4 py-2 text-xs font-bold rounded-lg ${
                                                                check.status === 'Aprovado' 
                                                                    ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                                                                    : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                                                            }`}>
                                                                {check.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE TAREFA/ETAPA */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
                                <input
                                    type="text"
                                    value={taskFormState.titulo}
                                    onChange={(e) => setTaskFormState({...taskFormState, titulo: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="Título da tarefa"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                                <textarea
                                    value={taskFormState.descricao}
                                    onChange={(e) => setTaskFormState({...taskFormState, descricao: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="Descrição da tarefa"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={taskFormState.status}
                                        onChange={(e) => setTaskFormState({...taskFormState, status: e.target.value as any})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="A Fazer">A Fazer</option>
                                        <option value="Em Andamento">Em Andamento</option>
                                        <option value="Concluído">Concluído</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prazo *</label>
                                    <input
                                        type="date"
                                        value={taskFormState.prazo}
                                        onChange={(e) => setTaskFormState({...taskFormState, prazo: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsTaskModalOpen(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all font-semibold"
                                >
                                    {taskToEdit ? 'Atualizar' : 'Criar'} Tarefa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE GESTÃO DE EQUIPE */}
            {isTeamModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Equipe</h2>
                                <button
                                    onClick={() => setIsTeamModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {teamManagementMode === 'view' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">Membros da Equipe ({usuarios.length})</h3>
                                        <button
                                            onClick={() => {
                                                setTeamManagementMode('add');
                                                setUsuarioFormState({ nome: '', email: '', funcao: '' });
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                                        >
                                            + Adicionar Membro
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {usuarios.map(usuario => (
                                            <div key={usuario.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{usuario.nome}</h4>
                                                        <p className="text-sm text-gray-600">{usuario.email}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{usuario.funcao}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setUsuarioToEdit(usuario);
                                                                setUsuarioFormState({
                                                                    nome: usuario.nome,
                                                                    email: usuario.email,
                                                                    funcao: usuario.funcao
                                                                });
                                                                setTeamManagementMode('edit');
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setMemberToDelete(usuario)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(teamManagementMode === 'add' || teamManagementMode === 'edit') && (
                                <form onSubmit={handleSubmitUsuario} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                                        <input
                                            type="text"
                                            value={usuarioFormState.nome}
                                            onChange={(e) => setUsuarioFormState({...usuarioFormState, nome: e.target.value})}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={usuarioFormState.email}
                                            onChange={(e) => setUsuarioFormState({...usuarioFormState, email: e.target.value})}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            placeholder="email@empresa.com"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Função *</label>
                                        <input
                                            type="text"
                                            value={usuarioFormState.funcao}
                                            onChange={(e) => setUsuarioFormState({...usuarioFormState, funcao: e.target.value})}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Engenheiro Elétrico"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTeamManagementMode('view');
                                                setUsuarioToEdit(null);
                                            }}
                                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                                        >
                                            Voltar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-semibold"
                                        >
                                            {teamManagementMode === 'edit' ? 'Atualizar' : 'Adicionar'} Membro
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            {projetoToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Exclusão</h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja excluir o projeto <strong>"{projetoToDelete.titulo}"</strong>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setProjetoToDelete(null)}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
                            >
                                Excluir Projeto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE MEMBRO */}
            {memberToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Exclusão</h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja remover <strong>{memberToDelete.nome}</strong> da equipe?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setMemberToDelete(null)}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteUsuario}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EXTENSÃO DE PRAZO */}
            {extendPrazoModalOpen && etapaToExtend && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Estender Prazo da Etapa</h3>
                        <p className="text-gray-600 mb-6">
                            Etapa: <strong>{etapaToExtend.nome}</strong>
                        </p>

                        <form onSubmit={handleSubmitExtendPrazo} className="space-y-6">
                            {/* Informações Atuais */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">Informações Atuais</h4>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Prazo Atual:</dt>
                                        <dd className="font-semibold text-gray-900">
                                            {new Date(etapaToExtend.dataPrevista).toLocaleString('pt-BR')}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Horas Restantes:</dt>
                                        <dd className={`font-semibold ${etapaToExtend.atrasada ? 'text-red-600' : 'text-gray-900'}`}>
                                            {etapaToExtend.atrasada ? 'Vencido' : `${Math.abs(etapaToExtend.horasRestantes)}h`}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Status:</dt>
                                        <dd className={`font-semibold ${etapaToExtend.atrasada ? 'text-red-600' : 'text-green-600'}`}>
                                            {etapaToExtend.atrasada ? '⚠️ Atrasada' : '✓ No Prazo'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Nova Data */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nova Data de Vencimento *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={extendFormState.novaData}
                                    onChange={(e) => setExtendFormState({ ...extendFormState, novaData: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Justificativa */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Justificativa * (mínimo 10 caracteres)
                                </label>
                                <textarea
                                    value={extendFormState.motivo}
                                    onChange={(e) => setExtendFormState({ ...extendFormState, motivo: e.target.value })}
                                    required
                                    rows={4}
                                    minLength={10}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Explique o motivo da extensão do prazo (ex: aguardando documentação do cliente, necessidade de revisão adicional, etc.)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {extendFormState.motivo.length}/10 caracteres
                                </p>
                            </div>

                            {/* Alerta */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>⚠️ Atenção:</strong> A extensão de prazo ficará registrada no histórico da etapa e será visível para toda a equipe.
                                </p>
                            </div>

                            {/* Botões */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExtendPrazoModalOpen(false);
                                        setEtapaToExtend(null);
                                    }}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                                >
                                    Confirmar Extensão
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjetosModerno;

