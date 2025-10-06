import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type PurchaseOrder, type Supplier, PurchaseStatus, type PurchaseOrderItem, type Product, CatalogItemType } from '../types';
import { purchasesData, catalogData, suppliersData } from '../data/mockData';

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
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
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
const DocumentArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

// XML Import data structure
interface ParsedXMLData {
    invoice: { number: string; emissionDate: string };
    vendor: { name: string; cnpj: string; address: string };
    items: PurchaseOrderItem[];
    payment: { method: string; installments: { dueDate: string; value: string }[] };
}

const getStatusClass = (status: PurchaseStatus) => {
    switch (status) {
        case PurchaseStatus.Recebido: return 'bg-green-100 text-green-800';
        case PurchaseStatus.Pendente: return 'bg-yellow-100 text-yellow-800';
        case PurchaseStatus.Cancelado: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface ComprasProps {
    toggleSidebar: () => void;
}

const Compras: React.FC<ComprasProps> = ({ toggleSidebar }) => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(purchasesData);
    const [products, setProducts] = useState<Product[]>(catalogData.filter(item => item.type === CatalogItemType.Produto) as Product[]);
    const [filter, setFilter] = useState<PurchaseStatus | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Action states
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [purchaseToView, setPurchaseToView] = useState<PurchaseOrder | null>(null);
    const [purchaseToEdit, setPurchaseToEdit] = useState<PurchaseOrder | null>(null);
    const [purchaseToDelete, setPurchaseToDelete] = useState<PurchaseOrder | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Form state
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [status, setStatus] = useState<PurchaseStatus>(PurchaseStatus.Pendente);
    const [purchaseItems, setPurchaseItems] = useState<PurchaseOrderItem[]>([]);
    const [productToAdd, setProductToAdd] = useState<{id: string, quantity: string, cost: string}>({id: '', quantity: '1', cost: ''});
    
    // XML Import state
    const [xmlData, setXmlData] = useState<ParsedXMLData | null>(null);
    const xmlFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const resetForm = () => {
        setSelectedSupplierId('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setInvoiceNumber('');
        setStatus(PurchaseStatus.Pendente);
        setPurchaseItems([]);
        setProductToAdd({id: '', quantity: '1', cost: ''});
        setXmlData(null);
    };

    const openPurchaseModal = (purchase: PurchaseOrder | null = null) => {
        resetForm();
    
        if (purchase) {
            setPurchaseToEdit(purchase);
            setSelectedSupplierId(purchase.supplier.id);
            const dateParts = purchase.date.split('/');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            setPurchaseDate(formattedDate);
            setInvoiceNumber(purchase.invoiceNumber || '');
            setStatus(purchase.status);
            setPurchaseItems(purchase.items);
        } else {
            setPurchaseToEdit(null);
        }
    
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPurchaseToEdit(null);
        resetForm();
    };
    
    const availableProducts = useMemo(() => {
        const itemIds = new Set(purchaseItems.map(i => i.productId));
        return products.filter(p => !itemIds.has(p.id));
    }, [products, purchaseItems]);

    const handleAddItem = () => {
        const product = products.find(p => p.id === productToAdd.id);
        const quantity = parseInt(productToAdd.quantity);
        const unitCost = parseFloat(productToAdd.cost);

        if (product && quantity > 0 && unitCost >= 0) {
            const newItem: PurchaseOrderItem = {
                productId: product.id,
                productName: product.name,
                quantity,
                unitCost,
            };
            setPurchaseItems(prev => [...prev, newItem]);
            setProductToAdd({id: '', quantity: '1', cost: ''});
        } else {
            alert('Por favor, selecione um produto e preencha a quantidade e o custo corretamente.');
        }
    };

    const handleRemoveItem = (productId: string) => {
        setPurchaseItems(prev => prev.filter(item => item.productId !== productId));
    };

    const purchaseTotal = useMemo(() => {
        return purchaseItems.reduce((total, item) => total + item.quantity * item.unitCost, 0);
    }, [purchaseItems]);

    const handleSavePurchase = () => {
        const supplier = suppliersData.find(s => s.id === selectedSupplierId);
        if (!supplier || purchaseItems.length === 0) {
            alert('Selecione um fornecedor e adicione pelo menos um item.');
            return;
        }

        const stockAdjustments = new Map<string, number>();

        if (purchaseToEdit) {
            const originalStatus = purchaseToEdit.status;
            const newStatus = status;

            if (originalStatus !== PurchaseStatus.Recebido && newStatus === PurchaseStatus.Recebido) {
                purchaseItems.forEach(item => stockAdjustments.set(item.productId, (stockAdjustments.get(item.productId) || 0) + Number(item.quantity)));
            }
            else if (originalStatus === PurchaseStatus.Recebido && newStatus !== PurchaseStatus.Recebido) {
                purchaseToEdit.items.forEach(item => stockAdjustments.set(item.productId, (stockAdjustments.get(item.productId) || 0) - Number(item.quantity)));
            }
            else if (originalStatus === PurchaseStatus.Recebido && newStatus === PurchaseStatus.Recebido) {
                // FIX: Ensure item quantities are treated as numbers when creating maps to prevent type errors in arithmetic operations.
                const itemMap = new Map(purchaseItems.map(item => [item.productId, Number(item.quantity)]));
                const originalItemMap = new Map(purchaseToEdit.items.map(item => [item.productId, Number(item.quantity)]));
                const allProductIds = new Set([...itemMap.keys(), ...originalItemMap.keys()]);
                allProductIds.forEach(productId => {
                    const newQty = itemMap.get(productId) || 0;
                    const oldQty = originalItemMap.get(productId) || 0;
                    const delta = newQty - oldQty;
                    if (delta !== 0) {
                        stockAdjustments.set(productId, (stockAdjustments.get(productId) || 0) + delta);
                    }
                });
            }
        } else {
             if (status === PurchaseStatus.Recebido) {
                purchaseItems.forEach(item => stockAdjustments.set(item.productId, (stockAdjustments.get(item.productId) || 0) + Number(item.quantity)));
             }
        }

        if (stockAdjustments.size > 0) {
            setProducts(prevProducts => {
                const updatedProducts = [...prevProducts];
                stockAdjustments.forEach((change, productId) => {
                    const productIndex = updatedProducts.findIndex(p => p.id === productId);
                    if (productIndex !== -1) {
                        updatedProducts[productIndex].stock += change;
                    }
                });
                return updatedProducts;
            });
        }
        
        const paymentDetails = xmlData ? `${xmlData.payment.method}${xmlData.payment.installments.length > 0 ? ` (${xmlData.payment.installments.length}x)` : ''}` : undefined;
        const vendorDetails = xmlData ? xmlData.vendor : undefined;
        
        if(purchaseToEdit) {
            const updatedPurchase: PurchaseOrder = {
                ...purchaseToEdit,
                supplier: { id: supplier.id, name: supplier.name },
                date: new Date(`${purchaseDate}T00:00:00`).toLocaleDateString('pt-BR'),
                items: purchaseItems,
                totalValue: purchaseTotal,
                status: status,
                invoiceNumber,
                paymentTerms: paymentDetails,
                fullVendorDetails: vendorDetails,
            }
            setPurchaseOrders(prev => prev.map(p => p.id === purchaseToEdit.id ? updatedPurchase : p));
        } else {
            const newPurchase: PurchaseOrder = {
                id: `PC-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
                supplier: { id: supplier.id, name: supplier.name },
                date: new Date(`${purchaseDate}T00:00:00`).toLocaleDateString('pt-BR'),
                items: purchaseItems,
                totalValue: purchaseTotal,
                status: status,
                invoiceNumber,
                paymentTerms: paymentDetails,
                fullVendorDetails: vendorDetails,
            };
            setPurchaseOrders(prev => [newPurchase, ...prev]);
        }
        
        handleCloseModal();
    };
    
    const handleXmlImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // FIX: Add a type check to ensure `e.target.result` is a string before using it. This resolves the error where an 'unknown' type cannot be assigned to a 'string'.
                const result = e.target?.result;
                if (typeof result !== 'string') {
                    alert('Erro ao ler o arquivo XML.');
                    return;
                }
                const xmlString = result;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
                
                const get = (selector: string, parent: Document | Element = xmlDoc) => parent.querySelector(selector)?.textContent || '';
                
                const vendorCnpj = get('emit > CNPJ');
                const matchingSupplier = suppliersData.find(s => s.cnpj === vendorCnpj);
                
                if (!matchingSupplier) {
                    alert(`Fornecedor com CNPJ ${vendorCnpj} não encontrado. Por favor, cadastre o fornecedor antes de importar a nota.`);
                    return;
                }

                const items: PurchaseOrderItem[] = Array.from(xmlDoc.querySelectorAll('det')).map(det => ({
                    // Attempt to find a matching product in our mock data by name, otherwise use data from XML
                    productId: products.find(p => p.name.toLowerCase() === get('prod > xProd', det).toLowerCase())?.id || get('prod > cProd', det),
                    productName: get('prod > xProd', det),
                    quantity: parseFloat(get('prod > qCom', det)),
                    unitCost: parseFloat(get('prod > vUnCom', det)),
                    ncm: get('prod > NCM', det),
                }));
                
                const paymentMethodCode = get('pag > detPag > tPag');
                const paymentMethods: { [key: string]: string } = {
                    '01': 'Dinheiro', '02': 'Cheque', '03': 'Cartão de Crédito', '04': 'Cartão de Débito', '05': 'Crédito Loja', '15': 'Boleto Bancário', '99': 'Outros'
                };
                
                const installments = Array.from(xmlDoc.querySelectorAll('cobr > dup')).map(dup => ({
                    dueDate: new Date(`${get('dVenc', dup)}T00:00:00`).toLocaleDateString('pt-BR'),
                    value: parseFloat(get('vDup', dup)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                }));
                
                const emissionDate = new Date(get('ide > dhEmi'));

                const parsedData: ParsedXMLData = {
                    invoice: {
                        number: get('ide > nNF'),
                        emissionDate: emissionDate.toLocaleDateString('pt-BR'),
                    },
                    vendor: {
                        name: get('emit > xNome'),
                        cnpj: vendorCnpj,
                        address: `${get('enderEmit > xLgr')}, ${get('enderEmit > nro')} - ${get('enderEmit > xBairro')}, ${get('enderEmit > xMun')}/${get('enderEmit > UF')}`,
                    },
                    items,
                    payment: {
                        method: paymentMethods[paymentMethodCode] || 'Não especificado',
                        installments,
                    }
                };
                
                // Directly populate the form
                setXmlData(parsedData);
                setSelectedSupplierId(matchingSupplier.id);
                setPurchaseDate(emissionDate.toISOString().split('T')[0]);
                setInvoiceNumber(parsedData.invoice.number);
                setPurchaseItems(parsedData.items);
                setStatus(PurchaseStatus.Pendente); // Default status for new imports

            } catch (error) {
                console.error("Erro ao processar XML:", error);
                alert("Ocorreu um erro ao ler o arquivo XML. Verifique se o arquivo é uma NF-e válida.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleOpenViewModal = (purchase: PurchaseOrder) => {
        setPurchaseToView(purchase);
        setOpenDropdownId(null);
    };

    const handleCloseViewModal = () => {
        setPurchaseToView(null);
    };

    const handleOpenDeleteModal = (purchase: PurchaseOrder) => {
        setPurchaseToDelete(purchase);
        setOpenDropdownId(null);
    };
    
    const handleCloseDeleteModal = () => {
        setPurchaseToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (purchaseToDelete) {
            if (purchaseToDelete.status === PurchaseStatus.Recebido) {
                setProducts(prevProducts => {
                    const updatedProducts = [...prevProducts];
                    purchaseToDelete.items.forEach(item => {
                        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                        if (productIndex !== -1) {
                            updatedProducts[productIndex].stock -= item.quantity;
                        }
                    });
                    return updatedProducts;
                });
            }
            setPurchaseOrders(prev => prev.filter(p => p.id !== purchaseToDelete.id));
            handleCloseDeleteModal();
        }
    };


    const filteredPurchases = useMemo(() => {
        return purchaseOrders
            .filter(p => filter === 'Todos' || p.status === filter)
            .filter(p =>
                p.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [purchaseOrders, filter, searchTerm]);

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Compras</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de pedidos e entrada de materiais</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => openPurchaseModal()}
                        className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Registrar Nova Compra
                    </button>
                </div>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por fornecedor, ID..."
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
                            onChange={(e) => setFilter(e.target.value as PurchaseStatus | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todos</option>
                            <option value={PurchaseStatus.Recebido}>Recebido</option>
                            <option value={PurchaseStatus.Pendente}>Pendente</option>
                            <option value={PurchaseStatus.Cancelado}>Cancelado</option>
                        </select>
                    </div>
                </div>

                {/* Purchases Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-gray-200">
                        <thead className="bg-brand-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">ID do Pedido</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Fornecedor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Itens</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Valor Total</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-gray-200">
                            {filteredPurchases.map((pc) => (
                                <tr key={pc.id} className="hover:bg-brand-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-blue">{pc.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-gray-900">{pc.supplier.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{pc.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{pc.items.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">R$ {pc.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(pc.status)}`}>
                                            {pc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative inline-block text-left">
                                            <button onClick={() => setOpenDropdownId(pc.id === openDropdownId ? null : pc.id)} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-gray-600">
                                                <EllipsisVerticalIcon className="w-5 h-5" />
                                            </button>
                                            {openDropdownId === pc.id && (
                                                <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenViewModal(pc); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100" role="menuitem">
                                                            <EyeIcon className="w-4 h-4" /> Visualizar
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); openPurchaseModal(pc); setOpenDropdownId(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100" role="menuitem">
                                                            <PencilIcon className="w-4 h-4" /> Editar
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(pc); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50" role="menuitem">
                                                            <TrashIcon className="w-4 h-4" /> Excluir
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Register/Edit Purchase Modal */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-brand-gray-800">{purchaseToEdit ? 'Editar Compra' : 'Registrar Nova Compra'}</h2>
                            <button type="button" onClick={handleCloseModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                            <div className="p-4 bg-brand-gray-50 rounded-lg flex justify-end">
                                <input type="file" ref={xmlFileInputRef} onChange={handleXmlImport} accept=".xml" className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => xmlFileInputRef.current?.click()}
                                    className="flex items-center justify-center bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-gray-100 transition-colors"
                                >
                                    <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                                    Importar XML da NF-e
                                </button>
                            </div>

                            {xmlData && (
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg space-y-4">
                                    <h3 className="text-lg font-bold text-blue-800">Dados Importados da NF-e</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><strong>Vendedor:</strong> {xmlData.vendor.name}</p>
                                            <p><strong>CNPJ:</strong> {xmlData.vendor.cnpj}</p>
                                            <p><strong>Endereço:</strong> {xmlData.vendor.address}</p>
                                        </div>
                                        <div>
                                            <p><strong>Nº Nota:</strong> {xmlData.invoice.number}</p>
                                            <p><strong>Emissão:</strong> {xmlData.invoice.emissionDate}</p>
                                            <p><strong>Pagamento:</strong> {xmlData.payment.method}</p>
                                        </div>
                                    </div>
                                    {xmlData.payment.installments.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold">Parcelas:</h4>
                                            <ul className="list-disc list-inside text-xs text-brand-gray-600">
                                                {xmlData.payment.installments.map((inst, idx) => (
                                                    <li key={idx}>Vencimento: {inst.dueDate} - Valor: {inst.value}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="supplier" className="block text-sm font-medium text-brand-gray-700 mb-1">Fornecedor *</label>
                                    <select id="supplier" value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required>
                                        <option value="" disabled>Selecione...</option>
                                        {suppliersData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-brand-gray-700 mb-1">Data da Compra *</label>
                                    <input type="date" id="purchaseDate" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                 <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-brand-gray-700 mb-1">Status *</label>
                                    <select id="status" value={status} onChange={e => setStatus(e.target.value as PurchaseStatus)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required>
                                        {Object.values(PurchaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="lg:col-span-3">
                                    <label htmlFor="invoice" className="block text-sm font-medium text-brand-gray-700 mb-1">Nº Nota Fiscal (Opcional)</label>
                                    <input type="text" id="invoice" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" />
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="border-t border-brand-gray-200 pt-6 space-y-4">
                                <h3 className="text-lg font-semibold text-brand-gray-800">Itens da Compra</h3>
                                {!xmlData && (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-brand-gray-50 rounded-lg items-end">
                                        <div className="lg:col-span-5">
                                            <label className="text-sm font-medium text-brand-gray-700">Produto</label>
                                            <select value={productToAdd.id} onChange={e => setProductToAdd({...productToAdd, id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue">
                                                <option value="">Selecione...</option>
                                                {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="text-sm font-medium text-brand-gray-700">Quantidade</label>
                                            <input type="number" value={productToAdd.quantity} onChange={e => setProductToAdd({...productToAdd, quantity: e.target.value})} min="1" className="w-full mt-1 px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <label className="text-sm font-medium text-brand-gray-700">Custo Unitário (R$)</label>
                                            <input type="number" value={productToAdd.cost} onChange={e => setProductToAdd({...productToAdd, cost: e.target.value})} min="0" step="0.01" className="w-full mt-1 px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <button type="button" onClick={handleAddItem} className="w-full px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600">Adicionar</button>
                                        </div>
                                    </div>
                                )}
                                {purchaseItems.length > 0 && (
                                    <div className="border border-brand-gray-200 rounded-lg overflow-hidden">
                                        <table className="min-w-full">
                                            <thead className="bg-brand-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-brand-gray-600 uppercase">Produto</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-brand-gray-600 uppercase">NCM</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-brand-gray-600 uppercase">Qtd.</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-600 uppercase">Custo Unit.</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-600 uppercase">Subtotal</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-600 uppercase"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {purchaseItems.map(item => (
                                                    <tr key={item.productId} className="border-t border-brand-gray-200">
                                                        <td className="px-4 py-2 text-sm font-medium text-brand-gray-800">{item.productName}</td>
                                                        <td className="px-4 py-2 text-sm text-brand-gray-600">{item.ncm || 'N/A'}</td>
                                                        <td className="px-4 py-2 text-sm text-brand-gray-600 text-center">{item.quantity}</td>
                                                        <td className="px-4 py-2 text-sm text-brand-gray-600 text-right">R$ {item.unitCost.toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-sm font-semibold text-brand-gray-900 text-right">R$ {(item.quantity * item.unitCost).toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            {!xmlData && (
                                                                <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                            <span className="text-xl font-bold text-brand-gray-800">
                                Valor Total: R$ {purchaseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <div className="flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                    Cancelar
                                </button>
                                <button type="button" onClick={handleSavePurchase} className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90" disabled={purchaseItems.length === 0 || !selectedSupplierId}>
                                    {purchaseToEdit ? 'Salvar Alterações' : 'Salvar Compra'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Purchase Modal */}
            {purchaseToView && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-brand-gray-800">Detalhes da Compra: <span className="text-brand-blue">{purchaseToView.id}</span></h2>
                            <button type="button" onClick={handleCloseViewModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><strong>Fornecedor:</strong> <span className="text-brand-gray-600">{purchaseToView.supplier.name}</span></p>
                                <p><strong>Data:</strong> <span className="text-brand-gray-600">{purchaseToView.date}</span></p>
                                <p><strong>Status:</strong> <span className={`font-semibold ${getStatusClass(purchaseToView.status).replace('bg-', 'text-')}`}>{purchaseToView.status}</span></p>
                                <p><strong>NF-e:</strong> <span className="text-brand-gray-600">{purchaseToView.invoiceNumber || 'N/A'}</span></p>
                            </div>
                            
                            {(purchaseToView.fullVendorDetails || purchaseToView.paymentTerms) && (
                                <div className="border-t border-brand-gray-200 pt-4 text-sm space-y-2">
                                    {purchaseToView.fullVendorDetails && (
                                        <div>
                                            <h4 className="font-semibold text-brand-gray-700">Detalhes do Vendedor (da NF-e)</h4>
                                            <p className="text-brand-gray-600">
                                                {`Vendedor: ${purchaseToView.fullVendorDetails.name} - CNPJ: ${purchaseToView.fullVendorDetails.cnpj}`}
                                                <br />
                                                {`Endereço: ${purchaseToView.fullVendorDetails.address}`}
                                            </p>
                                        </div>
                                    )}
                                    {purchaseToView.paymentTerms && (
                                        <div>
                                            <h4 className="font-semibold text-brand-gray-700">Termos de Pagamento (da NF-e)</h4>
                                            <p className="text-brand-gray-600">{purchaseToView.paymentTerms}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                             <div className="border-t border-brand-gray-200 pt-4">
                                <h3 className="text-lg font-semibold text-brand-gray-800 mb-2">Itens</h3>
                                 <div className="border border-brand-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-brand-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-brand-gray-500 uppercase">Produto</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-brand-gray-500 uppercase">Qtd.</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-500 uppercase">Custo Unit.</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-500 uppercase">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-brand-gray-200">
                                            {purchaseToView.items.map(item => (
                                                <tr key={item.productId}>
                                                    <td className="px-4 py-2 text-sm text-brand-gray-700">
                                                        <div>{item.productName}</div>
                                                        {item.ncm && <div className="text-xs text-brand-gray-500">NCM: {item.ncm}</div>}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-brand-gray-700 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-sm text-brand-gray-700 text-right">R$ {item.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-2 text-sm font-semibold text-brand-gray-800 text-right">R$ {(item.unitCost * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        </div>
                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                            <span className="text-xl font-bold text-brand-gray-800">Total: R$ {purchaseToView.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <button type="button" onClick={handleCloseViewModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {purchaseToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-brand-gray-800">Confirmar Exclusão</h2>
                            <p className="text-sm text-brand-gray-600 mt-2">
                                Você tem certeza que deseja excluir o pedido <strong className="text-brand-gray-800">{purchaseToDelete.id}</strong>?
                                <br />
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                            <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg shadow-sm hover:bg-brand-red/90">Confirmar Exclusão</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Compras;
