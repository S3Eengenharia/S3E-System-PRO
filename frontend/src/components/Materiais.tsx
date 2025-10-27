import React, { useState, useEffect, useMemo } from 'react';
import { type MaterialItem, MaterialCategory } from '../types';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';

// Icons
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
    
    // Estados do modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MaterialItem | null>(null);
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
            
            const response = await axiosApiService.get<MaterialItem[]>(ENDPOINTS.MATERIAIS);
            
            if (response.success && response.data) {
                setMaterials(response.data);
            } else {
                setError('Erro ao carregar materiais');
            }
        } catch (err) {
            setError('Erro ao carregar materiais');
            console.error('Erro ao carregar materiais:', err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadMaterials();
    }, []);

    // Funções do modal
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
                location: item.location,
                imageUrl: item.imageUrl,
                supplierId: item.supplierId || '',
                supplierName: item.supplierName || '',
                price: item.price?.toString() || ''
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const stockValue = parseInt(formState.stock, 10);
        const minStockValue = parseInt(formState.minStock, 10);
        const priceValue = formState.price ? parseFloat(formState.price) : undefined;

        if (isNaN(stockValue) || stockValue < 0) {
            alert('A quantidade em estoque deve ser um número não-negativo.');
            return;
        }

        if (isNaN(minStockValue) || minStockValue < 0) {
            alert('O estoque mínimo deve ser um número não-negativo.');
            return;
        }
        
        if (priceValue !== undefined && (isNaN(priceValue) || priceValue < 0)) {
            alert('O preço, se informado, deve ser um número não-negativo.');
            return;
        }

        try {
            const materialData = {
                name: formState.name,
                sku: formState.sku,
                type: formState.type,
                category: formState.category,
                description: formState.description,
            stock: stockValue,
            minStock: minStockValue,
                unitOfMeasure: formState.unitOfMeasure,
                location: formState.location,
                imageUrl: formState.imageUrl,
                supplierId: formState.supplierId,
                supplierName: formState.supplierName,
                price: priceValue
        };

        if (itemToEdit) {
                // Atualizar material existente
                const response = await axiosApiService.put(`${ENDPOINTS.MATERIAIS}/${itemToEdit.id}`, materialData);
                if (response.success) {
                    await loadMaterials();
                    handleCloseModal();
        } else {
                    setError('Erro ao atualizar material');
                }
            } else {
                // Criar novo material
                const response = await axiosApiService.post(ENDPOINTS.MATERIAIS, materialData);
                if (response.success) {
                    await loadMaterials();
        handleCloseModal();
                } else {
                    setError('Erro ao criar material');
                }
            }
        } catch (err) {
            setError('Erro ao salvar material');
            console.error('Erro ao salvar material:', err);
        }
    };

    // Lógica de filtros e busca
    const filteredMaterials = useMemo(() => {
        return materials.filter(material => {
            const matchesSearch = searchTerm === '' || 
                material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.type.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = categoryFilter === 'Todos' || material.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
    }, [materials, searchTerm, categoryFilter]);

    if (loading) {
        return (
            <div className="p-4 sm:p-8">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                    <span className="ml-3 text-brand-gray-600">Carregando materiais...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800">Erro ao carregar materiais</h3>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                    <button
                        onClick={loadMaterials}
                        className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button 
                        onClick={toggleSidebar} 
                        className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" 
                        aria-label="Open sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Estoque</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de insumos, ferramentas e produtos</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Novo Material
                </button>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                {/* Controles de Busca e Filtro */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por nome, SKU ou tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-gray-600">Categoria:</span>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value as MaterialCategory | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todas</option>
                            {Object.values(MaterialCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-brand-gray-800 mb-4">
                    Itens em Estoque ({filteredMaterials.length} de {materials.length})
                </h2>
                
                {filteredMaterials.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-brand-gray-500">
                            {materials.length === 0 
                                ? 'Nenhum material cadastrado' 
                                : 'Nenhum material encontrado com os filtros aplicados'
                            }
                                            </p>
                                        </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMaterials.map((material) => (
                            <div key={material.id} className="bg-white border border-brand-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-brand-gray-800">{material.name}</h3>
                                        <button 
                                        onClick={() => handleOpenModal(material)}
                                        className="text-brand-blue hover:text-brand-blue/80 transition-colors"
                                        title="Editar material"
                                        >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                        </button>
                                        </div>
                                <p className="text-sm text-brand-gray-600">SKU: {material.sku}</p>
                                <p className="text-sm text-brand-gray-600">Estoque: {material.stock} {material.unitOfMeasure}</p>
                                <p className="text-sm text-brand-gray-600">Categoria: {material.category}</p>
                                {material.price && (
                                    <p className="text-sm text-brand-gray-600">Preço: R$ {material.price.toFixed(2)}</p>
                                            )}
                                        </div>
                        ))}
                                            </div>
                                        )}
                </div>

            {/* Modal de Formulário */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-brand-gray-200">
                            <h2 className="text-xl font-semibold text-brand-gray-800">
                                {itemToEdit ? 'Editar Material' : 'Novo Material'}
                            </h2>
                        <button
                                onClick={handleCloseModal}
                                className="text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Nome do Material *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formState.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="Ex: Cabo de Cobre 2.5mm"
                                    />
            </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        SKU *
                                    </label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formState.sku}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="Ex: CAB-025-001"
                                    />
                        </div>
                        
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Tipo *
                                    </label>
                                    <input
                                        type="text"
                                        name="type"
                                        value={formState.type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="Ex: Cabo Elétrico"
                                    />
                            </div>

                            <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Categoria *
                                    </label>
                                    <select
                                        name="category"
                                        value={formState.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    >
                                        {Object.values(MaterialCategory).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                </select>
                            </div>

                             <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Estoque Atual *
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formState.stock}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    />
                            </div>

                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Estoque Mínimo *
                                    </label>
                                    <input
                                        type="number"
                                        name="minStock"
                                        value={formState.minStock}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    />
                            </div>

                             <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Unidade de Medida *
                                    </label>
                                    <select
                                        name="unitOfMeasure"
                                        value={formState.unitOfMeasure}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    >
                                        <option value="un">Unidade</option>
                                        <option value="m">Metro</option>
                                        <option value="kg">Quilograma</option>
                                        <option value="m²">Metro Quadrado</option>
                                        <option value="m³">Metro Cúbico</option>
                                        <option value="l">Litro</option>
                                </select>
                            </div>

                            <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Preço (R$)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formState.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="0.00"
                                    />
                        </div>
                        
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Localização
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formState.location}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="Ex: Estante A, Prateleira 3"
                                    />
                                        </div>
                                        
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                        Fornecedor
                                    </label>
                                    <select
                                        name="supplierId"
                                        value={formState.supplierId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    >
                                        <option value="">Selecione um fornecedor</option>
                                        <option value="supplier-1">Fornecedor A</option>
                                        <option value="supplier-2">Fornecedor B</option>
                                        <option value="supplier-3">Fornecedor C</option>
                                    </select>
                                        </div>
                                    </div>

                                                        <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    name="description"
                                    value={formState.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    placeholder="Descrição detalhada do material..."
                                />
                        </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-brand-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-brand-gray-600 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                                >
                                Cancelar
                            </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
                                >
                                    {itemToEdit ? 'Atualizar' : 'Criar'} Material
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materiais;