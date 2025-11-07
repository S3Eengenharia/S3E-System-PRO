import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { type MaterialItem, MaterialCategory } from '../types';
import { materiaisService, Material } from '../services/materiaisService';

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
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);
const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

interface MateriaisProps {
    toggleSidebar: () => void;
}

interface MaterialFormState {
    name: string;
    sku: string;
    type: string;
    category: MaterialCategory;
    description: string;
    stock: string;
    minStock: string;
    unitOfMeasure: string;
    location: string;
    imageUrl?: string;
    supplierId: string;
    supplierName: string;
    price: string;
}

const Materiais: React.FC<MateriaisProps> = ({ toggleSidebar }) => {
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados de busca e filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | 'Todos'>('Todos');
    const [stockFilter, setStockFilter] = useState<'Todos' | 'Baixo' | 'Zerado'>('Todos');
    
    // Estados do modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MaterialItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<MaterialItem | null>(null);
    const [formState, setFormState] = useState<MaterialFormState>({
        name: '',
        sku: '',
        type: '',
        category: MaterialCategory.MaterialEletrico,
        description: '',
        stock: '0',
        minStock: '5',
        unitOfMeasure: 'un',
        location: '',
        imageUrl: undefined,
        supplierId: '',
        supplierName: '',
        price: ''
    });


    const loadMaterials = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📦 Carregando materiais...');
            const response = await materiaisService.getMateriais();
            
            if (response.success && response.data) {
                // Converter dados da API para o formato do componente
                const materialsData = response.data.map((material: Material) => ({
                    id: material.id,
                    name: material.descricao,
                    sku: material.codigo,
                    type: material.categoria || 'Material',
                    category: MaterialCategory.MaterialEletrico, // Mapear conforme necessário
                    description: material.descricao,
                    stock: material.estoque,
                    minStock: material.estoqueMinimo,
                    unitOfMeasure: material.unidade,
                    location: 'Estoque', // Campo não disponível na API
                    price: material.preco,
                    supplier: { id: material.fornecedorId || '', name: 'Fornecedor' } // Mapear conforme necessário
                }));
                
                setMaterials(materialsData);
                console.log(`✅ ${materialsData.length} materiais carregados`);
            } else {
                console.warn('⚠️ Nenhum material encontrado');
                setMaterials([]);
            }
        } catch (err) {
            setError('Erro ao carregar materiais');
            console.error('❌ Erro ao carregar materiais:', err);
            setMaterials([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadMaterials();
    }, []);

    // Filtros
    const filteredMaterials = useMemo(() => {
        let filtered = materials;

        // Filtro por categoria
        if (categoryFilter !== 'Todos') {
            filtered = filtered.filter(material => material.category === categoryFilter);
        }

        // Filtro por estoque
        if (stockFilter === 'Baixo') {
            filtered = filtered.filter(material => material.stock > 0 && material.stock <= material.minStock);
        } else if (stockFilter === 'Zerado') {
            filtered = filtered.filter(material => material.stock === 0);
        }

        // Filtro por busca
        if (searchTerm) {
            filtered = filtered.filter(material =>
                material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [materials, categoryFilter, stockFilter, searchTerm]);

    // Estatísticas
    const stats = useMemo(() => {
        const totalItems = materials.length;
        const lowStock = materials.filter(m => m.stock > 0 && m.stock <= m.minStock).length;
        const outOfStock = materials.filter(m => m.stock === 0).length;
        const totalValue = materials.reduce((acc, m) => acc + (m.stock * m.price), 0);

        return { totalItems, lowStock, outOfStock, totalValue };
    }, [materials]);

    // Handlers
    const handleOpenModal = (item: MaterialItem | null = null) => {
        if (item) {
            setItemToEdit(item);
            setFormState({
                name: item.name,
                sku: item.sku,
                type: item.type,
                category: item.category,
                description: item.description,
                stock: item.stock.toString(),
                minStock: item.minStock.toString(),
                unitOfMeasure: item.unitOfMeasure,
                location: item.location || '',
                imageUrl: item.imageUrl,
                supplierId: item.supplier?.id || '',
                supplierName: item.supplier?.name || '',
                price: item.price.toString()
            });
        } else {
            setItemToEdit(null);
            setFormState({
                name: '',
                sku: '',
                type: '',
                category: MaterialCategory.MaterialEletrico,
                description: '',
                stock: '0',
                minStock: '5',
                unitOfMeasure: 'un',
                location: '',
                imageUrl: undefined,
                supplierId: '',
                supplierName: '',
                price: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const materialData = {
                codigo: formState.sku,
                descricao: formState.name,
                unidade: formState.unitOfMeasure,
                preco: parseFloat(formState.price),
                estoque: parseFloat(formState.stock),
                estoqueMinimo: parseFloat(formState.minStock),
                categoria: formState.type,
                fornecedorId: formState.supplierId
            };

            if (itemToEdit) {
                // Atualizar material existente
                const response = await materiaisService.updateMaterial(itemToEdit.id, materialData);
                if (response.success) {
                    toast.error('✅ Material atualizado com sucesso!');
                } else {
                    toast.error('❌ Erro ao atualizar material');
                }
            } else {
                // Criar novo material
                const response = await materiaisService.createMaterial(materialData);
                if (response.success) {
                    toast.error('✅ Material criado com sucesso!');
                } else {
                    toast.error('❌ Erro ao criar material');
                }
            }
            
            handleCloseModal();
            await loadMaterials();
        } catch (error) {
            console.error('❌ Erro ao salvar material:', error);
            toast.error('❌ Erro ao salvar material');
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            const response = await materiaisService.deleteMaterial(itemToDelete.id);
            if (response.success) {
                toast.error('✅ Material removido com sucesso!');
            } else {
                toast.error('❌ Erro ao remover material');
            }
            
            setItemToDelete(null);
            await loadMaterials();
        } catch (error) {
            console.error('❌ Erro ao remover material:', error);
            toast.error('❌ Erro ao remover material');
        }
    };

    const getStockStatusClass = (material: MaterialItem) => {
        if (material.stock === 0) {
            return 'bg-red-100 text-red-800 ring-1 ring-red-200';
        } else if (material.stock <= material.minStock) {
            return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
        }
        return 'bg-green-100 text-green-800 ring-1 ring-green-200';
    };

    const getStockStatusText = (material: MaterialItem) => {
        if (material.stock === 0) {
            return '❌ Esgotado';
        } else if (material.stock <= material.minStock) {
            return '⚠️ Baixo';
        }
        return '✅ Normal';
    };

    const getCategoryIcon = (category: MaterialCategory) => {
        switch (category) {
            case MaterialCategory.MaterialEletrico:
                return '⚡';
            case MaterialCategory.Ferramentas:
                return '🔧';
            case MaterialCategory.EPI:
                return '🦺';
            default:
                return '📦';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando estoque...</p>
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
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Estoque</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerencie materiais e controle de estoque</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-medium font-semibold"
                >
                    <PlusIcon className="w-5 h-5" />
                    Novo Material
                </button>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
                    <p className="text-red-800 font-medium">⚠️ {error}</p>
                </div>
            )}

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <CubeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                            <XMarkIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Esgotados</p>
                            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Valor Total</p>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {stats.totalValue.toLocaleString('pt-BR')}
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
                                placeholder="Buscar por nome, SKU ou tipo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as MaterialCategory | 'Todos')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="Todos">Todas as Categorias</option>
                            <option value={MaterialCategory.MaterialEletrico}>Material Elétrico</option>
                            <option value={MaterialCategory.Ferramentas}>Ferramentas</option>
                            <option value={MaterialCategory.EPI}>EPI</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value as 'Todos' | 'Baixo' | 'Zerado')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="Todos">Todos os Estoques</option>
                            <option value="Baixo">Estoque Baixo</option>
                            <option value="Zerado">Esgotados</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Exibindo <span className="font-bold text-gray-900">{filteredMaterials.length}</span> de <span className="font-bold text-gray-900">{materials.length}</span> materiais
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Normal: {materials.filter(m => m.stock > m.minStock).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Baixo: {stats.lowStock}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Esgotado: {stats.outOfStock}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Materiais */}
            {filteredMaterials.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📦</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum material encontrado</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || categoryFilter !== 'Todos' || stockFilter !== 'Todos'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece adicionando seus primeiros materiais'}
                    </p>
                    {!searchTerm && categoryFilter === 'Todos' && stockFilter === 'Todos' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-medium font-semibold"
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            Adicionar Primeiro Material
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                        <div key={material.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-teal-300 transition-all duration-200">
                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{material.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-teal-100 text-teal-800 ring-1 ring-teal-200">
                                            {getCategoryIcon(material.category)} {material.category}
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getStockStatusClass(material)}`}>
                                    {getStockStatusText(material)}
                                </span>
                            </div>

                            {/* Informações */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{material.sku}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📊</span>
                                    <span className="font-bold">
                                        {material.stock} {material.unitOfMeasure}
                                    </span>
                                    <span className="text-gray-400">
                                        (mín: {material.minStock})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>💰</span>
                                    <span className="font-bold text-blue-700">
                                        R$ {material.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-gray-400">/{material.unitOfMeasure}</span>
                                </div>
                                {material.location && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>📍</span>
                                        <span>{material.location}</span>
                                    </div>
                                )}
                                {material.supplier && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>🏭</span>
                                        <span className="truncate">{material.supplier.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Valor Total em Estoque */}
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Valor em Estoque:</span>
                                    <span className="font-bold text-green-700">
                                        R$ {(material.stock * material.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleOpenModal(material)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm font-semibold"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => setItemToDelete(material)}
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

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        {/* Header */}
                            <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-medium ring-2 ring-teal-100">
                                    {itemToEdit ? <PencilIcon className="w-7 h-7 text-white" /> : <PlusIcon className="w-7 h-7 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {itemToEdit ? 'Editar Material' : 'Novo Material'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {itemToEdit ? 'Atualize as informações do material' : 'Adicione um novo material ao estoque'}
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nome do Material *
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.name}
                                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="Ex: Cabo Flexível 2,5mm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        SKU *
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.sku}
                                        onChange={(e) => setFormState({...formState, sku: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="Ex: CAB-2.5-FLEX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tipo
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.type}
                                        onChange={(e) => setFormState({...formState, type: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="Ex: Cabo, Disjuntor, Tomada"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Categoria *
                                    </label>
                                    <select
                                        value={formState.category}
                                        onChange={(e) => setFormState({...formState, category: e.target.value as MaterialCategory})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value={MaterialCategory.MaterialEletrico}>Material Elétrico</option>
                                        <option value={MaterialCategory.Ferramentas}>Ferramentas</option>
                                        <option value={MaterialCategory.EPI}>EPI</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Unidade de Medida *
                                    </label>
                                    <select
                                        value={formState.unitOfMeasure}
                                        onChange={(e) => setFormState({...formState, unitOfMeasure: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="un">Unidade</option>
                                        <option value="m">Metro</option>
                                        <option value="kg">Quilograma</option>
                                        <option value="l">Litro</option>
                                        <option value="cx">Caixa</option>
                                        <option value="pç">Peça</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formState.description}
                                        onChange={(e) => setFormState({...formState, description: e.target.value})}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="Descrição detalhada do material..."
                                    />
                                </div>
                            </div>

                            {/* Estoque e Preço */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Estoque Atual *
                                    </label>
                                    <input
                                        type="number"
                                        value={formState.stock}
                                        onChange={(e) => setFormState({...formState, stock: e.target.value})}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Estoque Mínimo *
                                    </label>
                                    <input
                                        type="number"
                                        value={formState.minStock}
                                        onChange={(e) => setFormState({...formState, minStock: e.target.value})}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Preço Unitário (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formState.price}
                                        onChange={(e) => setFormState({...formState, price: e.target.value})}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="0,00"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <div className="w-full bg-teal-50 border border-teal-200 p-3 rounded-xl">
                                        <p className="text-sm font-medium text-teal-800">Valor Total:</p>
                                        <p className="text-lg font-bold text-teal-900">
                                            R$ {((parseFloat(formState.stock) || 0) * (parseFloat(formState.price) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Localização e Fornecedor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Localização no Estoque
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.location}
                                        onChange={(e) => setFormState({...formState, location: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="Ex: Estoque A1, Prateleira 3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fornecedor
                                    </label>
                                    <input
                                        type="text"
                                        value={formState.supplierName}
                                        onChange={(e) => setFormState({...formState, supplierName: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                                        placeholder="Nome do fornecedor"
                                    />
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
                                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-medium font-semibold"
                                >
                                    {itemToEdit ? 'Atualizar' : 'Adicionar'} Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Remover Material</h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja remover o material <strong>"{itemToDelete.name}"</strong>? 
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
        </div>
    );
};

export default Materiais;