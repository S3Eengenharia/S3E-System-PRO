import React, { useState, useEffect, useMemo } from 'react';
import { orcamentosService, type Orcamento as ApiOrcamento, type CreateOrcamentoData } from '../services/orcamentosService';
import { clientesService, type Cliente } from '../services/clientesService';
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

// Types
interface Cliente {
    id: string;
    nome: string;
    cpfCnpj: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    ativo: boolean;
}

interface Material {
    id: string;
    nome: string;
    sku: string;
    unidadeMedida: string;
    preco: number;
    estoque: number;
    categoria: string;
    ativo: boolean;
    fornecedor?: {
        id: string;
        nome: string;
    };
}

interface OrcamentoItem {
    id?: string;
    tipo: 'MATERIAL' | 'KIT' | 'SERVICO';
    materialId?: string;
    kitId?: string;
    servicoNome?: string;
    nome: string;
    unidadeMedida: string;
    quantidade: number;
    custoUnit: number;
    precoUnit: number;
    subtotal: number;
}

interface Orcamento {
    id: string;
    clienteId: string;
    titulo: string;
    descricao?: string;
    validade: string;
    bdi: number;
    custoTotal: number;
    precoVenda: number;
    observacoes?: string;
    status: 'Pendente' | 'Aprovado' | 'Recusado';
    createdAt: string;
    cliente?: {
        id: string;
        nome: string;
        cpfCnpj: string;
    };
    items: OrcamentoItem[];
}

interface OrcamentosProps {
    toggleSidebar: () => void;
}

