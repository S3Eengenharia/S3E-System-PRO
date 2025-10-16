import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type PurchaseOrder, type Supplier, PurchaseStatus, type PurchaseOrderItem, type Product, CatalogItemType } from '../types';
import { purchasesData, catalogData, suppliersData } from '../data/mockData';
import { parseNFeXML, readFileAsText } from '../utils/xmlParser';

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
    
    // Novos campos do fornecedor
    const [supplierName, setSupplierName] = useState('');
    const [supplierCNPJ, setSupplierCNPJ] = useState('');
    const [supplierPhone, setSupplierPhone] = useState('');
    const [nfEmissionDate, setNfEmissionDate] = useState(new Date().toISOString().split('T')[0]);
    const [receivedDate, setReceivedDate] = useState('');
    
    // Novos campos para item
    const [itemName, setItemName] = useState('');
    const [itemNCM, setItemNCM] = useState('');
    const [itemQuantity, setItemQuantity] = useState<number>(1);
    const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);
    
    // Despesas adicionais
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [otherExpenses, setOtherExpenses] = useState<number>(0);
    
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
        setSupplierName('');
        setSupplierCNPJ('');
        setSupplierPhone('');
        setNfEmissionDate(new Date().toISOString().split('T')[0]);
        setReceivedDate('');
        setItemName('');
        setItemNCM('');
        setItemQuantity(1);
        setItemUnitPrice(0);
        setShippingCost(0);
        setOtherExpenses(0);
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
        if (!itemName.trim()) {
            alert('Por favor, informe o nome do item.');
            return;
        }

        if (itemQuantity <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }

        if (itemUnitPrice < 0) {
            alert('O valor unitário não pode ser negativo.');
            return;
        }

            const newItem: PurchaseOrderItem = {
            productId: `ITEM-${Date.now()}`,
            productName: itemName,
            quantity: itemQuantity,
            unitCost: itemUnitPrice,
            ncm: itemNCM || undefined
        };
        
            setPurchaseItems(prev => [...prev, newItem]);
        
        // Limpar campos
        setItemName('');
        setItemNCM('');
        setItemQuantity(1);
        setItemUnitPrice(0);
    };

    const handleRemoveItem = (productId: string) => {
        setPurchaseItems(prev => prev.filter(item => item.productId !== productId));
    };

    const subtotalPurchase = useMemo(() => {
        return purchaseItems.reduce((total, item) => total + item.quantity * item.unitCost, 0);
    }, [purchaseItems]);

    const purchaseTotal = useMemo(() => {
        return subtotalPurchase + shippingCost + otherExpenses;
    }, [subtotalPurchase, shippingCost, otherExpenses]);

    const handleSavePurchase = () => {
        if (!supplierName.trim() || !supplierCNPJ.trim()) {
            alert('Por favor, preencha o nome e CNPJ do fornecedor.');
            return;
        }
        
        if (purchaseItems.length === 0) {
            alert('Adicione pelo menos um item à compra.');
            return;
        }

        // Criar objeto supplier com os dados manuais
        const supplier = {
            id: `SUP-${Date.now()}`,
            name: supplierName
        };

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
        const vendorDetails = xmlData ? xmlData.vendor : {
            name: supplierName,
            cnpj: supplierCNPJ,
            address: supplierPhone ? `Telefone: ${supplierPhone}` : ''
        };
        
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
    
    const handleXmlImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const xmlContent = await readFileAsText(file);
            const parsedData = parseNFeXML(xmlContent);

            if (!parsedData) {
                alert('Erro ao processar XML. Verifique se o arquivo é uma NF-e válida.');
                return;
            }

            // Preencher dados do fornecedor
            setSupplierName(parsedData.fornecedor.nome);
            setSupplierCNPJ(parsedData.fornecedor.cnpj);
            setSupplierPhone(parsedData.fornecedor.telefone || '');

            // Preencher dados da nota
            setInvoiceNumber(parsedData.notaFiscal.numero);
            setNfEmissionDate(parsedData.notaFiscal.dataEmissao.split('/').reverse().join('-')); // Converter para formato YYYY-MM-DD
            setPurchaseDate(new Date().toISOString().split('T')[0]);

            // Preencher itens
            const items: PurchaseOrderItem[] = parsedData.items.map(item => ({
                productId: `ITEM-${Date.now()}-${Math.random()}`,
                productName: item.nomeProduto,
                quantity: item.quantidade,
                unitCost: item.valorUnit,
                ncm: item.ncm
            }));
            setPurchaseItems(items);

            // Preencher despesas
            setShippingCost(parsedData.totais.valorFrete);
            setOtherExpenses(parsedData.totais.outrasDespesas);

            alert('XML importado com sucesso! Verifique os dados e complete o cadastro.');
        } catch (error) {
            console.error("Erro ao processar XML:", error);
            alert("Ocorreu um erro ao ler o arquivo XML. Verifique se o arquivo é uma NF-e válida.");
        }

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
                 <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col border border-gray-200/50 animate-in zoom-in-95 duration-300">
                        {/* Header com Gradiente */}
                        <div className="p-6 rounded-t-2xl bg-gradient-to-r from-orange-600 to-orange-700 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{purchaseToEdit ? 'Editar Compra' : 'Registrar Nova Compra'}</h2>
                                    <p className="text-sm text-white/80">Gerenciamento de pedidos de compra</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCloseModal} className="p-2 rounded-xl text-white/90 hover:bg-white/20 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                            {/* Botão de Importar XML */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Importação Rápida
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">Importe dados diretamente do XML da Nota Fiscal</p>
                                    </div>
                                <input type="file" ref={xmlFileInputRef} onChange={handleXmlImport} accept=".xml" className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => xmlFileInputRef.current?.click()}
                                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg transition-colors"
                                >
                                    <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                                        Importar XML
                                </button>
                                </div>
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

                            {/* Informações do Fornecedor */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Dados do Fornecedor
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-2">
                                        <label htmlFor="supplierName" className="block text-sm font-semibold text-gray-700 mb-2">Nome do Fornecedor *</label>
                                        <input 
                                            type="text" 
                                            id="supplierName" 
                                            value={supplierName} 
                                            onChange={e => setSupplierName(e.target.value)} 
                                            placeholder="Nome completo da empresa"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                            required 
                                        />
                                    </div>
                                <div>
                                        <label htmlFor="supplierCNPJ" className="block text-sm font-semibold text-gray-700 mb-2">CNPJ *</label>
                                        <input 
                                            type="text" 
                                            id="supplierCNPJ" 
                                            value={supplierCNPJ} 
                                            onChange={e => setSupplierCNPJ(e.target.value)} 
                                            placeholder="00.000.000/0000-00"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                            required 
                                        />
                                </div>
                                <div>
                                        <label htmlFor="supplierPhone" className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                                        <input 
                                            type="tel" 
                                            id="supplierPhone" 
                                            value={supplierPhone} 
                                            onChange={e => setSupplierPhone(e.target.value)} 
                                            placeholder="(00) 00000-0000"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        />
                                </div>
                                </div>
                            </div>

                            {/* Informações da Compra */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Informações da Nota Fiscal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 <div>
                                        <label htmlFor="invoice" className="block text-sm font-semibold text-gray-700 mb-2">Nº Nota Fiscal *</label>
                                        <input 
                                            type="text" 
                                            id="invoice" 
                                            value={invoiceNumber} 
                                            onChange={e => setInvoiceNumber(e.target.value)} 
                                            placeholder="Ex: NF-000123"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="nfEmissionDate" className="block text-sm font-semibold text-gray-700 mb-2">Data de Emissão NF *</label>
                                        <input 
                                            type="date" 
                                            id="nfEmissionDate" 
                                            value={nfEmissionDate} 
                                            onChange={e => setNfEmissionDate(e.target.value)} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="receivedDate" className="block text-sm font-semibold text-gray-700 mb-2">Data de Recebimento</label>
                                        <input 
                                            type="date" 
                                            id="receivedDate" 
                                            value={receivedDate} 
                                            onChange={e => setReceivedDate(e.target.value)} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="purchaseDate" className="block text-sm font-semibold text-gray-700 mb-2">Data da Compra *</label>
                                        <input 
                                            type="date" 
                                            id="purchaseDate" 
                                            value={purchaseDate} 
                                            onChange={e => setPurchaseDate(e.target.value)} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
                                            required 
                                        />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                                        <select 
                                            id="status" 
                                            value={status} 
                                            onChange={e => setStatus(e.target.value as PurchaseStatus)} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
                                            required
                                        >
                                        {Object.values(PurchaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-xl p-5 border border-orange-200/50 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Itens da Compra
                                </h3>
                                {!xmlData && (
                                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-orange-300">
                                        <label className="text-sm font-semibold text-gray-700 mb-3 block">Adicionar Item da Nota Fiscal</label>
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                                            <div className="lg:col-span-4">
                                                <label className="text-xs font-medium text-gray-600">Nome do Item *</label>
                                                <input 
                                                    type="text" 
                                                    value={itemName} 
                                                    onChange={e => setItemName(e.target.value)} 
                                                    placeholder="Ex: Cabo de cobre 10mm²"
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                        </div>
                                        <div className="lg:col-span-2">
                                                <label className="text-xs font-medium text-gray-600">NCM</label>
                                                <input 
                                                    type="text" 
                                                    value={itemNCM} 
                                                    onChange={e => setItemNCM(e.target.value)} 
                                                    placeholder="00000000"
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                        </div>
                                            <div className="lg:col-span-2">
                                                <label className="text-xs font-medium text-gray-600">Quantidade *</label>
                                                <input 
                                                    type="number" 
                                                    value={itemQuantity} 
                                                    onChange={e => setItemQuantity(parseFloat(e.target.value) || 1)} 
                                                    min="0.01" 
                                                    step="0.01"
                                                    placeholder="1"
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                        </div>
                                        <div className="lg:col-span-2">
                                                <label className="text-xs font-medium text-gray-600">Valor Unit. (R$) *</label>
                                                <input 
                                                    type="number" 
                                                    value={itemUnitPrice} 
                                                    onChange={e => setItemUnitPrice(parseFloat(e.target.value) || 0)} 
                                                    min="0" 
                                                    step="0.01" 
                                                    placeholder="0.00"
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="lg:col-span-2">
                                                <label className="text-xs font-medium text-gray-600">Valor Total</label>
                                                <div className="mt-1 px-3 py-2 bg-green-50 border-2 border-green-300 rounded-lg font-bold text-green-700 text-center">
                                                    R$ {(itemQuantity * itemUnitPrice).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <button type="button" onClick={handleAddItem} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2">
                                                <PlusIcon className="w-5 h-5" />
                                                Adicionar Item
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Lista de Itens Adicionados */}
                                {purchaseItems.length > 0 ? (
                                    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <table className="min-w-full">
                                            <thead className="bg-gradient-to-r from-orange-100 to-amber-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Item</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NCM</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantidade</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Unit.</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Total</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {purchaseItems.map((item, index) => (
                                                    <tr key={item.productId} className="hover:bg-orange-50/30 transition-colors group">
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="font-medium text-gray-900">{item.productName}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.ncm || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 text-right">R$ {item.unitCost.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">R$ {(item.quantity * item.unitCost).toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            {!xmlData && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemoveItem(item.productId)} 
                                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Remover"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">Nenhum item adicionado</p>
                                        <p className="text-sm text-gray-400 mt-1">Preencha os campos acima para adicionar itens</p>
                                    </div>
                                )}
                            </div>

                            {/* Despesas Adicionais */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Despesas Adicionais
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                                        <label htmlFor="shippingCost" className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            Valor do Frete (R$)
                                        </label>
                                        <input 
                                            type="number" 
                                            id="shippingCost"
                                            value={shippingCost}
                                            onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-lg"
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border-2 border-pink-300">
                                        <label htmlFor="otherExpenses" className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Outras Despesas (R$)
                                        </label>
                                        <input 
                                            type="number" 
                                            id="otherExpenses"
                                            value={otherExpenses}
                                            onChange={e => setOtherExpenses(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-semibold text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Fixo */}
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0 rounded-b-2xl">
                            {/* Resumo de Valores em uma linha */}
                            <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-4 border-2 border-gray-200">
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Subtotal</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            R$ {subtotalPurchase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <span className="text-2xl text-gray-300">+</span>
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Frete</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            R$ {shippingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <span className="text-2xl text-gray-300">+</span>
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Outras</p>
                                        <p className="text-lg font-bold text-pink-600">
                                            R$ {otherExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <span className="text-2xl text-gray-300">=</span>
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg px-6 py-3">
                                        <p className="text-xs font-semibold text-white/90 mb-1">TOTAL</p>
                                        <p className="text-2xl font-bold text-white">
                                            R$ {purchaseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="button" onClick={handleSavePurchase} className="px-8 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={purchaseItems.length === 0 || !supplierName.trim() || !supplierCNPJ.trim()}>
                                    {purchaseToEdit ? 'Salvar Alterações' : 'Salvar Compra'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Purchase Modal */}
            {purchaseToView && (
                <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-gray-200/50 animate-in zoom-in-95 duration-300">
                        {/* Header com Gradiente */}
                        <div className="p-6 rounded-t-2xl bg-gradient-to-r from-orange-600 to-orange-700 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                        </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Detalhes da Compra</h2>
                                    <p className="text-sm text-white/80">ID: {purchaseToView.id}</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCloseViewModal} className="p-2 rounded-xl text-white/90 hover:bg-white/20 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                            </div>
                            
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Grid de Informações Principais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                    <p className="text-xs font-medium text-gray-600 mb-1">Fornecedor</p>
                                    <p className="text-lg font-bold text-gray-900">{purchaseToView.supplier.name}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <p className="text-xs font-medium text-gray-600 mb-1">Data da Compra</p>
                                    <p className="text-lg font-bold text-gray-900">{purchaseToView.date}</p>
                                </div>
                                <div className={`rounded-xl p-4 border ${getStatusClass(purchaseToView.status)}`}>
                                    <p className="text-xs font-medium mb-1 opacity-80">Status</p>
                                    <p className="text-lg font-bold">{purchaseToView.status}</p>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                    <p className="text-xs font-medium text-gray-600 mb-1">Nota Fiscal</p>
                                    <p className="text-lg font-bold text-gray-900">{purchaseToView.invoiceNumber || 'N/A'}</p>
                                </div>
                            </div>
                            
                            {/* Detalhes Adicionais */}
                            {(purchaseToView.fullVendorDetails || purchaseToView.paymentTerms) && (
                                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-200 space-y-4">
                                    {purchaseToView.fullVendorDetails && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                Detalhes do Vendedor (da NF-e)
                                            </h4>
                                            <div className="bg-white p-3 rounded-lg space-y-1 text-sm">
                                                <p className="text-gray-700"><strong>Nome:</strong> {purchaseToView.fullVendorDetails.name}</p>
                                                <p className="text-gray-700"><strong>CNPJ:</strong> {purchaseToView.fullVendorDetails.cnpj}</p>
                                                <p className="text-gray-700"><strong>Endereço:</strong> {purchaseToView.fullVendorDetails.address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {purchaseToView.paymentTerms && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                Termos de Pagamento (da NF-e)
                                            </h4>
                                            <div className="bg-white p-3 rounded-lg">
                                                <p className="text-gray-700 text-sm">{purchaseToView.paymentTerms}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Itens da Compra */}
                            <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-xl p-5 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Itens da Compra ({purchaseToView.items.length})
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="min-w-full">
                                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Produto</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Qtd.</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Custo Unit.</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {purchaseToView.items.map((item, index) => (
                                                <tr key={item.productId} className="hover:bg-orange-50/30 transition-colors">
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="font-medium text-gray-900">{item.productName}</div>
                                                        {item.ncm && <div className="text-xs text-gray-500 mt-0.5">NCM: {item.ncm}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-right">R$ {item.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">R$ {(item.unitCost * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        </div>
                        
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-between items-center flex-shrink-0 rounded-b-2xl">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Valor Total</p>
                                    <p className="text-2xl font-bold text-green-600">R$ {purchaseToView.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCloseViewModal} className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg">
                                Fechar
                            </button>
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
