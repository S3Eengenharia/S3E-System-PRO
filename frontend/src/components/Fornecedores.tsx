import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type Supplier, SupplierCategory } from '../types';
import { SupplierIcon } from '../constants';
import { apiService } from '../services/api';

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
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>;
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);
const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.425v-2.927M21 12a5.973 5.973 0 00-4.138-5.625c.228-.059.458-.11.696-.162a5.96 5.96 0 00-7.08-4.25c-.88.225-1.7.54-2.438.932V3.75A2.25 2.25 0 015.25 1.5h13.5A2.25 2.25 0 0121 3.75v8.25z" /></svg>;

const getCategoryClass = (category: SupplierCategory) => {
    switch (category) {
        case SupplierCategory.MaterialEletrico: return 'bg-green-100 text-green-800';
        case SupplierCategory.Insumo: return 'bg-blue-100 text-blue-800';
        case SupplierCategory.Ferramenta: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface FornecedoresProps {
    toggleSidebar: () => void;
}

type SupplierFormState = Omit<Supplier, 'id'>;

const Fornecedores: React.FC<FornecedoresProps> = ({ toggleSidebar }) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<SupplierCategory | 'Todos'>('Todos');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
    const [supplierToView, setSupplierToView] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formState, setFormState] = useState<SupplierFormState>({
        name: '', cnpj: '', contactPerson: '', phone: '', email: '', address: '', categories: [],
        stateRegistration: '', website: '', bankDetails: '', notes: ''
    });

    // Carregar fornecedores da API
    const loadSuppliers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.get<Supplier[]>('/api/fornecedores');
            if (response.success && response.data) {
                setSuppliers(response.data);
            } else {
                setError('Erro ao carregar fornecedores');
            }
        } catch (err) {
            setError('Erro ao carregar fornecedores');
            console.error('Erro ao carregar fornecedores:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const filteredSuppliers = useMemo(() => {
        return suppliers
            .filter(s => categoryFilter === 'Todos' || s.categories?.includes(categoryFilter))
            .filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.cnpj?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm, categoryFilter]);

    const resetForm = () => {
        setFormState({ 
            name: '', cnpj: '', stateRegistration: '', website: '',
            contactPerson: '', phone: '', email: '', address: '', categories: [],
            bankDetails: '', notes: ''
        });
    };

    const handleOpenModal = (supplier: Supplier | null = null) => {
        if (supplier) {
            setSupplierToEdit(supplier);
            setFormState({
                name: supplier.name,
                cnpj: supplier.cnpj || '',
                stateRegistration: supplier.stateRegistration || '',
                website: supplier.website || '',
                contactPerson: supplier.contactPerson || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                categories: supplier.categories || [],
                bankDetails: supplier.bankDetails || '',
                notes: supplier.notes || '',
            });
        } else {
            setSupplierToEdit(null);
            resetForm();
        }
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSupplierToEdit(null);
        resetForm();
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (category: SupplierCategory) => {
        setFormState(prev => {
            const currentCategories = prev.categories || [];
            const newCategories = currentCategories.includes(category)
                ? currentCategories.filter(c => c !== category)
                : [...currentCategories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (supplierToEdit) {
            const updatedSupplier: Supplier = { ...supplierToEdit, ...formState };
            setSuppliers(prev => prev.map(s => s.id === supplierToEdit.id ? updatedSupplier : s));
        } else {
            const newSupplier: Supplier = {
                id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
                ...formState
            };
            setSuppliers(prev => [newSupplier, ...prev]);
        }
        handleCloseModal();
    };
    
    const handleOpenDeleteModal = (supplier: Supplier) => { setSupplierToDelete(supplier); setOpenDropdownId(null); };
    const handleCloseDeleteModal = () => setSupplierToDelete(null);
    const handleConfirmDelete = () => {
        if (supplierToDelete) {
            setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
            handleCloseDeleteModal();
        }
    };

    const handleOpenViewModal = (supplier: Supplier) => { setSupplierToView(supplier); setOpenDropdownId(null); };
    const handleCloseViewModal = () => setSupplierToView(null);

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Fornecedores</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de parceiros e fornecedores</p>
                    </div>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Fornecedor
                </button>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou CNPJ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-gray-600">Filtrar por tipo:</span>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value as SupplierCategory | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todos</option>
                            {Object.values(SupplierCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-white rounded-xl border border-brand-gray-200 shadow-sm flex flex-col transition-shadow hover:shadow-lg">
                            <div className="p-4 flex-grow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-blue-light flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl font-bold text-brand-blue">{supplier.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-brand-gray-800 leading-tight">{supplier.name}</h3>
                                            <p className="text-sm text-brand-gray-500 flex items-center gap-1.5">
                                                <UserCircleIcon className="w-4 h-4" />
                                                {supplier.contactPerson || 'Contato principal'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button onClick={() => setOpenDropdownId(supplier.id === openDropdownId ? null : supplier.id)} className="p-1 -ml-1 -mt-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                            <EllipsisVerticalIcon className="w-5 h-5" />
                                        </button>
                                        {openDropdownId === supplier.id && (
                                            <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 transition ease-out duration-100 transform opacity-100 scale-100">
                                                <div className="p-1" role="menu" aria-orientation="vertical">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenViewModal(supplier); }} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100 hover:text-brand-blue-600 rounded-md transition-colors" role="menuitem">
                                                        <EyeIcon className="w-5 h-5 text-brand-gray-400" /> <span className="font-medium">Visualizar</span>
                                                    </a>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(supplier); }} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100 hover:text-brand-blue-600 rounded-md transition-colors" role="menuitem">
                                                        <PencilIcon className="w-5 h-5 text-brand-gray-400" /> <span className="font-medium">Editar</span>
                                                    </a>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(supplier); }} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors" role="menuitem">
                                                        <TrashIcon className="w-5 h-5" /> <span className="font-medium">Excluir</span>
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-brand-gray-100 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-brand-gray-600">
                                        <PhoneIcon className="w-4 h-4 text-brand-gray-400" />
                                        <span>{supplier.phone || 'Não informado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-brand-gray-600">
                                        <EnvelopeIcon className="w-4 h-4 text-brand-gray-400" />
                                        <span className="truncate">{supplier.email || 'Não informado'}</span>
                                    </div>
                                </div>
                            </div>
                            {(supplier.categories && supplier.categories.length > 0) && (
                                <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                        {supplier.categories.map(category => (
                                            <span key={category} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryClass(category)}`}>
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-gray-800">{supplierToEdit ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</h2>
                            <button type="button" onClick={handleCloseModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto">
                           <fieldset className="space-y-4 border border-brand-gray-200 p-4 rounded-lg">
                               <legend className="px-2 font-semibold text-brand-gray-700">Informações da Empresa</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nome / Razão Social</label>
                                        <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">CNPJ</label>
                                        <input type="text" name="cnpj" value={formState.cnpj} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Inscrição Estadual</label>
                                        <input type="text" name="stateRegistration" value={formState.stateRegistration} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Website</label>
                                        <input type="url" name="website" value={formState.website} onChange={handleInputChange} placeholder="https://exemplo.com" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-2">Tipos de Material Fornecido</label>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {Object.values(SupplierCategory).map(category => (
                                            <div key={category} className="flex items-center">
                                                <input
                                                    id={`category-${category}`}
                                                    type="checkbox"
                                                    checked={formState.categories?.includes(category)}
                                                    onChange={() => handleCategoryChange(category)}
                                                    className="h-4 w-4 rounded border-brand-gray-300 text-brand-blue focus:ring-brand-blue"
                                                />
                                                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-brand-gray-700">{category}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                           </fieldset>
                           <fieldset className="space-y-4 border border-brand-gray-200 p-4 rounded-lg">
                                <legend className="px-2 font-semibold text-brand-gray-700">Informações de Contato</legend>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Pessoa de Contato</label>
                                    <input type="text" name="contactPerson" value={formState.contactPerson} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Telefone</label>
                                        <input type="tel" name="phone" value={formState.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Email</label>
                                        <input type="email" name="email" value={formState.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Endereço</label>
                                    <textarea name="address" value={formState.address} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                </div>
                           </fieldset>
                           <fieldset className="space-y-4 border border-brand-gray-200 p-4 rounded-lg">
                                <legend className="px-2 font-semibold text-brand-gray-700">Informações Adicionais</legend>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Dados Bancários</label>
                                    <textarea name="bankDetails" value={formState.bankDetails} onChange={handleInputChange} rows={2} placeholder="Ex: Banco do Brasil, Ag: 1234-5, C/C: 67890-1" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Observações</label>
                                    <textarea name="notes" value={formState.notes} onChange={handleInputChange} rows={3} placeholder="Informações relevantes sobre o fornecedor..." className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                </div>
                           </fieldset>
                        </div>
                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">{supplierToEdit ? 'Salvar Alterações' : 'Salvar Fornecedor'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            {supplierToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-brand-gray-800">Confirmar Exclusão</h2>
                            <p className="text-sm text-brand-gray-600 mt-2">
                                Você tem certeza que deseja excluir o fornecedor <strong className="text-brand-gray-800">{supplierToDelete.name}</strong>?
                            </p>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                            <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg shadow-sm hover:bg-brand-red/90">Confirmar Exclusão</button>
                        </div>
                    </div>
                </div>
            )}
            
            {supplierToView && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-gray-800 flex items-center gap-3">
                                <SupplierIcon className="w-6 h-6 text-brand-gray-500" />
                                Detalhes do Fornecedor
                            </h2>
                            <button onClick={handleCloseViewModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="flex items-center gap-4 pb-4 border-b border-brand-gray-100">
                                <div className="w-16 h-16 bg-brand-gray-100 rounded-lg flex items-center justify-center">
                                    <SupplierIcon className="w-8 h-8 text-brand-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-brand-gray-900">{supplierToView.name}</h3>
                                    <p className="text-sm text-brand-gray-500">{supplierToView.cnpj || 'CNPJ não informado'}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-md font-semibold text-brand-gray-700 mb-3">Informações de Contato</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-3"><UserCircleIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">Pessoa de Contato</strong><span className="text-brand-gray-800">{supplierToView.contactPerson || 'Não informado'}</span></div></div>
                                        <div className="flex items-start gap-3"><PhoneIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">Telefone</strong><span className="text-brand-gray-800">{supplierToView.phone || 'Não informado'}</span></div></div>
                                        <div className="flex items-start gap-3"><EnvelopeIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">Email</strong><span className="text-brand-gray-800">{supplierToView.email || 'Não informado'}</span></div></div>
                                        <div className="flex items-start gap-3"><MapPinIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><p className="whitespace-pre-wrap text-brand-gray-800">{supplierToView.address || 'Não informado'}</p></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-md font-semibold text-brand-gray-700 mb-3">Informações da Empresa</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-3"><GlobeAltIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">Website</strong><a href={supplierToView.website} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">{supplierToView.website || 'Não informado'}</a></div></div>
                                        <div className="flex items-start gap-3"><DocumentTextIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">Inscrição Estadual</strong><span className="text-brand-gray-800">{supplierToView.stateRegistration || 'Não informado'}</span></div></div>
                                    </div>
                                </div>
                            </div>

                            {(supplierToView.bankDetails || supplierToView.notes) && (
                                <div className="pt-4 border-t border-brand-gray-100">
                                    <h4 className="text-md font-semibold text-brand-gray-700 mb-3">Informações Adicionais</h4>
                                    <div className="space-y-3 text-sm">
                                        {supplierToView.bankDetails && <div className="flex items-start gap-3"><BanknotesIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">Dados Bancários</strong><p className="whitespace-pre-wrap text-brand-gray-800">{supplierToView.bankDetails}</p></div></div>}
                                        {supplierToView.notes && <div className="flex items-start gap-3"><ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">Observações</strong><p className="whitespace-pre-wrap text-brand-gray-800">{supplierToView.notes}</p></div></div>}
                                    </div>
                                </div>
                            )}
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

export default Fornecedores;