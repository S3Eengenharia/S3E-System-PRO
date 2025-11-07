import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ObraKanban from '../components/ObraKanban';
import { obrasService } from '../services/obrasService';
import { projetosService, type CreateProjetoData } from '../services/projetosService';
import { clientesService, type Cliente } from '../services/clientesService';
import { orcamentosService, type Orcamento } from '../services/orcamentosService';
import { axiosApiService } from '../services/axiosApi';

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

const BuildingOffice2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
);

const ClipboardDocumentCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.25m-12 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-13.5 0v2.625c0 .621.504 1.125 1.125 1.125h2.625m0 0h5.625c.621 0 1.125-.504 1.125-1.125V21m-9 0h9m-12-3.75h.008v.008H4.5V15.75zm0 3h.008v.008H4.5V18.75zm3-6h.008v.008H7.5V12.75zm0 3h.008v.008H7.5V15.75zm0 3h.008v.008H7.5V18.75zm3-6h.008v.008h-.008V12.75zm0 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75zm3-6h.008v.008h-.008V12.75zm0 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75zm3-6h.008v.008H16.5V12.75zm0 3h.008v.008H16.5V15.75zm0 3h.008v.008H16.5V18.75zm3-6h.008v.008h-.008V12.75zm0 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75zm3-6h.008v.008h-.008V12.75z" />
    </svg>
);

const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
);

const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ObrasKanbanProps {
    toggleSidebar: () => void;
}

