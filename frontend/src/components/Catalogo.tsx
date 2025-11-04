import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CatalogItem, CatalogItemType, Product, Kit, KitProduct, Service, KitService, ServiceType, KitConfiguration, MaterialItem } from '../types';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';
import CriacaoQuadroModular from './CriacaoQuadroModular';

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
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);
const Squares2x2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const WrenchScrewdriverIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
);

interface CatalogoProps {
    toggleSidebar: () => void;
}

const Catalogo: React.FC<CatalogoProps> = ({ toggleSidebar }) => {
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<CatalogItemType | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
    const [showQuadroModal, setShowQuadroModal] = useState(false);

    const loadCatalogItems = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Carregar materiais
            const materiaisResponse = await axiosApiService.get<MaterialItem[]>(ENDPOINTS.MATERIAIS);
            
            const catalogItems: CatalogItem[] = [];
            
            // Converter materiais em itens do catálogo
            if (materiaisResponse.success && materiaisResponse.data) {
                const materiais = Array.isArray(materiaisResponse.data) ? materiaisResponse.data : [];
                materiais.forEach((material: any) => {
                    catalogItems.push({
                        id: material.id,
                        name: material.nome || material.descricao || 'Material',
                        description: material.descricao || '',
                        type: CatalogItemType.Produto,
                        price: material.preco || material.price || 0,
                        category: material.categoria || material.category || 'Material',
                        imageUrl: undefined,
                        isActive: material.ativo !== false,
                        createdAt: material.createdAt || new Date().toISOString(),
                        updatedAt: material.updatedAt || new Date().toISOString()
                    });
                });
            }
            
            setCatalogItems(catalogItems);
        } catch (err) {
            setError('Erro ao carregar catálogo');
            console.error('Erro ao carregar catálogo:', err);
            setCatalogItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCatalogItems();
    }, []);

    // Filtros
    const filteredItems = useMemo(() => {
        let filtered = catalogItems;

        // Filtro por tipo
        if (filter !== 'Todos') {
            filtered = filtered.filter(item => item.type === filter);
        }

        // Filtro por busca
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [catalogItems, filter, searchTerm]);

    // Estatísticas
    const stats = useMemo(() => {
        const totalItems = catalogItems.length;
        const produtos = catalogItems.filter(item => item.type === CatalogItemType.Produto).length;
        const kits = catalogItems.filter(item => item.type === CatalogItemType.Kit).length;
        const servicos = catalogItems.filter(item => item.type === CatalogItemType.Servico).length;
        const totalValue = catalogItems.reduce((acc, item) => acc + item.price, 0);

        return { totalItems, produtos, kits, servicos, totalValue };
    }, [catalogItems]);

    // Handlers
    const handleOpenModal = (item: CatalogItem | null = null) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Note: Esta funcionalidade requer implementação completa de criação/edição
            // Por enquanto, apenas fecha o modal
            alert('✅ Funcionalidade de criação/edição será implementada em breve!');
            handleCloseModal();
            await loadCatalogItems();
        } catch (error) {
            console.error('Erro ao salvar item:', error);
            alert('❌ Erro ao salvar item. Verifique o console para mais detalhes.');
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            // Verificar o tipo do item e deletar conforme necessário
            if (itemToDelete.type === CatalogItemType.Servico) {
                const response = await servicosService.desativar(itemToDelete.id);
                if (response.success) {
                    alert('✅ Item removido com sucesso!');
                    setItemToDelete(null);
                    await loadCatalogItems();
                } else {
                    alert(`❌ Erro ao remover item: ${response.error || 'Erro desconhecido'}`);
                }
            } else {
                // Para produtos e kits, pode ser necessário implementar endpoint específico
                alert('✅ Funcionalidade de remoção será implementada em breve!');
                setItemToDelete(null);
                await loadCatalogItems();
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
            alert('❌ Erro ao remover item. Verifique o console para mais detalhes.');
        }
    };

    const getTypeIcon = (type: CatalogItemType) => {
        switch (type) {
            case CatalogItemType.Produto:
                return '📦';
            case CatalogItemType.Kit:
                return '🔧';
            case CatalogItemType.Servico:
                return '⚙️';
            default:
                return '📋';
        }
    };

    const getTypeColor = (type: CatalogItemType) => {
        switch (type) {
            case CatalogItemType.Produto:
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
            case CatalogItemType.Kit:
                return 'bg-green-100 text-green-800 ring-1 ring-green-200';
            case CatalogItemType.Servico:
                return 'bg-purple-100 text-purple-800 ring-1 ring-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
        }
    };

    const getTypeName = (type: CatalogItemType) => {
        switch (type) {
            case CatalogItemType.Produto:
                return 'Produto';
            case CatalogItemType.Kit:
                return 'Kit';
            case CatalogItemType.Servico:
                return 'Serviço';
            default:
                return 'Item';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando catálogo...</p>
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
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Catálogo</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerencie produtos, kits e serviços</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowQuadroModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-medium font-semibold"
                    >
                        <Squares2x2Icon className="w-5 h-5" />
                        Criar Quadro Elétrico
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-medium font-semibold"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Novo Item
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
                    <p className="text-red-800 font-medium">⚠️ {error}</p>
                </div>
            )}

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                            <CubeIcon className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                            <p className="text-2xl font-bold text-teal-600">{stats.totalItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Produtos</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.produtos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <WrenchScrewdriverIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Kits</p>
                            <p className="text-2xl font-bold text-green-600">{stats.kits}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <span className="text-2xl">⚙️</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Serviços</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.servicos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Valor Médio</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                R$ {stats.totalItems > 0 ? (stats.totalValue / stats.totalItems).toFixed(0) : '0'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, descrição ou categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as CatalogItemType | 'Todos')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="Todos">Todos os Tipos</option>
                            <option value={CatalogItemType.Produto}>Produtos</option>
                            <option value={CatalogItemType.Kit}>Kits</option>
                            <option value={CatalogItemType.Servico}>Serviços</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end">
                        <p className="text-sm text-gray-600">
                            <span className="font-bold text-gray-900">{filteredItems.length}</span> itens encontrados
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid de Itens do Catálogo */}
            {filteredItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📋</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum item encontrado</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || filter !== 'Todos'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece adicionando seus primeiros itens ao catálogo'}
                    </p>
                    {!searchTerm && filter === 'Todos' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-medium font-semibold"
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            Adicionar Primeiro Item
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-teal-300 transition-all duration-200">
                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${getTypeColor(item.type)}`}>
                                            {getTypeIcon(item.type)} {getTypeName(item.type)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-teal-700">
                                        R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📂</span>
                                    <span className="truncate">{item.category}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p className="line-clamp-2">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📅</span>
                                    <span>Criado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                                    item.isActive 
                                        ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                                        : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                                }`}>
                                    {item.isActive ? '✅ Ativo' : '❌ Inativo'}
                                </span>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    Ver
                                </button>
                                <button
                                    onClick={() => handleOpenModal(item)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm font-semibold"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => setItemToDelete(item)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Remover
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
                        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-medium ring-2 ring-teal-100">
                                    {itemToEdit ? <PencilIcon className="w-7 h-7 text-white" /> : <PlusIcon className="w-7 h-7 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {itemToEdit ? 'Editar Item' : 'Novo Item'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {itemToEdit ? 'Atualize as informações do item' : 'Adicione um novo item ao catálogo'}
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
                                    A implementação completa incluirá formulários específicos para cada tipo de item.
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
                                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-medium font-semibold"
                                >
                                    {itemToEdit ? 'Atualizar' : 'Adicionar'} Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE VISUALIZAÇÃO */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-teal-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Item</h2>
                                <p className="text-sm text-gray-600 mt-1">Informações completas do item</p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Nome</h3>
                                    <p className="text-gray-900 font-medium">{selectedItem.name}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Tipo</h3>
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getTypeColor(selectedItem.type)}`}>
                                        {getTypeIcon(selectedItem.type)} {getTypeName(selectedItem.type)}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Preço</h3>
                                    <p className="text-2xl font-bold text-teal-700">
                                        R$ {selectedItem.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Categoria</h3>
                                    <p className="text-gray-900 font-medium">{selectedItem.category}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                                <p className="text-gray-700">{selectedItem.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Criado em</h3>
                                    <p className="text-gray-900">{new Date(selectedItem.createdAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                                        selectedItem.isActive 
                                            ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                                            : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                                    }`}>
                                        {selectedItem.isActive ? '✅ Ativo' : '❌ Inativo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Remover Item</h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja remover o item <strong>"{itemToDelete.name}"</strong> do catálogo? 
                            Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de Criação de Quadro Elétrico */}
            <CriacaoQuadroModular
                isOpen={showQuadroModal}
                onClose={() => setShowQuadroModal(false)}
                onSave={() => {
                    setShowQuadroModal(false);
                    loadCatalogItems();
                }}
            />
        </div>
    );
};

export default Catalogo;