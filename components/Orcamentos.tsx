import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Import missing enums for Client type to resolve TypeScript errors.
import { type Budget, BudgetStatus, type Client, ProjectType, type Material, type BudgetMaterial, type BudgetImage, ClientType, ClientStatus, ContactPreference, ClientSource, type BudgetService } from '../types';
import { budgetsData, clientsData, materialsData, servicesData } from '../data/mockData';

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
const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h2.25" /></svg>;
const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>;
const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 3V9M3 12V9" /></svg>;

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
);

// Simplified in-memory list of materials for the form
const simpleMaterialsData = materialsData.map(m => ({ id: m.id, name: m.name, price: m.price || 0 }));

const getStatusClass = (status: BudgetStatus) => {
    switch (status) {
        case BudgetStatus.Aprovado: return 'bg-green-100 text-green-800';
        case BudgetStatus.Pendente: return 'bg-yellow-100 text-yellow-800';
        case BudgetStatus.Recusado: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface OrcamentosProps {
    toggleSidebar: () => void;
    initialBudgetId?: string | null;
    clearInitialBudgetId?: () => void;
}

interface BudgetDraft extends Partial<Budget> {
    _formState?: {
        clientSearchTerm: string;
        laborCost: string;
        discount: string;
        taxes: string;
    }
}
const DRAFT_KEY = 's3e-budget-draft';

const BudgetPrintView: React.FC<{ budget: Budget }> = ({ budget }) => (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg print:shadow-none print:rounded-none print:border-none">
        <header className="pb-4 border-b border-brand-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-brand-gray-900">{budget.projectName}</h3>
                    <p className="text-sm text-brand-gray-500">
                        para <span className="font-semibold text-brand-gray-700">{budget.clientName}</span>
                    </p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(budget.status)}`}>{budget.status}</span>
            </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-6">
            <div className="md:col-span-3 space-y-6">
                <div>
                    <h4 className="font-semibold text-brand-gray-800 mb-3 text-lg">Detalhes</h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3"><UserIcon className="w-5 h-5 text-brand-gray-400 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">CLIENTE</strong><span className="text-brand-gray-700">{budget.clientName}</span></div></div>
                        <div className="flex items-start gap-3"><CalendarDaysIcon className="w-5 h-5 text-brand-gray-400 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">DATA</strong><span className="text-brand-gray-700">{budget.date}</span></div></div>
                        <div className="flex items-start gap-3"><FolderIcon className="w-5 h-5 text-brand-gray-400 mt-0.5" /><div><strong className="block text-brand-gray-500 text-xs">TIPO</strong><span className="text-brand-gray-700">{budget.projectType}</span></div></div>
                    </div>
                </div>
                
                {budget.description && (
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-brand-gray-800 mb-2 text-lg">Descrição</h4>
                        <p className="text-sm text-brand-gray-600 whitespace-pre-wrap">{budget.description}</p>
                    </div>
                )}

                {budget.materials.length > 0 && (
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-brand-gray-800 mb-3 text-lg">Materiais</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full text-sm">
                                <thead className="bg-brand-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-brand-gray-500 uppercase">Material</th><th className="px-4 py-2 text-center text-xs font-medium text-brand-gray-500 uppercase">Qtd.</th><th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-500 uppercase">Subtotal</th></tr></thead>
                                <tbody className="divide-y divide-brand-gray-200">
                                    {budget.materials.map(m => (
                                        <tr key={m.materialId}>
                                            <td className="px-4 py-2">{m.name}</td>
                                            <td className="px-4 py-2 text-center">{m.quantity}</td>
                                            <td className="px-4 py-2 text-right font-medium">R$ {(m.price * m.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {budget.services && budget.services.length > 0 && (
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-brand-gray-800 mb-3 text-lg">Serviços</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full text-sm">
                                <thead className="bg-brand-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-brand-gray-500 uppercase">Serviço</th><th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-500 uppercase">Preço</th></tr></thead>
                                <tbody className="divide-y divide-brand-gray-200">
                                    {budget.services.map(s => (
                                        <tr key={s.serviceId}>
                                            <td className="px-4 py-2">{s.name}</td>
                                            <td className="px-4 py-2 text-right font-medium">R$ {s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {budget.images.length > 0 && (
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-brand-gray-800 mb-3 text-lg">Imagens</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {budget.images.map((image, index) => (
                                <a href={image.dataUrl} target="_blank" rel="noopener noreferrer" key={index} className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"><img src={image.dataUrl} alt={image.name} className="w-full h-24 object-cover" /></a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="md:col-span-2">
                <div className="bg-brand-gray-50 p-6 rounded-lg space-y-4 border border-brand-gray-200">
                    <h4 className="font-semibold text-brand-gray-800 text-lg">Resumo Financeiro</h4>
                    <div className="space-y-2 text-sm border-b pb-3">
                        <p className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">R$ {budget.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                        <p className="flex justify-between"><span>Desconto:</span> <span className="font-medium text-red-500">- R$ {budget.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                        <p className="flex justify-between"><span>Taxas:</span> <span className="font-medium">+ R$ {budget.taxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                    </div>
                    <p className="flex justify-between items-baseline pt-2"><strong className="text-xl">Total:</strong> <strong className="text-2xl text-brand-blue">R$ {budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                    {budget.paymentTerms && (
                        <div className="!mt-6 border-t pt-4">
                            <div className="flex items-start gap-3 text-sm">
                                <WalletIcon className="w-5 h-5 text-brand-gray-400 mt-0.5" />
                                <div><strong className="block text-brand-gray-500 text-xs">PAGAMENTO</strong><span>{budget.paymentTerms}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);


const Orcamentos: React.FC<OrcamentosProps> = ({ toggleSidebar, initialBudgetId, clearInitialBudgetId }) => {
    const [budgets, setBudgets] = useState<Budget[]>(budgetsData);
    const [filter, setFilter] = useState<BudgetStatus | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    
    const [budgetToView, setBudgetToView] = useState<Budget | null>(null);

    const [draft, setDraft] = useState<BudgetDraft | null>(null);

    const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const clientListRef = useRef<HTMLUListElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [isClientListVisible, setIsClientListVisible] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [projectType, setProjectType] = useState<ProjectType>(ProjectType.CompletoComObra);
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [projectMaterials, setProjectMaterials] = useState<BudgetMaterial[]>([]);
    const [projectServices, setProjectServices] = useState<BudgetService[]>([]);
    const [materialToAddId, setMaterialToAddId] = useState<string>('');
    const [serviceToAddId, setServiceToAddId] = useState<string>('');
    const [projectImages, setProjectImages] = useState<BudgetImage[]>([]);
    const [laborCost, setLaborCost] = useState('');
    const [discount, setDiscount] = useState('');
    const [taxes, setTaxes] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');

    const handleStatusChange = (budgetId: string, newStatus: BudgetStatus) => {
        setBudgets(prevBudgets =>
            prevBudgets.map(budget =>
                budget.id === budgetId ? { ...budget, status: newStatus } : budget
            )
        );
        setOpenDropdownId(null);
    };
    
    const parseAndValidateFloat = (val: number | string) => {
        const num = parseFloat(String(val));
        return isNaN(num) ? 0 : num;
    };
    
    const materialsSubtotal = useMemo(() => {
        return projectMaterials.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [projectMaterials]);

    const servicesSubtotal = useMemo(() => {
        return projectServices.reduce((sum, item) => sum + item.price, 0);
    }, [projectServices]);

    const total = useMemo(() => {
        const numLaborCost = parseAndValidateFloat(laborCost);
        const numDiscount = parseAndValidateFloat(discount);
        const numTaxes = parseAndValidateFloat(taxes);
        return materialsSubtotal + servicesSubtotal + numLaborCost - numDiscount + numTaxes;
    }, [materialsSubtotal, servicesSubtotal, laborCost, discount, taxes]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setIsClientListVisible(false);
            }
            if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    useEffect(() => {
        if (!isClientListVisible) {
            setHighlightedIndex(-1);
        }
    }, [isClientListVisible]);
    
    useEffect(() => {
        if (highlightedIndex < 0 || !clientListRef.current) return;
        const list = clientListRef.current;
        const highlightedItem = list.children[highlightedIndex] as HTMLLIElement;
        if (highlightedItem) {
            highlightedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [highlightedIndex]);

    useEffect(() => {
        if (initialBudgetId && budgets.length > 0) {
            const budgetToOpen = budgets.find(b => b.id === initialBudgetId);
            if (budgetToOpen) {
                setBudgetToView(budgetToOpen);
                clearInitialBudgetId?.();
            }
        }
    }, [initialBudgetId, budgets, clearInitialBudgetId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalLaborCost = parseAndValidateFloat(laborCost);

        if (!selectedClient || !projectName || (finalLaborCost <= 0 && materialsSubtotal <= 0 && servicesSubtotal <=0) ) {
            alert('Por favor, preencha as informações do cliente, projeto e adicione materiais, serviços ou mão de obra.');
            return;
        }

        const finalDiscount = parseAndValidateFloat(discount);
        const finalTaxes = parseAndValidateFloat(taxes);
        
        const budgetData = {
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            projectName,
            projectType,
            description,
            materials: projectMaterials,
            services: projectServices,
            images: projectImages,
            date: new Date().toLocaleDateString('pt-BR'),
            subtotal: finalLaborCost + materialsSubtotal + servicesSubtotal,
            discount: finalDiscount,
            taxes: finalTaxes,
            total,
            paymentTerms,
            status: editingBudget ? editingBudget.status : BudgetStatus.Pendente,
        };

        if (editingBudget) {
            const updatedBudget: Budget = { ...editingBudget, ...budgetData };
            setBudgets(budgets.map(b => b.id === editingBudget.id ? updatedBudget : b));
        } else {
            const newBudgetIdNumber = budgets.length + 1;
            const newBudget: Budget = {
                id: `ORC-2025-${String(newBudgetIdNumber).padStart(3, '0')}`,
                ...budgetData,
            };
            setBudgets([newBudget, ...budgets]);
            localStorage.removeItem(DRAFT_KEY);
        }
        
        handleCloseModal();
    };

    const handleOpenModal = () => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                setDraft(parsedDraft);
            } catch (error) {
                console.error("Falha ao analisar rascunho:", error);
                localStorage.removeItem(DRAFT_KEY);
            }
        }
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        setDraft(null);
        setSelectedClient(null);
        setClientSearchTerm('');
        setProjectType(ProjectType.CompletoComObra);
        setProjectName('');
        setDescription('');
        setProjectMaterials([]);
        setProjectServices([]);
        setProjectImages([]);
        setLaborCost('');
        setDiscount('');
        setTaxes('');
        setPaymentTerms('');
    };
    
    const handleSaveDraft = () => {
        const draftData: BudgetDraft = {
            clientId: selectedClient?.id,
            clientName: selectedClient?.name,
            projectName,
            projectType,
            description,
            materials: projectMaterials,
            services: projectServices,
            images: projectImages,
            subtotal: parseAndValidateFloat(laborCost) + materialsSubtotal + servicesSubtotal,
            discount: parseAndValidateFloat(discount),
            taxes: parseAndValidateFloat(taxes),
            total,
            paymentTerms,
            _formState: {
                clientSearchTerm,
                laborCost,
                discount,
                taxes,
            }
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        alert('Rascunho salvo com sucesso!');
        handleCloseModal();
    };
    
    const handleRestoreDraft = () => {
        if (!draft) return;

        const client = clientsData.find(c => c.id === draft.clientId);
        if (client) {
            setSelectedClient(client);
            setClientSearchTerm(draft._formState?.clientSearchTerm || client.name);
        }

        setProjectName(draft.projectName || '');
        setProjectType(draft.projectType || ProjectType.CompletoComObra);
        setDescription(draft.description || '');
        setProjectMaterials(draft.materials || []);
        setProjectServices(draft.services || []);
        setProjectImages(draft.images || []);
        setPaymentTerms(draft.paymentTerms || '');
        
        if (draft._formState) {
            setLaborCost(draft._formState.laborCost || '');
            setDiscount(draft._formState.discount || '');
            setTaxes(draft._formState.taxes || '');
        }

        setDraft(null);
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraft(null);
    };

    const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClientSearchTerm(e.target.value);
        setSelectedClient(null);
        if (e.target.value) {
            setIsClientListVisible(true);
        } else {
            setIsClientListVisible(false);
        }
    };
    
    const handleSelectClient = (client: Client) => {
        setSelectedClient(client);
        setClientSearchTerm(client.name);
        setIsClientListVisible(false);
    };

    const handleClientSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isClientListVisible && filteredClients.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % filteredClients.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + filteredClients.length) % filteredClients.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelectClient(filteredClients[highlightedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsClientListVisible(false);
            }
        }
    };

    const handleAddMaterial = () => {
        if (!materialToAddId) return;
        const material = simpleMaterialsData.find(m => m.id === materialToAddId);
        if (material && !projectMaterials.some(pm => pm.materialId === materialToAddId)) {
            const newMaterial: BudgetMaterial = {
                materialId: material.id,
                name: material.name,
                price: material.price,
                quantity: 1,
            };
            setProjectMaterials([...projectMaterials, newMaterial]);
        }
        setMaterialToAddId('');
    };
    
    // FIX: Update function parameter type for materialId to string
    const handleUpdateMaterialQuantity = (materialId: string, quantity: number) => {
        const newQuantity = Math.max(1, quantity);
        setProjectMaterials(projectMaterials.map(m =>
            m.materialId === materialId ? { ...m, quantity: newQuantity } : m
        ));
    };

    // FIX: Update function parameter type for materialId to string
    const handleRemoveMaterial = (materialId: string) => {
        setProjectMaterials(projectMaterials.filter(m => m.materialId !== materialId));
    };

    const handleAddService = () => {
        if (!serviceToAddId) return;
        const service = servicesData.find(s => s.id === serviceToAddId);
        if (service && !projectServices.some(ps => ps.serviceId === serviceToAddId)) {
            const newService: BudgetService = {
                serviceId: service.id,
                name: service.name,
                price: service.price,
            };
            setProjectServices([...projectServices, newService]);
        }
        setServiceToAddId('');
    };
    
    const handleRemoveService = (serviceId: string) => {
        setProjectServices(projectServices.filter(s => s.serviceId !== serviceId));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImage: BudgetImage = {
                        name: file.name,
                        dataUrl: reader.result as string,
                    };
                    setProjectImages(prev => [...prev, newImage]);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const handleRemoveImage = (indexToRemove: number) => {
        setProjectImages(projectImages.filter((_, index) => index !== indexToRemove));
    };

    const handleOpenDeleteModal = (id: string) => {
        setBudgetToDelete(id);
        setDeletePassword('');
        setDeleteError('');
        setOpenDropdownId(null);
    };
    
    const handleCloseDeleteModal = () => {
        setBudgetToDelete(null);
    };
    
    const handleConfirmDelete = () => {
        if (deletePassword === '0000') {
            setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetToDelete));
            handleCloseDeleteModal();
        } else {
            setDeleteError('Senha incorreta. Tente novamente.');
        }
    };
    
    const handleOpenViewModal = (budget: Budget) => {
        setBudgetToView(budget);
        setOpenDropdownId(null);
    };
    
    const handleCloseViewModal = () => {
        setBudgetToView(null);
    };

    const handleOpenEditModal = (budget: Budget) => {
        setEditingBudget(budget);
    
        const client = clientsData.find(c => c.id === budget.clientId);
        setSelectedClient(client || null);
        setClientSearchTerm(client ? client.name : '');
    
        setProjectName(budget.projectName);
        setProjectType(budget.projectType);
        setDescription(budget.description);
        setProjectMaterials(budget.materials);
        setProjectServices(budget.services || []);
        setProjectImages(budget.images);
        
        const materialsCost = budget.materials.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const servicesCost = (budget.services || []).reduce((sum, item) => sum + item.price, 0);
        const labor = budget.subtotal - materialsCost - servicesCost;
        setLaborCost(String(labor > 0 ? labor : ''));

        setDiscount(String(budget.discount > 0 ? budget.discount : ''));
        setTaxes(String(budget.taxes > 0 ? budget.taxes : ''));
        setPaymentTerms(budget.paymentTerms);
    
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };


    const filteredBudgets = budgets
        .filter(budget => filter === 'Todos' || budget.status === filter)
        .filter(budget =>
            budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            budget.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            budget.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const filteredClients = clientsData.filter(client =>
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

    const availableMaterials = simpleMaterialsData.filter(
        stockMaterial => !projectMaterials.some(pm => pm.materialId === stockMaterial.id)
    );
    
    const availableServices = servicesData.filter(
        service => !projectServices.some(ps => ps.serviceId === service.id)
    );

    return (
        <div className="p-4 sm:p-8">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Orçamentos</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de propostas e orçamentos</p>
                    </div>
                </div>
                <button 
                    onClick={handleOpenModal}
                    className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Criar Novo Orçamento
                </button>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, projeto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-gray-600">Status:</span>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as BudgetStatus | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todos</option>
                            <option value={BudgetStatus.Pendente}>Pendente</option>
                            <option value={BudgetStatus.Aprovado}>Aprovado</option>
                            <option value={BudgetStatus.Recusado}>Recusado</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredBudgets.map((budget) => (
                        <div key={budget.id} className="bg-white rounded-lg border border-brand-gray-200 shadow-sm p-4 transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-brand-blue">{budget.id}</p>
                                    <h3 className="font-bold text-lg text-brand-gray-800">{budget.projectName}</h3>
                                    <p className="text-sm text-brand-gray-500">{budget.clientName}</p>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setOpenDropdownId(budget.id === openDropdownId ? null : budget.id)} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                    {openDropdownId === budget.id && (
                                        <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                            <div className="py-1">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleOpenViewModal(budget); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">
                                                    <EyeIcon className="w-4 h-4" /> Visualizar
                                                </a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleOpenEditModal(budget); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">
                                                    <PencilIcon className="w-4 h-4" /> Editar
                                                </a>
                                            </div>
                                            <div className="py-1 border-t border-brand-gray-100">
                                                <span className="block px-4 pt-1 pb-1 text-xs text-brand-gray-500">Alterar Status</span>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(budget.id, BudgetStatus.Aprovado); }} className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                                                    <CheckCircleIcon className="w-4 h-4" /> Aprovar
                                                </a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(budget.id, BudgetStatus.Pendente); }} className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">
                                                    <ClockIcon className="w-4 h-4" /> Marcar Pendente
                                                </a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(budget.id, BudgetStatus.Recusado); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                                                    <XCircleIcon className="w-4 h-4" /> Recusar
                                                </a>
                                            </div>
                                            <div className="py-1 border-t border-brand-gray-100">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(budget.id); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                    <TrashIcon className="w-4 h-4" /> Excluir
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div className="mt-4 pt-4 border-t border-brand-gray-100 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-brand-gray-500">Valor Total</p>
                                    <p className="text-xl font-bold text-brand-gray-800">R$ {budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-brand-gray-500 mb-1">{budget.date}</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(budget.status)}`}>
                                        {budget.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                                <h2 className="text-xl font-bold text-brand-gray-800">{editingBudget ? 'Editar Orçamento' : 'Criar Novo Orçamento'}</h2>
                                <button type="button" onClick={handleCloseModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {draft && !editingBudget && (
                                <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 mx-6 mt-4 flex justify-between items-center rounded-r-lg">
                                    <div>
                                        <p className="font-bold">Rascunho Encontrado</p>
                                        <p className="text-sm">Deseja continuar de onde parou?</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={handleRestoreDraft} className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600">Restaurar</button>
                                        <button type="button" onClick={handleDiscardDraft} className="px-3 py-1 bg-transparent text-yellow-900 text-sm font-semibold rounded-md hover:bg-yellow-200">Descartar</button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                                <fieldset className="border border-brand-gray-200 rounded-lg p-4">
                                    <legend className="text-lg font-semibold text-brand-gray-800 px-2">1. Cliente e Projeto</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div ref={autocompleteRef} className="relative">
                                            <label htmlFor="client" className="block text-sm font-medium text-brand-gray-700 mb-1">Buscar Cliente</label>
                                            <input id="client" type="text" value={clientSearchTerm} onChange={handleClientSearchChange} onFocus={() => clientSearchTerm && setIsClientListVisible(true)} onKeyDown={handleClientSearchKeyDown} placeholder="Digite para buscar..." className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required autoComplete="off" />
                                            {isClientListVisible && filteredClients.length > 0 && (
                                                <ul ref={clientListRef} className="absolute z-20 w-full bg-white border border-brand-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                                    {filteredClients.map((client, index) => (
                                                      <li 
                                                        key={client.id} 
                                                        onClick={() => handleSelectClient(client)} 
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                        className={`px-4 py-2 cursor-pointer ${highlightedIndex === index ? 'bg-brand-blue-light' : 'hover:bg-brand-blue-light'}`}
                                                      >
                                                        {client.name}
                                                      </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {selectedClient && (
                                                <div className="mt-2 p-3 bg-brand-gray-50 border border-brand-gray-200 rounded-lg text-xs text-brand-gray-600 space-y-1">
                                                    <p><strong>Telefone:</strong> {selectedClient.phone}</p>
                                                    <p><strong>Email:</strong> {selectedClient.email}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="projectName" className="block text-sm font-medium text-brand-gray-700 mb-1">Nome do Projeto/Serviço</label>
                                                <input type="text" id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="ex: Instalação Elétrica" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                            </div>
                                            <div>
                                                <label htmlFor="projectType" className="block text-sm font-medium text-brand-gray-700 mb-1">Tipo de Projeto</label>
                                                <select id="projectType" value={projectType} onChange={(e) => setProjectType(e.target.value as ProjectType)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required>
                                                    {Object.values(ProjectType).map(type => (<option key={type} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                                
                                <fieldset className="border border-brand-gray-200 rounded-lg p-4">
                                     <legend className="text-lg font-semibold text-brand-gray-800 px-2">2. Detalhes e Custos</legend>
                                     <div className="pt-2 space-y-6">
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-brand-gray-700 mb-1">Descrição do Projeto</label>
                                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Detalhe o escopo do serviço..." className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                        </div>
                                        
                                        {(projectType === ProjectType.Montagem || projectType === ProjectType.CompletoComObra) && (
                                            <div className="border-t border-brand-gray-200 pt-6 space-y-4">
                                                <h3 className="text-md font-semibold text-brand-gray-700">Materiais do Projeto</h3>
                                                <div className="flex items-center gap-2">
                                                    <select value={materialToAddId} onChange={e => setMaterialToAddId(e.target.value)} className="flex-grow px-3 py-2 border border-brand-gray-300 rounded-lg">
                                                        <option value="">Selecione um material...</option>
                                                        {availableMaterials.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                                                    </select>
                                                    <button type="button" onClick={handleAddMaterial} className="px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600" disabled={!materialToAddId}>Adicionar</button>
                                                </div>
                                                {projectMaterials.length > 0 && (
                                                    <div className="space-y-2">
                                                        {projectMaterials.map(material => (
                                                            <div key={material.materialId} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-brand-gray-50">
                                                                <span className="col-span-5 text-sm font-medium">{material.name}</span>
                                                                <input type="number" value={material.quantity} onChange={e => handleUpdateMaterialQuantity(material.materialId, parseInt(e.target.value))} className="col-span-2 w-full px-2 py-1 border border-brand-gray-300 rounded-md" min="1" />
                                                                <span className="col-span-2 text-sm text-center">x R$ {material.price.toFixed(2)}</span>
                                                                <span className="col-span-2 text-sm font-semibold text-right">R$ {(material.price * material.quantity).toFixed(2)}</span>
                                                                <button type="button" onClick={() => handleRemoveMaterial(material.materialId)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-end"><TrashIcon className="w-4 h-4" /></button>
                                                            </div>
                                                        ))}
                                                        <div className="text-right font-bold pt-2 pr-2">Subtotal Materiais: R$ {materialsSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="border-t border-brand-gray-200 pt-6 space-y-4">
                                            <h3 className="text-md font-semibold text-brand-gray-700">Serviços Adicionais</h3>
                                            <div className="flex items-center gap-2">
                                                <select value={serviceToAddId} onChange={e => setServiceToAddId(e.target.value)} className="flex-grow px-3 py-2 border border-brand-gray-300 rounded-lg">
                                                    <option value="">Selecione um serviço...</option>
                                                    {availableServices.map(s => (<option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>))}
                                                </select>
                                                <button type="button" onClick={handleAddService} className="px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600" disabled={!serviceToAddId}>Adicionar</button>
                                            </div>
                                            {projectServices.length > 0 && (
                                                <div className="space-y-2">
                                                    {projectServices.map(service => (
                                                        <div key={service.serviceId} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-brand-gray-50">
                                                            <span className="col-span-8 text-sm font-medium">{service.name}</span>
                                                            <span className="col-span-3 text-sm font-semibold text-right">R$ {service.price.toFixed(2)}</span>
                                                            <button type="button" onClick={() => handleRemoveService(service.serviceId)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-end"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                    <div className="text-right font-bold pt-2 pr-2">Subtotal Serviços: R$ {servicesSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="border-t border-brand-gray-200 pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                              <div>
                                                  <label htmlFor="laborCost" className="block text-sm font-medium text-brand-gray-700 mb-1">Mão de Obra (R$)</label>
                                                  <input type="number" id="laborCost" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} placeholder="2000.00" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" step="0.01" min="0" />
                                              </div>
                                              <div>
                                                  <label htmlFor="discount" className="block text-sm font-medium text-brand-gray-700 mb-1">Desconto (R$)</label>
                                                  <input type="number" id="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="100.00" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" step="0.01" min="0" />
                                              </div>
                                              <div>
                                                  <label htmlFor="taxes" className="block text-sm font-medium text-brand-gray-700 mb-1">Taxas (R$)</label>
                                                  <input type="number" id="taxes" value={taxes} onChange={(e) => setTaxes(e.target.value)} placeholder="50.00" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" step="0.01" min="0" />
                                              </div>
                                              <div className="md:text-right md:self-end">
                                                <span className="text-xl font-bold text-brand-gray-800">
                                                    Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                              </div>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                                
                                <fieldset className="border border-brand-gray-200 rounded-lg p-4">
                                     <legend className="text-lg font-semibold text-brand-gray-800 px-2">3. Finalização</legend>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-2">Imagens de Apresentação</label>
                                            <div className="flex items-center gap-4">
                                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                                    <PaperClipIcon className="w-5 h-5 mr-2" />
                                                    Anexar Imagens
                                                </button>
                                            </div>
                                            {projectImages.length > 0 && (
                                                <div className="mt-4 grid grid-cols-3 gap-2">
                                                    {projectImages.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <img src={image.dataUrl} alt={image.name} className="w-full h-20 object-cover rounded-md" />
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button type="button" onClick={() => handleRemoveImage(index)} className="text-white p-1 bg-red-600 rounded-full"><XMarkIcon className="w-4 h-4" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="paymentTerms" className="block text-sm font-medium text-brand-gray-700 mb-1">Termos de Pagamento</label>
                                            <textarea id="paymentTerms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={3} placeholder="ex: 50% de entrada..." className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3 flex-shrink-0">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                    Cancelar
                                </button>
                                {!editingBudget && (
                                    <button type="button" onClick={handleSaveDraft} className="px-4 py-2 bg-brand-gray-200 text-brand-gray-800 font-semibold rounded-lg hover:bg-brand-gray-300">
                                        Salvar como Rascunho
                                    </button>
                                )}
                                <button type="submit" className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90 disabled:bg-brand-blue/50 disabled:cursor-not-allowed" disabled={!selectedClient || !projectName || total <= 0}>
                                    {editingBudget ? 'Salvar Alterações' : 'Criar Orçamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {budgetToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-brand-gray-200">
                            <h2 className="text-xl font-bold text-brand-gray-800">Confirmar Exclusão</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-brand-gray-600">
                                Você tem certeza que deseja excluir o orçamento <strong className="text-brand-gray-800">{budgetToDelete}</strong>?
                                <br />
                                Esta ação não pode ser desfeita. Para confirmar, digite a senha.
                            </p>
                            <div>
                                <label htmlFor="delete-password" className="block text-sm font-medium text-brand-gray-700 mb-1">Senha de Confirmação (0000)</label>
                                <input
                                    id="delete-password"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => {
                                        setDeletePassword(e.target.value);
                                        setDeleteError('');
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg ${deleteError ? 'border-red-500' : 'border-brand-gray-300'}`}
                                    autoFocus
                                />
                                {deleteError && <p className="mt-1 text-xs text-red-600">{deleteError}</p>}
                            </div>
                        </div>
                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg shadow-sm hover:bg-brand-red/90"
                            >
                                Excluir Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {budgetToView && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-brand-gray-800">Detalhes do Orçamento</h2>
                                    <p className="text-sm text-brand-gray-500">{budgetToView.id}</p>
                                </div>
                                <button type="button" onClick={handleCloseViewModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto bg-brand-gray-50 p-4 sm:p-6 lg:p-8">
                                <BudgetPrintView budget={budgetToView} />
                            </div>

                            <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600"
                                >
                                    <PrinterIcon className="w-5 h-5" />
                                    Imprimir / Baixar PDF
                                </button>
                                <button type="button" onClick={handleCloseViewModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="hidden print:block">
                        <BudgetPrintView budget={budgetToView} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Orcamentos;