const ObrasKanbanPage: React.FC<ObrasKanbanProps> = ({ toggleSidebar }) => {
    const [isModalNovaObraOpen, setIsModalNovaObraOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Estados para o formulário
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
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

    // Carregar dados ao montar o componente
    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        await Promise.all([
            carregarClientes(),
            carregarUsuarios(),
            carregarOrcamentos()
        ]);
    };

    const carregarClientes = async () => {
        try {
            const response = await clientesService.listar();
            if (response.success && response.data) {
                setClientes(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    };

    const carregarUsuarios = async () => {
        try {
            const response = await axiosApiService.get<any[]>('/api/configuracoes/usuarios');
            if (response.success && response.data) {
                const usuariosArray = Array.isArray(response.data) ? response.data : [];
                const usuariosFiltrados = usuariosArray.filter((u: any) => 
                    ['admin', 'gerente', 'engenheiro', 'orcamentista'].includes(u.role?.toLowerCase())
                );
                setUsuarios(usuariosFiltrados);
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    };

    const carregarOrcamentos = async () => {
        try {
            const response = await orcamentosService.listar({ status: 'Aprovado' });
            if (response.success && response.data) {
                setOrcamentos(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
        }
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleOpenModal = () => {
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
        setIsModalNovaObraOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalNovaObraOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar se orçamento foi selecionado
        if (!formState.orcamentoId) {
            toast.error('Orçamento obrigatório', {
                description: 'Selecione um orçamento aprovado para criar a obra.'
            });
            return;
        }
        
        try {
            // Preparar dados para envio
            const dadosProjeto: any = {
                orcamentoId: formState.orcamentoId,
                titulo: formState.titulo,
                descricao: formState.descricao,
                tipo: formState.tipo,
                clienteId: formState.clienteId,
                responsavelId: formState.responsavelId,
                dataInicio: formState.dataInicio,
                dataPrevisao: formState.dataPrevisao
            };

            console.log('🏗️ Dados da obra a serem enviados:', dadosProjeto);
            console.log('📋 Validação:');
            console.log('  - Orçamento ID:', formState.orcamentoId || '❌ VAZIO');
            console.log('  - Título:', formState.titulo || '❌ VAZIO');
            console.log('  - Cliente ID:', formState.clienteId || '⚠️ Opcional');
            console.log('  - Responsável ID:', formState.responsavelId || '⚠️ Opcional');

            const response = await projetosService.criar(dadosProjeto);
            
            console.log('📥 Resposta do servidor:', response);
            
            if (response.success) {
                toast.success('Obra criada com sucesso!', {
                    description: `A obra "${formState.titulo}" foi cadastrada.`
                });
                handleCloseModal();
                handleRefresh();
            } else {
                const errorMessage = response.error || 'Erro desconhecido';
                console.error('❌ Erro ao criar obra:', errorMessage);
                toast.error('Erro ao criar obra', {
                    description: errorMessage,
                    duration: 5000
                });
            }
        } catch (error) {
            console.error('Erro ao salvar obra:', error);
            toast.error('Erro ao salvar obra', {
                description: 'Verifique os dados e tente novamente.'
            });
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Obras</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerencie projetos e acompanhe execução</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all shadow-lg font-semibold"
                >
                    <PlusIcon className="w-5 h-5" />
                    Nova Obra
                </button>
            </header>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <BuildingOffice2Icon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Total de Obras</p>
                            <p className="text-2xl font-bold text-orange-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <ClipboardDocumentCheckIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Planejamento</p>
                            <p className="text-2xl font-bold text-gray-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Em Execução</p>
                            <p className="text-2xl font-bold text-blue-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <CheckBadgeIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Controle Qualidade</p>
                            <p className="text-2xl font-bold text-purple-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Concluídas</p>
                            <p className="text-2xl font-bold text-green-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Valor Total</p>
                            <p className="text-xl font-bold text-emerald-600">R$ 0K</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quadro Kanban */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Quadro de Execução</h2>
                    <p className="text-sm text-gray-500 mt-1">Arraste os cards para mover entre as etapas</p>
                </div>
                <ObraKanban key={refreshKey} onRefresh={handleRefresh} />
            </div>

            {/* MODAL DE CRIAÇÃO DE OBRA - COMPLETO */}
            {isModalNovaObraOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        {/* Header do Modal */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-amber-600 to-amber-500">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <BuildingOffice2Icon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Nova Obra</h2>
                                    <p className="text-sm text-white/80 mt-1">Cadastre uma nova obra de campo</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Orçamento Vinculado */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Orçamento *
                                    </label>
                                    <select
                                        value={formState.orcamentoId}
                                        onChange={(e) => setFormState({...formState, orcamentoId: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    >
                                        <option value="">Selecione um orçamento aprovado</option>
                                        {orcamentos.map(orcamento => (
                                            <option key={orcamento.id} value={orcamento.id}>
                                                {orcamento.titulo} - Cliente: {orcamento.cliente?.nome} - R$ {orcamento.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </option>
                                        ))}
                                    </select>
                                    {orcamentos.length === 0 && (
                                        <p className="text-xs text-orange-600 mt-1">
                                            ⚠️ Nenhum orçamento aprovado encontrado. Crie e aprove um orçamento primeiro.
                                        </p>
                                    )}
                                </div>

                                {/* Título da Obra */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Título da Obra *
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.titulo}
                                        onChange={(e) => setFormState({...formState, titulo: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                        placeholder="Ex: Instalação Elétrica Edifício Phoenix"
                                    />
                                </div>

                                {/* Cliente */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cliente
                                    </label>
                                    <select
                                        value={formState.clienteId}
                                        onChange={(e) => setFormState({...formState, clienteId: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    >
                                        <option value="">Selecione o cliente</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Responsável */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Responsável Técnico
                                    </label>
                                    <select
                                        value={formState.responsavelId}
                                        onChange={(e) => setFormState({...formState, responsavelId: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    >
                                        <option value="">Selecione o responsável</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nome} - {usuario.role}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tipo de Obra */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tipo de Obra
                                    </label>
                                    <select
                                        value={formState.tipo}
                                        onChange={(e) => setFormState({...formState, tipo: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    >
                                        <option value="Instalacao">Instalação</option>
                                        <option value="Manutencao">Manutenção</option>
                                        <option value="Retrofit">Retrofit</option>
                                        <option value="Automacao">Automação</option>
                                    </select>
                                </div>

                                {/* Data de Início */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Data de Início
                                    </label>
                                    <input
                                        type="date"
                                        value={formState.dataInicio}
                                        onChange={(e) => setFormState({...formState, dataInicio: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Data Prevista de Conclusão */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Data Prevista de Conclusão
                                    </label>
                                    <input
                                        type="date"
                                        value={formState.dataPrevisao}
                                        onChange={(e) => setFormState({...formState, dataPrevisao: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                    />
                                </div>

                                {/* Descrição */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descrição da Obra
                                    </label>
                                    <textarea
                                        value={formState.descricao}
                                        onChange={(e) => setFormState({...formState, descricao: e.target.value})}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                        placeholder="Descreva os detalhes da obra, escopo, observações importantes..."
                                    />
                                </div>
                            </div>

                            {/* Informação Adicional */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">💡 Dica Importante</h4>
                                        <p className="text-sm text-blue-800">
                                            Após criar a obra, você poderá alocar equipes de eletricistas, gerenciar materiais e acompanhar o progresso através do quadro Kanban.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botões de Ação */}
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
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all shadow-medium font-semibold"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Criar Obra
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObrasKanbanPage;