const Orcamentos: React.FC<OrcamentosProps> = ({ toggleSidebar }) => {
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [statusFilter, setStatusFilter] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orcamentoToEdit, setOrcamentoToEdit] = useState<Orcamento | null>(null);
    const [orcamentoToView, setOrcamentoToView] = useState<Orcamento | null>(null);
    
    // Form state
    const [formState, setFormState] = useState({
        clienteId: '',
        titulo: '',
        descricao: '',
        validade: '',
        bdi: 20,
        observacoes: ''
    });

    const [items, setItems] = useState<OrcamentoItem[]>([]);
    const [showItemModal, setShowItemModal] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');

    // Carregar dados iniciais usando os serviços adequados
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Carregando dados de orçamentos via serviços...');
            
            const [orcamentosRes, clientesRes, materiaisRes] = await Promise.all([
                orcamentosService.listar(),
                clientesService.listar(),
                axiosApiService.get<Material[]>(ENDPOINTS.MATERIAIS)
            ]);

            console.log('📊 Resposta do serviço - Orçamentos:', orcamentosRes);
            console.log('👥 Resposta do serviço - Clientes:', clientesRes);
            console.log('📦 Resposta da API - Materiais:', materiaisRes);

            // Tratar orçamentos usando o serviço
            if (orcamentosRes.success && orcamentosRes.data) {
                const orcamentosData = Array.isArray(orcamentosRes.data) ? orcamentosRes.data : [];
                setOrcamentos(orcamentosData);
                console.log(`✅ ${orcamentosData.length} orçamentos carregados`);
            } else {
                console.warn('⚠️ Erro ao carregar orçamentos:', orcamentosRes.error);
                setOrcamentos([]);
            }

            // Tratar clientes usando o serviço
            if (clientesRes.success && clientesRes.data) {
                const clientesData = Array.isArray(clientesRes.data) ? clientesRes.data : [];
                setClientes(clientesData);
                console.log(`✅ ${clientesData.length} clientes carregados`);
            } else {
                console.warn('⚠️ Erro ao carregar clientes:', clientesRes.error);
                setClientes([]);
            }

            // Tratar materiais
            if (materiaisRes.success && materiaisRes.data) {
                const materiaisData = Array.isArray(materiaisRes.data) ? materiaisRes.data : [];
                setMateriais(materiaisData);
                console.log(`✅ ${materiaisData.length} materiais carregados`);
            } else {
                console.warn('⚠️ Erro ao carregar materiais:', materiaisRes.error);
                setMateriais([]);
            }

        } catch (err) {
            console.error('❌ Erro crítico ao carregar dados:', err);
            setError('Erro de conexão ao carregar dados');
            setOrcamentos([]);
            setClientes([]);
            setMateriais([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrar materiais para seleção
    const filteredMaterials = useMemo(() => {
        if (!Array.isArray(materiais)) return [];
        
        return materiais
            .filter(material => material.ativo && material.estoque > 0)
            .filter(material =>
                material.nome.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                material.sku.toLowerCase().includes(itemSearchTerm.toLowerCase())
            );
    }, [materiais, itemSearchTerm]);

    // Filtrar orçamentos
    const filteredOrcamentos = useMemo(() => {
        if (!Array.isArray(orcamentos)) return [];
        
        return orcamentos
            .filter(orc => statusFilter === 'Todos' || orc.status === statusFilter)
            .filter(orc =>
                orc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (orc.cliente?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [orcamentos, statusFilter, searchTerm]);

    // Calcular total do orçamento
    const calculateTotal = () => {
        return items.reduce((total, item) => total + item.subtotal, 0);
    };

    // Abrir modal
    const handleOpenModal = (orcamento: Orcamento | null = null) => {
        if (orcamento) {
            setOrcamentoToEdit(orcamento);
            setFormState({
                clienteId: orcamento.clienteId,
                titulo: orcamento.titulo,
                descricao: orcamento.descricao || '',
                validade: orcamento.validade.split('T')[0],
                bdi: orcamento.bdi,
                observacoes: orcamento.observacoes || ''
            });
            setItems(orcamento.items);
        } else {
            setOrcamentoToEdit(null);
            setFormState({
                clienteId: '',
                titulo: '',
                descricao: '',
                validade: '',
                bdi: 20,
                observacoes: ''
            });
            setItems([]);
        }
        setIsModalOpen(true);
    };

    // Fechar modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setShowItemModal(false);
        setOrcamentoToEdit(null);
        setFormState({
            clienteId: '',
            titulo: '',
            descricao: '',
            validade: '',
            bdi: 20,
            observacoes: ''
        });
        setItems([]);
    };

    // Adicionar item ao orçamento
    const handleAddItem = (material: Material) => {
        const newItem: OrcamentoItem = {
            tipo: 'MATERIAL',
            materialId: material.id,
            nome: material.nome,
            unidadeMedida: material.unidadeMedida,
            quantidade: 1,
            custoUnit: material.preco,
            precoUnit: material.preco * (1 + formState.bdi / 100),
            subtotal: material.preco * (1 + formState.bdi / 100)
        };

        setItems(prev => [...prev, newItem]);
        setShowItemModal(false);
        setItemSearchTerm('');
    };

    // Remover item
    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Atualizar quantidade do item
    const handleUpdateItemQuantity = (index: number, quantidade: number) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                const precoUnit = item.custoUnit * (1 + formState.bdi / 100);
                return {
                    ...item,
                    quantidade,
                    precoUnit,
                    subtotal: precoUnit * quantidade
                };
            }
            return item;
        }));
    };

    // Atualizar BDI e recalcular preços
    const handleBdiChange = (newBdi: number) => {
        setFormState(prev => ({ ...prev, bdi: newBdi }));
        
        setItems(prev => prev.map(item => {
            const precoUnit = item.custoUnit * (1 + newBdi / 100);
            return {
                ...item,
                precoUnit,
                subtotal: precoUnit * item.quantidade
            };
        }));
    };

    // Salvar orçamento usando o serviço
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (items.length === 0) {
            setError('Adicione pelo menos um item ao orçamento');
            return;
        }

        try {
            console.log('💾 Salvando orçamento...', formState);

            const orcamentoData: CreateOrcamentoData = {
                clienteId: formState.clienteId,
                titulo: formState.titulo,
                descricao: formState.descricao,
                validade: formState.validade,
                bdi: formState.bdi,
                observacoes: formState.observacoes,
                items: items.map(item => ({
                    tipo: item.tipo,
                    materialId: item.materialId,
                    kitId: item.kitId,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnit,
                    subtotal: item.subtotal,
                    descricao: item.nome
                }))
            };

            console.log('📤 Enviando dados do orçamento:', orcamentoData);

            let response;
            if (orcamentoToEdit) {
                response = await orcamentosService.atualizar(orcamentoToEdit.id, orcamentoData);
            } else {
                response = await orcamentosService.criar(orcamentoData);
            }

            console.log('📥 Resposta do servidor:', response);

            if (response.success || response.statusCode === 201) {
                console.log('✅ Orçamento salvo com sucesso');
                handleCloseModal();
                await loadData();
                
                // Mostrar mensagem de sucesso
                alert(`Orçamento ${orcamentoToEdit ? 'atualizado' : 'criado'} com sucesso!`);
            } else {
                const errorMsg = response.error || 'Erro ao salvar orçamento';
                console.warn('⚠️ Erro ao salvar:', errorMsg);
                setError(errorMsg);
            }
        } catch (err) {
            console.error('❌ Erro crítico ao salvar orçamento:', err);
            const errorMsg = 'Erro de conexão ao salvar orçamento';
            setError(errorMsg);
        }
    };

    // Alterar status do orçamento
    const handleChangeStatus = async (orcamentoId: string, novoStatus: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado') => {
        try {
            console.log(`🔄 Alterando status do orçamento ${orcamentoId} para ${novoStatus}...`);
            
            const response = await orcamentosService.atualizarStatus(orcamentoId, novoStatus);
            
            if (response.success) {
                console.log('✅ Status alterado com sucesso');
                await loadData();
                alert(response.message || `Status alterado para ${novoStatus}`);
            } else {
                const errorMsg = response.error || 'Erro ao alterar status';
                console.warn('⚠️ Erro ao alterar status:', errorMsg);
                alert(errorMsg);
            }
        } catch (err) {
            console.error('❌ Erro crítico ao alterar status:', err);
            alert('Erro de conexão ao alterar status');
        }
    };

    // Baixar PDF do orçamento
    const handleDownloadPDF = async (orcamentoId: string, nomeCliente: string) => {
        try {
            console.log(`📄 Gerando PDF do orçamento ${orcamentoId}...`);
            
            const result = await orcamentosService.baixarPDF(orcamentoId, nomeCliente);
            
            if (result.success) {
                console.log('✅ PDF baixado com sucesso');
            } else {
                const errorMsg = result.error || 'Erro ao baixar PDF';
                console.warn('⚠️ Erro ao baixar PDF:', errorMsg);
                alert(errorMsg);
            }
        } catch (err) {
            console.error('❌ Erro crítico ao baixar PDF:', err);
            alert('Erro ao gerar PDF do orçamento');
        }
    };

    // Status styling
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Pendente': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
            case 'Aprovado': return 'bg-green-100 text-green-800 ring-1 ring-green-200';
            case 'Recusado': return 'bg-red-100 text-red-800 ring-1 ring-red-200';
            default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando orçamentos...</p>
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
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Orçamentos</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerencie seus orçamentos e propostas comerciais</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-semibold disabled:opacity-50"
                        title="Recarregar dados"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Carregando...' : 'Atualizar'}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium font-semibold"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Novo Orçamento
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <p className="text-red-800 font-medium">⚠️ {error}</p>
                        <button 
                            onClick={loadData}
                            className="text-red-700 hover:text-red-900 font-medium underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título ou cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="Todos">Todos os Status</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Recusado">Recusado</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Exibindo <span className="font-bold text-gray-900">{filteredOrcamentos.length}</span> de <span className="font-bold text-gray-900">{orcamentos.length}</span> orçamentos
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Pendente: {orcamentos.filter(o => o.status === 'Pendente').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Aprovado: {orcamentos.filter(o => o.status === 'Aprovado').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Recusado: {orcamentos.filter(o => o.status === 'Recusado').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : orcamentos.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-xs text-gray-600">
                                {error ? 'API Error' : orcamentos.length > 0 ? 'API Online' : 'Carregando...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Orçamentos */}
            {filteredOrcamentos.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📋</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || statusFilter !== 'Todos'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece criando seu primeiro orçamento'}
                    </p>
                    {!searchTerm && statusFilter === 'Todos' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium font-semibold"
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            Criar Primeiro Orçamento
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrcamentos.map((orcamento) => (
                        <div key={orcamento.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-purple-300 transition-all duration-200">
                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{orcamento.titulo}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 ring-1 ring-purple-200">
                                            📋 Orçamento
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getStatusClass(orcamento.status)}`}>
                                    {orcamento.status === 'Pendente' && '⏳ '}
                                    {orcamento.status === 'Aprovado' && '✅ '}
                                    {orcamento.status === 'Recusado' && '❌ '}
                                    {orcamento.status}
                                </span>
                            </div>

                            {/* Informações */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>👤</span>
                                    <span className="truncate">{orcamento.cliente?.nome || 'Cliente não informado'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>💰</span>
                                    <span className="font-bold text-purple-700">
                                        R$ {orcamento.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📅</span>
                                    <span>Válido até: {new Date(orcamento.validade).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📝</span>
                                    <span>{orcamento.items?.length || 0} item(s)</span>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setOrcamentoToView(orcamento)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    Ver
                                </button>
                                <button
                                    onClick={() => handleOpenModal(orcamento)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Editar
                                </button>
                                {orcamento.status === 'Pendente' && (
                                    <button
                                        onClick={() => handleChangeStatus(orcamento.id, 'Aprovado')}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold"
                                        title="Aprovar orçamento"
                                    >
                                        ✅
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        {/* Header */}
                        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-medium ring-2 ring-purple-100">
                                    {orcamentoToEdit ? <PencilIcon className="w-7 h-7 text-white" /> : <PlusIcon className="w-7 h-7 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {orcamentoToEdit ? 'Editar Orçamento' : 'Novo Orçamento'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {orcamentoToEdit ? 'Atualize as informações do orçamento' : 'Crie uma nova proposta comercial'}
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
                            {/* Informações Básicas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cliente *
                                    </label>
                                    <select
                                        value={formState.clienteId}
                                        onChange={(e) => setFormState(prev => ({ ...prev, clienteId: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Selecione um cliente</option>
                                        {Array.isArray(clientes) && clientes.length > 0 ? (
                                            clientes.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>
                                                    {cliente.nome} - {cliente.cpfCnpj}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Nenhum cliente disponível</option>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.titulo}
                                        onChange={(e) => setFormState(prev => ({ ...prev, titulo: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="Ex: Orçamento para instalação elétrica"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Validade *
                                    </label>
                                    <input
                                        type="date"
                                        value={formState.validade}
                                        onChange={(e) => setFormState(prev => ({ ...prev, validade: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        BDI (%) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formState.bdi}
                                        onChange={(e) => handleBdiChange(Number(e.target.value))}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formState.descricao}
                                    onChange={(e) => setFormState(prev => ({ ...prev, descricao: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    placeholder="Descreva o projeto ou serviço..."
                                />
                            </div>

                            {/* Itens do Orçamento */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Itens do Orçamento</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowItemModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Adicionar Item
                                    </button>
                                </div>

                                {items.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">Nenhum item adicionado</p>
                                        <p className="text-gray-400 text-sm mt-1">Clique em "Adicionar Item" para começar</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{item.nome}</p>
                                                        <p className="text-sm text-gray-600">{item.unidadeMedida}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantidade}
                                                            onChange={(e) => handleUpdateItemQuantity(index, Number(e.target.value))}
                                                            min="1"
                                                            step="0.01"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Valor Unit.</label>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            R$ {item.precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Subtotal</label>
                                                        <p className="text-sm font-bold text-purple-700">
                                                            R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 p-4 rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold text-gray-800">Total Geral:</span>
                                                <span className="text-2xl font-bold text-purple-700">
                                                    R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Observações
                                </label>
                                <textarea
                                    value={formState.observacoes}
                                    onChange={(e) => setFormState(prev => ({ ...prev, observacoes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    placeholder="Informações adicionais sobre o orçamento..."
                                />
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
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium font-semibold"
                                >
                                    {orcamentoToEdit ? 'Atualizar' : 'Criar'} Orçamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE SELEÇÃO DE ITENS */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
                    <div className="bg-white rounded-2xl shadow-strong w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Selecionar Material</h3>
                                <p className="text-sm text-gray-600 mt-1">Escolha um material para adicionar ao orçamento</p>
                            </div>
                            <button onClick={() => setShowItemModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar materiais por nome ou SKU..."
                                        value={itemSearchTerm}
                                        onChange={(e) => setItemSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {filteredMaterials.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">Nenhum material disponível</p>
                                        <p className="text-gray-400 text-sm mt-1">Verifique se há materiais cadastrados com estoque</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredMaterials.map((material) => (
                                            <div 
                                                key={material.id} 
                                                className="bg-gray-50 border-2 border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                                onClick={() => handleAddItem(material)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-900">{material.nome}</h4>
                                                    <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-lg">
                                                        Estoque: {material.estoque}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">SKU: {material.sku}</p>
                                                <p className="text-sm text-gray-600 mb-2">Unidade: {material.unidadeMedida}</p>
                                                <p className="text-lg font-bold text-blue-700">
                                                    R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE VISUALIZAÇÃO */}
            {orcamentoToView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Orçamento</h2>
                                <p className="text-sm text-gray-600 mt-1">Visualização completa do orçamento</p>
                            </div>
                            <button onClick={() => setOrcamentoToView(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Cliente</h3>
                                    <p className="text-gray-900 font-medium">{orcamentoToView.cliente?.nome || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusClass(orcamentoToView.status)}`}>
                                        {orcamentoToView.status === 'Pendente' && '⏳ '}
                                        {orcamentoToView.status === 'Aprovado' && '✅ '}
                                        {orcamentoToView.status === 'Recusado' && '❌ '}
                                        {orcamentoToView.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Total</h3>
                                    <p className="text-2xl font-bold text-purple-700">R$ {orcamentoToView.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Validade</h3>
                                    <p className="text-gray-900 font-medium">{new Date(orcamentoToView.validade).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            {orcamentoToView.descricao && (
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                                    <p className="text-gray-700">{orcamentoToView.descricao}</p>
                                </div>
                            )}

                            {orcamentoToView.items && orcamentoToView.items.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-4">Itens do Orçamento</h3>
                                    <div className="space-y-3">
                                        {orcamentoToView.items.map((item, index) => (
                                            <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{item.nome}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {item.quantidade} {item.unidadeMedida} × R$ {item.precoUnit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg text-purple-700">
                                                            R$ {item.subtotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {orcamentoToView.observacoes && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
                                    <p className="text-gray-700">{orcamentoToView.observacoes}</p>
                                </div>
                            )}

                            {/* Ações do Orçamento */}
                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                {orcamentoToView.status === 'Pendente' && (
                                    <>
                                        <button
                                            onClick={() => handleChangeStatus(orcamentoToView.id, 'Aprovado')}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold"
                                        >
                                            ✅ Aprovar Orçamento
                                        </button>
                                        <button
                                            onClick={() => handleChangeStatus(orcamentoToView.id, 'Rejeitado')}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2.5 rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-medium font-semibold"
                                        >
                                            ❌ Rejeitar
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDownloadPDF(orcamentoToView.id, orcamentoToView.cliente?.nome || 'Cliente')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-semibold"
                                >
                                    📄 Baixar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orcamentos;