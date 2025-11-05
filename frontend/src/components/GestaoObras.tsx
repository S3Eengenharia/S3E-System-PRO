import React, { useState, useEffect } from 'react';
import ModalEquipesDeObra from './Obras/ModalEquipesDeObra';
import ModalAlocacaoEquipe from './Obras/ModalAlocacaoEquipe';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';

// Icons
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
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);
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

interface Membro {
    id: string;
    nome: string;
    email: string;
    role: string;
}

interface Equipe {
    id: string;
    nome: string;
    tipo: 'MONTAGEM' | 'CAMPO' | 'DISTINTA';
    membros: Membro[];
    ativa: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Alocacao {
    id: string;
    equipeId: string;
    projetoId: string;
    dataInicio: string;
    dataFim: string;
    status: 'Planejada' | 'EmAndamento' | 'Concluida' | 'Cancelada';
    observacoes?: string;
    equipe?: Equipe;
    projeto?: any;
}

interface GestaoObrasProps {
    toggleSidebar: () => void;
}

type TabType = 'equipes' | 'calendario' | 'gantt';

const GestaoObras: React.FC<GestaoObrasProps> = ({ toggleSidebar }) => {
    const [activeTab, setActiveTab] = useState<TabType>('equipes');
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para modal de equipe
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [equipeToEdit, setEquipeToEdit] = useState<Equipe | null>(null);
    const [isEquipeManagerOpen, setIsEquipeManagerOpen] = useState(false);
    const [isAlocacaoModalOpen, setIsAlocacaoModalOpen] = useState(false);
    const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        nome: '',
        tipo: '' as '' | 'MONTAGEM' | 'CAMPO' | 'DISTINTA',
        membrosIds: [] as string[], // IDs dos membros (backend espera array de strings)
        ativa: true
    });
    
    // Estados para listar eletricistas
    const [eletricistas, setEletricistas] = useState<any[]>([]);
    const [loadingEletricistas, setLoadingEletricistas] = useState(false);

    // Carregar equipes do backend
    const loadEquipes = async () => {
        try {
            console.log('🔍 Carregando equipes do backend...');
            const response = await axiosApiService.get<Equipe[]>(ENDPOINTS.OBRAS.EQUIPES);
            
            if (response.success && response.data) {
                console.log('✅ Equipes carregadas:', response.data);
                setEquipes(Array.isArray(response.data) ? response.data : []);
                setError(null);
            } else {
                console.warn('⚠️ Resposta sem dados:', response);
                setEquipes([]);
                setError(null); // Não mostrar erro se simplesmente não houver dados
            }
        } catch (err) {
            console.error('❌ Erro ao carregar equipes:', err);
            setError('Erro ao carregar equipes. Verifique sua conexão.');
            setEquipes([]);
        }
    };

    // Carregar alocações do backend
    const loadAlocacoes = async () => {
        try {
            console.log('🔍 Carregando alocações do backend...');
            const response = await axiosApiService.get<Alocacao[]>(ENDPOINTS.OBRAS.ALOCACOES);
            
            if (response.success && response.data) {
                console.log('✅ Alocações carregadas:', response.data);
                setAlocacoes(Array.isArray(response.data) ? response.data : []);
            } else {
                console.warn('⚠️ Resposta sem alocações:', response);
                setAlocacoes([]);
            }
        } catch (err) {
            console.error('❌ Erro ao carregar alocações:', err);
            setAlocacoes([]);
        }
    };

    // Carregar dados ao montar o componente
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([loadEquipes(), loadAlocacoes()]);
            setLoading(false);
        };
        loadData();
    }, []);

    // Carregar eletricistas do backend
    const loadEletricistas = async () => {
        try {
            setLoadingEletricistas(true);
            const response = await axiosApiService.get<any[]>('/api/configuracoes/usuarios');
            
            if (response.success && response.data) {
                // Filtrar apenas eletricistas
                const usuariosArray = Array.isArray(response.data) ? response.data : [];
                const eletricistasFiltered = usuariosArray.filter((u: any) => 
                    u.role?.toLowerCase() === 'eletricista'
                );
                setEletricistas(eletricistasFiltered);
            } else {
                setEletricistas([]);
            }
        } catch (err) {
            console.error('Erro ao carregar eletricistas:', err);
            setEletricistas([]);
        } finally {
            setLoadingEletricistas(false);
        }
    };

    const handleOpenModal = (equipe: Equipe | null = null) => {
        if (equipe) {
            setEquipeToEdit(equipe);
            setFormState({
                nome: equipe.nome,
                tipo: equipe.tipo,
                membrosIds: equipe.membros.map(m => m.id),
                ativa: equipe.ativa
            });
        } else {
            setEquipeToEdit(null);
            setFormState({
                nome: '',
                tipo: '' as '' | 'MONTAGEM' | 'CAMPO' | 'DISTINTA',
                membrosIds: [],
                ativa: true
            });
        }
        loadEletricistas(); // Carregar eletricistas ao abrir o modal
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEquipeToEdit(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validações
        if (!formState.nome.trim()) {
            alert('Por favor, preencha o nome da equipe');
            return;
        }
        
        if (!formState.tipo) {
            alert('Por favor, selecione o tipo da equipe');
            return;
        }
        
        if (formState.membrosIds.length === 0) {
            alert('Por favor, adicione pelo menos um membro à equipe');
            return;
        }
        
        try {
            // Formato esperado pelo backend
            const equipeData = {
                nome: formState.nome,
                tipo: formState.tipo,
                membros: formState.membrosIds // Array de IDs dos usuários
            };

            console.log('📤 Enviando dados da equipe:', equipeData);

            if (equipeToEdit) {
                const response = await axiosApiService.put(`${ENDPOINTS.OBRAS.EQUIPES}/${equipeToEdit.id}`, equipeData);
                console.log('📥 Resposta:', response);
                if (response.success) {
                    await loadEquipes();
                    handleCloseModal();
                } else {
                    alert('Erro ao atualizar equipe: ' + (response.error || 'Erro desconhecido'));
                }
            } else {
                const response = await axiosApiService.post(ENDPOINTS.OBRAS.EQUIPES, equipeData);
                console.log('📥 Resposta:', response);
                if (response.success) {
                    await loadEquipes();
                    handleCloseModal();
                } else {
                    alert('Erro ao criar equipe: ' + (response.error || 'Erro desconhecido'));
                }
            }
        } catch (err: any) {
            console.error('Erro ao salvar equipe:', err);
            const errorMessage = err?.response?.data?.error || err?.message || 'Erro desconhecido';
            alert('Erro ao salvar equipe: ' + errorMessage);
        }
    };

    const handleDeleteEquipe = async (equipe: Equipe) => {
        if (window.confirm(`Tem certeza que deseja desativar a equipe "${equipe.nome}"?`)) {
            try {
                const response = await axiosApiService.delete(`${ENDPOINTS.OBRAS.EQUIPES}/${equipe.id}`);
                if (response.success) {
                    await loadEquipes();
                } else {
                    alert('Erro ao desativar equipe');
                }
            } catch (err) {
                console.error('Erro ao desativar equipe:', err);
                alert('Erro ao desativar equipe');
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEletricista = (eletricistaId: string) => {
        if (!formState.membrosIds.includes(eletricistaId)) {
            setFormState(prev => ({ 
                ...prev, 
                membrosIds: [...prev.membrosIds, eletricistaId] 
            }));
        }
    };

    const handleRemoveMembroId = (membroId: string) => {
        setFormState(prev => ({ 
            ...prev, 
            membrosIds: prev.membrosIds.filter(id => id !== membroId) 
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando gestão de obras...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Gestão de Obras</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerenciamento de equipes e alocações de projetos</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsEquipeManagerOpen(true)} 
                        className="flex items-center justify-center bg-white border-2 border-blue-600 text-blue-600 font-semibold px-4 py-3 rounded-xl shadow-soft hover:bg-blue-50 transition-all duration-200"
                    >
                        <UsersIcon className="w-5 h-5 mr-2" />
                        Equipes (Pessoas)
                    </button>
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nova Equipe
                    </button>
                </div>
            </header>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-in-up">
                    <h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                    <button
                        onClick={() => {
                            setLoading(true);
                            loadEquipes().then(() => loadAlocacoes()).finally(() => setLoading(false));
                        }}
                        className="mt-3 bg-red-100 px-4 py-2 rounded-lg text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('equipes')}
                            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                                activeTab === 'equipes'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <UsersIcon className="w-5 h-5 inline mr-2" />
                            Equipes
                        </button>
                        <button
                            onClick={() => setActiveTab('calendario')}
                            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                                activeTab === 'calendario'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <CalendarIcon className="w-5 h-5 inline mr-2" />
                            Calendário
                        </button>
                        <button
                            onClick={() => setActiveTab('gantt')}
                            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                                activeTab === 'gantt'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ChartBarIcon className="w-5 h-5 inline mr-2" />
                            Timeline
                        </button>
                    </nav>
                </div>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === 'equipes' && (
                <div className="space-y-6">
                    {/* Estatísticas rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm ring-1 ring-blue-200/50">
                                    <UsersIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total de Equipes</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{equipes.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-sm ring-1 ring-green-200/50">
                                    <UsersIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Equipes Ativas</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {equipes.filter(e => e.ativa).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center shadow-sm ring-1 ring-purple-200/50">
                                    <UsersIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total de Membros</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {equipes.reduce((total, equipe) => total + (equipe.membros?.length || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm ring-1 ring-orange-200/50">
                                    <CalendarIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Alocações Ativas</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {alocacoes.filter(a => a.status === 'EmAndamento').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de equipes */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Equipes Cadastradas</h2>
                                    <p className="text-sm text-gray-500 mt-1">Gerencie suas equipes de trabalho</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {equipes.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm ring-1 ring-blue-200/50 mb-4">
                                        <UsersIcon className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma equipe cadastrada</h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Comece criando sua primeira equipe para organizar o trabalho em suas obras</p>
                                    <button 
                                        onClick={() => handleOpenModal()}
                                        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                                    >
                                        <PlusIcon className="w-5 h-5 inline mr-2" />
                                        Criar Primeira Equipe
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {equipes.map((equipe) => (
                                        <div key={equipe.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-200 hover:border-blue-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{equipe.nome}</h3>
                                                    <p className="text-sm text-gray-600">Tipo: {equipe.tipo}</p>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-lg shadow-sm ${
                                                    equipe.ativa 
                                                        ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                                                        : 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
                                                }`}>
                                                    {equipe.ativa ? 'Ativa' : 'Inativa'}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                    <UsersIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-medium">{equipe.membros?.length || 0} membros</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleOpenModal(equipe)}
                                                    className="flex-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold py-2 px-3 rounded-lg hover:bg-blue-50"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEquipe(equipe)}
                                                    className="flex-1 text-red-600 hover:text-red-700 transition-colors text-sm font-semibold py-2 px-3 rounded-lg hover:bg-red-50"
                                                >
                                                    Desativar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calendario' && (
                <div className="space-y-6">
                    {/* Header com Controles */}
                    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Calendário de Alocações</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        // Navegar para mês anterior
                                        const now = new Date();
                                        now.setMonth(now.getMonth() - 1);
                                    }}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    ← Anterior
                                </button>
                                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                                    Hoje
                                </button>
                                <button 
                                    onClick={() => {
                                        // Navegar para próximo mês
                                        const now = new Date();
                                        now.setMonth(now.getMonth() + 1);
                                    }}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    Próximo →
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Calendário Principal */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
                                {/* Dias da Semana */}
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                                        <div key={dia} className="text-center text-sm font-bold text-gray-600 py-2">
                                            {dia}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Dias do Mês */}
                                <div className="grid grid-cols-7 gap-2">
                                    {Array.from({ length: 35 }, (_, i) => {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                                        const startingDayOfWeek = firstDay.getDay();
                                        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                                        
                                        const day = i - startingDayOfWeek + 1;
                                        const isCurrentMonth = day > 0 && day <= daysInMonth;
                                        const isToday = isCurrentMonth && day === now.getDate();
                                        
                                        // Verificar se há alocações neste dia
                                        const hasAlocation = isCurrentMonth && alocacoes.some(a => {
                                            const startDate = new Date(a.dataInicio);
                                            const endDate = new Date(a.dataFim);
                                            const currentDate = new Date(now.getFullYear(), now.getMonth(), day);
                                            return currentDate >= startDate && currentDate <= endDate;
                                        });
                                        
                                        return (
                                            <div
                                                key={i}
                                                className={`min-h-[80px] p-2 rounded-xl border transition-all duration-200 ${
                                                    isCurrentMonth
                                                        ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-soft cursor-pointer'
                                                        : 'bg-gray-50 border-gray-100'
                                                } ${
                                                    isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className={`text-sm font-semibold mb-1 ${
                                                    isCurrentMonth ? (isToday ? 'text-blue-600' : 'text-gray-900') : 'text-gray-400'
                                                }`}>
                                                    {isCurrentMonth ? day : ''}
                                                </div>
                                                {hasAlocation && (
                                                    <div className="space-y-1">
                                                        <div className="h-1.5 bg-blue-500 rounded-full"></div>
                                                        <div className="h-1.5 bg-green-500 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        {/* Sidebar com Informações */}
                        <div className="space-y-4">
                            {/* Legenda */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-soft">
                                <h3 className="font-bold text-gray-900 mb-3 text-sm">Legenda</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600">Planejada</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600">Em Andamento</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600">Concluída</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-xs text-gray-600">Cancelada</span>
                                    </div>
                                </div>
                            </div>

                            {/* Equipes Ativas */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-soft">
                                <h3 className="font-bold text-gray-900 mb-3 text-sm">Equipes Ativas</h3>
                                <div className="space-y-2">
                                    {equipes.filter(e => e.ativa).slice(0, 5).map(equipe => (
                                        <div key={equipe.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{equipe.nome}</p>
                                                <p className="text-xs text-gray-500">{equipe.tipo}</p>
                                            </div>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold ml-2">
                                                {equipe.membros?.length || 0}
                                            </span>
                                        </div>
                                    ))}
                                    {equipes.filter(e => e.ativa).length === 0 && (
                                        <p className="text-xs text-gray-500 text-center py-4">Nenhuma equipe ativa</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Próximas Alocações */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-soft">
                                <h3 className="font-bold text-gray-900 mb-3 text-sm">Próximas Alocações</h3>
                                <div className="space-y-2">
                                    {alocacoes.filter(a => a.status !== 'Cancelada').slice(0, 3).map((alocacao) => (
                                        <div key={alocacao.id} className={`p-2 rounded-lg ${
                                            alocacao.status === 'EmAndamento' ? 'bg-green-50' :
                                            alocacao.status === 'Planejada' ? 'bg-blue-50' : 'bg-orange-50'
                                        }`}>
                                            <p className={`text-xs font-semibold ${
                                                alocacao.status === 'EmAndamento' ? 'text-green-800' :
                                                alocacao.status === 'Planejada' ? 'text-blue-800' : 'text-orange-800'
                                            }`}>
                                                {alocacao.equipe?.nome || 'Equipe'}
                                            </p>
                                            <p className={`text-xs ${
                                                alocacao.status === 'EmAndamento' ? 'text-green-600' :
                                                alocacao.status === 'Planejada' ? 'text-blue-600' : 'text-orange-600'
                                            }`}>
                                                {new Date(alocacao.dataInicio).toLocaleDateString('pt-BR')} - {new Date(alocacao.dataFim).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    ))}
                                    {alocacoes.filter(a => a.status !== 'Cancelada').length === 0 && (
                                        <p className="text-xs text-gray-500 text-center py-4">Nenhuma alocação agendada</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'gantt' && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Timeline Gantt</h2>
                                <p className="text-sm text-gray-500 mt-1">Visualização de alocações das equipes ao longo do tempo</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                                    ↻ Atualizar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm ring-1 ring-blue-200/50">
                                    <UsersIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Equipes Ativas</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {equipes.filter(e => e.ativa).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-sm ring-1 ring-green-200/50">
                                    <CalendarIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Alocações Ativas</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {alocacoes.filter(a => a.status === 'EmAndamento').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center shadow-sm ring-1 ring-purple-200/50">
                                    <ChartBarIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Planejadas</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {alocacoes.filter(a => a.status === 'Planejada').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm ring-1 ring-orange-200/50">
                                    <CalendarIcon className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Concluídas</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {alocacoes.filter(a => a.status === 'Concluida').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Principal */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Timeline de Alocações por Equipe</h3>
                        
                        {equipes.length === 0 ? (
                            <div className="text-center py-16">
                                <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma equipe cadastrada</h3>
                                <p className="text-gray-500 mb-6">Para visualizar o cronograma, é necessário cadastrar equipes primeiro.</p>
                                <button
                                    onClick={() => setActiveTab('equipes')}
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                                >
                                    Gerenciar Equipes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Header da Timeline - Meses */}
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                                    <div className="w-48 font-semibold text-sm text-gray-700">Equipe</div>
                                    <div className="flex-1 grid grid-cols-12 gap-1">
                                        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, idx) => (
                                            <div key={idx} className="text-center text-xs font-semibold text-gray-600">
                                                {mes}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Linhas das Equipes */}
                                {equipes.map((equipe) => {
                                    const equipeAlocacoes = alocacoes.filter(a => a.equipeId === equipe.id);
                                    
                                    return (
                                        <div key={equipe.id} className="flex items-center gap-4 group">
                                            {/* Info da Equipe */}
                                            <div className="w-48">
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 group-hover:border-blue-300 transition-colors">
                                                    <h4 className="font-semibold text-sm text-gray-900 truncate">{equipe.nome}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">{equipe.tipo}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <UsersIcon className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-600">{equipe.membros?.length || 0} membros</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Timeline Grid */}
                                            <div className="flex-1 relative h-16">
                                                {/* Grid de fundo */}
                                                <div className="absolute inset-0 grid grid-cols-12 gap-1">
                                                    {Array.from({ length: 12 }).map((_, idx) => (
                                                        <div key={idx} className="bg-gray-50 rounded border border-gray-100"></div>
                                                    ))}
                                                </div>
                                                
                                                {/* Barras de Alocação */}
                                                {equipeAlocacoes.length > 0 ? (
                                                    equipeAlocacoes.map((alocacao, idx) => {
                                                        const startDate = new Date(alocacao.dataInicio);
                                                        const endDate = new Date(alocacao.dataFim);
                                                        const startMonth = startDate.getMonth();
                                                        const endMonth = endDate.getMonth();
                                                        const duration = endMonth - startMonth + 1;
                                                        const left = (startMonth / 12) * 100;
                                                        const width = (duration / 12) * 100;
                                                        
                                                        const colors = {
                                                            Planejada: 'bg-blue-500',
                                                            EmAndamento: 'bg-green-500',
                                                            Concluida: 'bg-orange-500',
                                                            Cancelada: 'bg-red-500'
                                                        };
                                                        
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`absolute h-10 rounded-lg ${colors[alocacao.status]} shadow-md flex items-center justify-center text-white text-xs font-semibold px-2 hover:shadow-lg transition-all cursor-pointer group/bar`}
                                                                style={{
                                                                    left: `${left}%`,
                                                                    width: `${width}%`,
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)'
                                                                }}
                                                                title={`${alocacao.status} - ${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}`}
                                                            >
                                                                <span className="truncate">{alocacao.status}</span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs text-gray-400">Sem alocações</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Legenda */}
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Legenda de Status</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-medium">Planejada</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-medium">Em Andamento</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-500 rounded shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-medium">Concluída</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-medium">Cancelada</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        {/* Modal de Formação de Equipes com Pessoas Disponíveis */}
        {isEquipeManagerOpen && (
            <ModalEquipesDeObra isOpen={isEquipeManagerOpen} onClose={() => setIsEquipeManagerOpen(false)} />
        )}

        {isAlocacaoModalOpen && projetoSelecionadoId && (
            <ModalAlocacaoEquipe
                isOpen={isAlocacaoModalOpen}
                onClose={() => setIsAlocacaoModalOpen(false)}
                projetoId={projetoSelecionadoId}
            />
        )}

            {/* Modal de Equipe */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {equipeToEdit ? 'Editar Equipe' : 'Nova Equipe'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome da Equipe *
                                </label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formState.nome}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Ex: Equipe Elétrica Alpha"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tipo de Equipe *
                                </label>
                                <select
                                    name="tipo"
                                    value={formState.tipo}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Selecione o tipo</option>
                                    <option value="MONTAGEM">Montagem</option>
                                    <option value="CAMPO">Campo</option>
                                    <option value="DISTINTA">Distinta</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Eletricistas Disponíveis *
                                </label>
                                {loadingEletricistas ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : eletricistas.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <UsersIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p>Nenhum eletricista cadastrado no sistema.</p>
                                        <p className="text-xs mt-1">Cadastre eletricistas em Configurações → Usuários</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                                        {eletricistas.map((eletricista) => {
                                            const isSelected = formState.membrosIds.includes(eletricista.id);
                                            return (
                                                <button
                                                    key={eletricista.id}
                                                    type="button"
                                                    onClick={() => isSelected ? handleRemoveMembroId(eletricista.id) : handleAddEletricista(eletricista.id)}
                                                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                                                        isSelected 
                                                            ? 'border-blue-500 bg-blue-50' 
                                                            : 'border-gray-200 bg-white hover:border-blue-300'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                                        }`}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                                {eletricista.name}
                                                            </p>
                                                            <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                                                {eletricista.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Selecionados: <strong>{formState.membrosIds.length}</strong> eletricista(s)</span>
                                </div>
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
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                                >
                                    {equipeToEdit ? 'Atualizar' : 'Criar'} Equipe
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestaoObras;
