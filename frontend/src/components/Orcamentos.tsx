import React, { useState, useEffect, useMemo } from 'react';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';

// Icons
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

    // Carregar dados iniciais
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Carregando dados de orçamentos...');
            
            const [orcamentosRes, clientesRes, materiaisRes] = await Promise.all([
                axiosApiService.get<Orcamento[]>('/api/orcamentos'),
                axiosApiService.get<any>('/api/clientes'),
                axiosApiService.get<any>('/api/materiais')
            ]);

            console.log('📊 Resposta da API - Orçamentos:', orcamentosRes);
            console.log('👥 Resposta da API - Clientes:', clientesRes);
            console.log('📦 Resposta da API - Materiais:', materiaisRes);

            // Tratar orçamentos
            if (orcamentosRes.success && orcamentosRes.data && Array.isArray(orcamentosRes.data)) {
                setOrcamentos(orcamentosRes.data);
            } else {
                console.warn('Dados de orçamentos inválidos:', orcamentosRes);
                setOrcamentos([]);
            }

            // Tratar clientes
            if (clientesRes.success && clientesRes.data) {
                const clientesData = clientesRes.data.data || clientesRes.data;
                if (Array.isArray(clientesData)) {
                    setClientes(clientesData);
                } else {
                    console.warn('Dados de clientes inválidos:', clientesData);
                    setClientes([]);
                }
            } else {
                console.warn('Resposta de clientes inválida:', clientesRes);
                setClientes([]);
            }

            // Tratar materiais
            if (materiaisRes.success && materiaisRes.data && Array.isArray(materiaisRes.data)) {
                setMateriais(materiaisRes.data);
            } else {
                console.warn('Dados de materiais inválidos:', materiaisRes);
                setMateriais([]);
            }

        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar dados');
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

    // Salvar orçamento
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (items.length === 0) {
            setError('Adicione pelo menos um item ao orçamento');
            return;
        }

        try {
            const orcamentoData = {
                ...formState,
                validade: new Date(formState.validade).toISOString(),
                items: items.map(item => ({
                    tipo: item.tipo,
                    materialId: item.materialId,
                    kitId: item.kitId,
                    servicoNome: item.servicoNome,
                    quantidade: item.quantidade,
                    custoUnit: item.custoUnit
                }))
            };

            console.log('📤 Enviando dados do orçamento:', orcamentoData);

            let response;
            if (orcamentoToEdit) {
                response = await axiosApiService.put(`/api/orcamentos/${orcamentoToEdit.id}`, orcamentoData);
            } else {
                response = await axiosApiService.post('/api/orcamentos', orcamentoData);
            }

            console.log('📥 Resposta do servidor:', response);

            if (response.success || response.statusCode === 201) {
                handleCloseModal();
                await loadData();
            } else {
                setError(response.error || 'Erro ao salvar orçamento');
            }
        } catch (err) {
            console.error('Erro ao salvar orçamento:', err);
            setError('Erro ao salvar orçamento: ' + (err as Error).message);
        }
    };

    // Status styling
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Pendente': return 'bg-yellow-100 text-yellow-800';
            case 'Aprovado': return 'bg-green-100 text-green-800';
            case 'Recusado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-8">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-gray-800">Gestão de Orçamentos</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-brand-blue text-white px-4 py-2 rounded-lg shadow-md hover:bg-brand-blue/90 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Novo Orçamento
                </button>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por título ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                    >
                        <option value="Todos">Todos</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Recusado">Recusado</option>
                    </select>
                </div>

                <h2 className="text-xl font-semibold text-brand-gray-700 mb-4">
                    Orçamentos Cadastrados ({filteredOrcamentos.length})
                </h2>

                {filteredOrcamentos.length === 0 ? (
                    <p className="text-brand-gray-500 text-center py-8">Nenhum orçamento encontrado.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrcamentos.map((orcamento) => (
                            <div key={orcamento.id} className="bg-brand-gray-50 p-4 rounded-lg shadow-sm border border-brand-gray-100 hover:shadow-md transition-all duration-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-brand-gray-800 text-lg">{orcamento.titulo}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(orcamento.status)}`}>
                                        {orcamento.status}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-brand-gray-600 mb-2">
                                    Cliente: {orcamento.cliente?.nome || 'N/A'}
                                </p>
                                
                                <p className="text-sm text-brand-gray-600 mb-2">
                                    Total: R$ {orcamento.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                </p>
                                
                                <p className="text-sm text-brand-gray-600 mb-4">
                                    Criado: {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setOrcamentoToView(orcamento)}
                                        className="flex-1 text-brand-blue hover:text-brand-blue/80 transition-colors text-sm"
                                    >
                                        Ver Detalhes
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(orcamento)}
                                        className="flex-1 text-brand-orange hover:text-brand-orange/80 transition-colors text-sm"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Criação/Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-brand-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-brand-gray-200">
                            <h2 className="text-2xl font-bold text-brand-gray-800">
                                {orcamentoToEdit ? 'Editar Orçamento' : 'Novo Orçamento'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-brand-gray-500 hover:text-brand-gray-700">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Informações Básicas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Cliente *
                                    </label>
                                    <select
                                        value={formState.clienteId}
                                        onChange={(e) => setFormState(prev => ({ ...prev, clienteId: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
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
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.titulo}
                                        onChange={(e) => setFormState(prev => ({ ...prev, titulo: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Validade *
                                    </label>
                                    <input
                                        type="date"
                                        value={formState.validade}
                                        onChange={(e) => setFormState(prev => ({ ...prev, validade: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        BDI (%) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formState.bdi}
                                        onChange={(e) => handleBdiChange(Number(e.target.value))}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    value={formState.descricao}
                                    onChange={(e) => setFormState(prev => ({ ...prev, descricao: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                />
                            </div>

                            {/* Itens do Orçamento */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-brand-gray-800">Itens do Orçamento</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowItemModal(true)}
                                        className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-blue/90 transition-colors flex items-center gap-2"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Adicionar Item
                                    </button>
                                </div>

                                {items.length === 0 ? (
                                    <div className="text-center py-8 bg-brand-gray-50 rounded-lg">
                                        <p className="text-brand-gray-500">Nenhum item adicionado</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="bg-brand-gray-50 p-4 rounded-lg border border-brand-gray-200">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                    <div>
                                                        <p className="font-medium text-brand-gray-800">{item.nome}</p>
                                                        <p className="text-sm text-brand-gray-600">{item.unidadeMedida}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs text-brand-gray-600 mb-1">Quantidade</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantidade}
                                                            onChange={(e) => handleUpdateItemQuantity(index, Number(e.target.value))}
                                                            min="1"
                                                            step="0.01"
                                                            className="w-full px-2 py-1 border border-brand-gray-300 rounded text-sm"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs text-brand-gray-600 mb-1">Valor Unit.</label>
                                                        <p className="text-sm font-medium">
                                                            R$ {item.precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-xs text-brand-gray-600 mb-1">Subtotal</label>
                                                        <p className="text-sm font-bold text-brand-blue">
                                                            R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="bg-brand-blue/10 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold text-brand-gray-800">Total Geral:</span>
                                                <span className="text-xl font-bold text-brand-blue">
                                                    R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                    Observações
                                </label>
                                <textarea
                                    value={formState.observacoes}
                                    onChange={(e) => setFormState(prev => ({ ...prev, observacoes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2 border border-brand-gray-300 rounded-lg text-brand-gray-700 hover:bg-brand-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-brand-blue text-white rounded-lg shadow-md hover:bg-brand-blue/90 transition-colors"
                                >
                                    {orcamentoToEdit ? 'Salvar Alterações' : 'Criar Orçamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Seleção de Itens */}
            {showItemModal && (
                <div className="fixed inset-0 bg-brand-gray-900 bg-opacity-50 flex justify-center items-center z-60 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-brand-gray-200">
                            <h3 className="text-xl font-bold text-brand-gray-800">Selecionar Material</h3>
                            <button onClick={() => setShowItemModal(false)} className="text-brand-gray-500 hover:text-brand-gray-700">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar materiais..."
                                        value={itemSearchTerm}
                                        onChange={(e) => setItemSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-brand-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {filteredMaterials.length === 0 ? (
                                    <p className="text-center py-8 text-brand-gray-500">Nenhum material disponível</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredMaterials.map((material) => (
                                            <div key={material.id} className="bg-brand-gray-50 p-4 rounded-lg border border-brand-gray-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer"
                                                onClick={() => handleAddItem(material)}>
                                                <h4 className="font-semibold text-brand-gray-800">{material.nome}</h4>
                                                <p className="text-sm text-brand-gray-600">SKU: {material.sku}</p>
                                                <p className="text-sm text-brand-gray-600">Unidade: {material.unidadeMedida}</p>
                                                <p className="text-sm text-brand-gray-600">Estoque: {material.estoque}</p>
                                                <p className="text-sm font-bold text-brand-blue">
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

            {/* Modal de Visualização */}
            {orcamentoToView && (
                <div className="fixed inset-0 bg-brand-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-brand-gray-200">
                            <h2 className="text-2xl font-bold text-brand-gray-800">Detalhes do Orçamento</h2>
                            <button onClick={() => setOrcamentoToView(null)} className="text-brand-gray-500 hover:text-brand-gray-700">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-brand-gray-800">Cliente</h3>
                                    <p className="text-brand-gray-600">{orcamentoToView.cliente?.nome || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-brand-gray-800">Status</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(orcamentoToView.status)}`}>
                                        {orcamentoToView.status}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-brand-gray-800">Total</h3>
                                    <p className="text-brand-gray-600">R$ {orcamentoToView.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-brand-gray-800">Validade</h3>
                                    <p className="text-brand-gray-600">{new Date(orcamentoToView.validade).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            {orcamentoToView.descricao && (
                                <div>
                                    <h3 className="font-semibold text-brand-gray-800">Descrição</h3>
                                    <p className="text-brand-gray-600">{orcamentoToView.descricao}</p>
                                </div>
                            )}

                            {orcamentoToView.items && orcamentoToView.items.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-brand-gray-800 mb-3">Itens</h3>
                                    <div className="space-y-2">
                                        {orcamentoToView.items.map((item, index) => (
                                            <div key={index} className="bg-brand-gray-50 p-3 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{item.nome}</p>
                                                        <p className="text-sm text-brand-gray-600">
                                                            {item.quantidade} {item.unidadeMedida} × R$ {item.precoUnit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-brand-blue">
                                                        R$ {item.subtotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {orcamentoToView.observacoes && (
                                <div>
                                    <h3 className="font-semibold text-brand-gray-800">Observações</h3>
                                    <p className="text-brand-gray-600">{orcamentoToView.observacoes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orcamentos;