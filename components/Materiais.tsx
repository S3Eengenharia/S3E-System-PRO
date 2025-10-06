import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type MaterialItem, MaterialCategory, type Supplier } from '../types';
import { materialsData as initialMaterialsData, suppliersData } from '../data/mockData';
import { CurrencyDollarIcon } from '../constants';

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
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);
const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 16.811V8.689A2.25 2.25 0 015.25 6.5h13.5A2.25 2.25 0 0121 8.689v8.122zM12 15.75V9" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 17H6V6h10v4l4 4H13z" /></svg>;

const getCategoryClass = (category: MaterialCategory) => {
    switch (category) {
        case MaterialCategory.MaterialEletrico: return 'bg-green-100 text-green-800';
        case MaterialCategory.Insumo: return 'bg-blue-100 text-blue-800';
        case MaterialCategory.Ferramenta: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface MateriaisProps {
    toggleSidebar: () => void;
}

type MaterialFormState = Omit<MaterialItem, 'id' | 'stock' | 'price' | 'minStock'> & {
    stock: string;
    price: string;
    minStock: string;
}

const ITEMS_PER_PAGE = 8;

const Materiais: React.FC<MateriaisProps> = ({ toggleSidebar }) => {
    const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterialsData);
    const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MaterialItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<MaterialItem | null>(null);
    const [itemToView, setItemToView] = useState<MaterialItem | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Form state
    const [formState, setFormState] = useState<MaterialFormState>({
        name: '', sku: '', type: '', category: MaterialCategory.MaterialEletrico, description: '',
        stock: '0', minStock: '5', unitOfMeasure: 'un', location: '', imageUrl: undefined, supplierId: '', supplierName: '', price: ''
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, searchTerm]);

    const filteredMaterials = useMemo(() => {
        return materials
            .filter(item => categoryFilter === 'Todos' || item.category === categoryFilter)
            .filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [materials, categoryFilter, searchTerm]);

    const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);

    const paginatedMaterials = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredMaterials.slice(startIndex, endIndex);
    }, [filteredMaterials, currentPage]);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const resetForm = () => {
        setFormState({
            name: '', sku: '', type: '', category: MaterialCategory.MaterialEletrico, description: '',
            stock: '0', minStock: '5', unitOfMeasure: 'un', location: '', imageUrl: undefined, supplierId: '', supplierName: '', price: ''
        });
    };

    const handleOpenModal = (item: MaterialItem | null = null) => {
        if (item) {
            setItemToEdit(item);
            setFormState({
                ...item,
                stock: String(item.stock),
                price: item.price ? String(item.price) : '',
                minStock: String(item.minStock),
            });
        } else {
            setItemToEdit(null);
            resetForm();
        }
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
        resetForm();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
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

        const supplier = suppliersData.find(s => s.id === formState.supplierId);
        const { price, stock, minStock, ...restOfForm } = formState;

        const dataToSave = { 
            ...restOfForm,
            stock: stockValue,
            minStock: minStockValue,
            price: priceValue,
            supplierName: supplier ? supplier.name : undefined 
        };

        if (itemToEdit) {
            const updatedItem: MaterialItem = { ...itemToEdit, ...dataToSave };
            setMaterials(prev => prev.map(item => item.id === itemToEdit.id ? updatedItem : item));
        } else {
            const newItem: MaterialItem = {
                id: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
                ...dataToSave
            };
            setMaterials(prev => [newItem, ...prev]);
        }
        handleCloseModal();
    };
    
    const handleOpenDeleteModal = (item: MaterialItem) => { setItemToDelete(item); setOpenDropdownId(null); };
    const handleCloseDeleteModal = () => setItemToDelete(null);
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setMaterials(prev => prev.filter(item => item.id !== itemToDelete.id));
            handleCloseDeleteModal();
        }
    };

    const handleOpenViewModal = (item: MaterialItem) => { setItemToView(item); setOpenDropdownId(null); };
    const handleCloseViewModal = () => setItemToView(null);

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Materiais</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de insumos, ferramentas e produtos</p>
                    </div>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Novo Material
                </button>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-gray-600">Categoria:</span>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value as MaterialCategory | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todas</option>
                            {Object.values(MaterialCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedMaterials.map((item) => {
                        const investedValue = (item.price || 0) * item.stock;
                        return (
                            <div key={item.id} className="bg-white rounded-lg border border-brand-gray-200 shadow-sm flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                                <div className="relative">
                                    <img className="h-32 w-full object-cover" src={item.imageUrl || 'https://picsum.photos/seed/placeholder/400'} alt={item.name} />
                                    <div className="absolute top-2 right-2">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryClass(item.category)} bg-opacity-80 backdrop-blur-sm`}>{item.category}</span>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-brand-gray-800 leading-tight flex-1 pr-2">{item.name}</h3>
                                        <div className="relative">
                                            <button onClick={() => setOpenDropdownId(item.id === openDropdownId ? null : item.id)} className="p-1 -mr-1 -mt-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                                <EllipsisVerticalIcon className="w-5 h-5" />
                                            </button>
                                            {openDropdownId === item.id && (
                                                <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenViewModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">
                                                        <EyeIcon className="w-4 h-4" /> Visualizar
                                                    </a>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">
                                                        <PencilIcon className="w-4 h-4" /> Editar
                                                    </a>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                        <TrashIcon className="w-4 h-4" /> Excluir
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-gray-500 mb-3">SKU: {item.sku}</p>
                                    
                                    <div className="space-y-2 text-sm text-brand-gray-700 mt-auto pt-3 border-t border-brand-gray-100">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5 text-green-700">
                                                <CurrencyDollarIcon className="w-4 h-4" />
                                                <span className="font-semibold">Valor Investido:</span>
                                            </div>
                                            <span className="font-bold text-green-700">R$ {investedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5">
                                                <CubeIcon className="w-4 h-4 text-brand-gray-400" />
                                                <span className="font-semibold">Em Estoque:</span>
                                            </div>
                                            <span className="font-medium">{item.stock} {item.unitOfMeasure}.</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5">
                                                <MapPinIcon className="w-4 h-4 text-brand-gray-400" />
                                                <span className="font-semibold">Localização:</span>
                                            </div>
                                            <span className="font-medium">{item.location || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5">
                                                <TruckIcon className="w-4 h-4 text-brand-gray-400" />
                                                <span className="font-semibold">Fornecedor:</span>
                                            </div>
                                            <span className="font-medium truncate" title={item.supplierName || 'N/A'}>{item.supplierName || 'N/A'}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-brand-gray-300 text-sm font-medium text-brand-gray-700 rounded-lg hover:bg-brand-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-brand-gray-600">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border border-brand-gray-300 text-sm font-medium text-brand-gray-700 rounded-lg hover:bg-brand-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próxima
                        </button>
                    </div>
                )}

            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-gray-800">{itemToEdit ? 'Editar Material' : 'Adicionar Novo Material'}</h2>
                            <button type="button" onClick={handleCloseModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="p-6 space-y-4 overflow-y-auto">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Código *</label>
                                    <input type="text" name="sku" value={formState.sku} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Categoria *</label>
                                    <input type="text" name="type" placeholder="Ex: Cabos, Disjuntores" value={formState.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Classificação *</label>
                                <select name="category" value={formState.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white" required>
                                    {Object.values(MaterialCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Descrição Técnica *</label>
                                <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Unidade de Medida *</label>
                                     <select name="unitOfMeasure" value={formState.unitOfMeasure} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white" required>
                                        <option>un</option>
                                        <option>m</option>
                                        <option>rolo</option>
                                        <option>caixa</option>
                                        <option>pct</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Estoque Atual</label>
                                    <input type="number" name="stock" value={formState.stock} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-brand-gray-50 read-only:cursor-not-allowed" required min="0" readOnly={!!itemToEdit} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Estoque Mínimo</label>
                                    <input type="number" name="minStock" value={formState.minStock} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required min="0" />
                                </div>
                            </div>
                           
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Valor Unitário (R$)</label>
                                    <input type="number" name="price" value={formState.price} onChange={handleInputChange} placeholder="25,50" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" min="0" step="0.01" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Localização</label>
                                    <input type="text" name="location" value={formState.location} onChange={handleInputChange} placeholder="Prateleira A-3" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Fornecedor Principal</label>
                                <select name="supplierId" value={formState.supplierId || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white">
                                    <option value="">Selecione um fornecedor</option>
                                    {suppliersData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Especificações Técnicas</label>
                                <textarea name="description" value={formState.description} onChange={handleInputChange} rows={3} placeholder="Detalhes técnicos do material..." className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">{itemToEdit ? 'Atualizar Material' : 'Salvar Material'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            {itemToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-brand-gray-800">Confirmar Exclusão</h2>
                            <p className="text-sm text-brand-gray-600 mt-2">
                                Você tem certeza que deseja excluir o item <strong className="text-brand-gray-800">{itemToDelete.name}</strong>?
                            </p>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                            <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg shadow-sm hover:bg-brand-red/90">Confirmar Exclusão</button>
                        </div>
                    </div>
                </div>
            )}
            
            {itemToView && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-gray-800">Detalhes do Material</h2>
                            <button onClick={handleCloseViewModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            {itemToView.imageUrl && <img src={itemToView.imageUrl} alt={itemToView.name} className="w-full h-48 object-cover rounded-lg mb-4" />}
                            <h3 className="text-2xl font-bold text-brand-gray-900">{itemToView.name}</h3>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-gray-200 text-sm">
                                <div><strong className="block text-brand-gray-500">Código (SKU)</strong>{itemToView.sku}</div>
                                <div><strong className="block text-brand-gray-500">Categoria</strong>{itemToView.type}</div>
                                <div><strong className="block text-brand-gray-500">Classificação</strong><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryClass(itemToView.category)}`}>{itemToView.category}</span></div>
                                <div><strong className="block text-brand-gray-500">Preço</strong>{itemToView.price ? `R$ ${itemToView.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não definido'}</div>
                                <div><strong className="block text-brand-gray-500">Estoque Atual</strong>{itemToView.stock} {itemToView.unitOfMeasure}</div>
                                <div><strong className="block text-brand-gray-500">Estoque Mínimo</strong>{itemToView.minStock} {itemToView.unitOfMeasure}</div>
                                <div><strong className="block text-brand-gray-500">Localização</strong>{itemToView.location}</div>
                                <div><strong className="block text-brand-gray-500">Fornecedor</strong>{itemToView.supplierName || 'Não especificado'}</div>
                            </div>
                             <div className="pt-4 border-t border-brand-gray-200 text-sm">
                                <strong className="block text-brand-gray-500 mb-1">Especificações Técnicas</strong>
                                <p className="whitespace-pre-wrap text-brand-gray-800">{itemToView.description || 'Nenhuma especificação fornecida.'}</p>
                            </div>
                        </div>
                         <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end">
                            <button onClick={handleCloseViewModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materiais;