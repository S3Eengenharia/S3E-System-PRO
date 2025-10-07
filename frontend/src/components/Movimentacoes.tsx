import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type StockMovement, MovementType, type Product, CatalogItemType } from '../types';
import { movementsData, catalogData } from '../data/mockData';

// Icons
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
const ArrowUpTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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

const entryReasons = [
    "Recebimento de Compra",
    "Devolução de Obra",
    "Sobra de Projeto",
    "Ajuste de Inventário",
    "Outro",
];

const exitReasons = [
    "Aplicação em Obra/Projeto",
    "Uso Interno/Consumo",
    "Perda ou Avaria",
    "Ajuste de Inventário",
    "Outro",
];

const getTypeClass = (type: MovementType) => {
    switch (type) {
        case MovementType.Entrada: return 'bg-green-100 text-green-800';
        case MovementType.Saida: return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface MovimentacoesProps {
    toggleSidebar: () => void;
}

const Movimentacoes: React.FC<MovimentacoesProps> = ({ toggleSidebar }) => {
    const [movements, setMovements] = useState<StockMovement[]>(movementsData);
    const [products, setProducts] = useState<Product[]>(catalogData.filter(item => item.type === CatalogItemType.Produto) as Product[]);
    const [filter, setFilter] = useState<MovementType | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
    const [isSaidaModalOpen, setIsSaidaModalOpen] = useState(false);
    
    // Form state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [isProductListOpen, setIsProductListOpen] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [responsible, setResponsible] = useState('Admin');
    const [notes, setNotes] = useState('');
    
    const productDropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
                setIsProductListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const resetForm = () => {
        setSelectedProduct(null);
        setProductSearchTerm('');
        setIsProductListOpen(false);
        setQuantity('');
        setReason('');
        setNotes('');
    };

    const handleOpenEntradaModal = () => {
        resetForm();
        setIsEntradaModalOpen(true);
    };

    const handleOpenSaidaModal = () => {
        resetForm();
        setIsSaidaModalOpen(true);
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setProductSearchTerm(product.name);
        setIsProductListOpen(false);
    };

    const handleConfirmMovement = (type: MovementType) => {
        if (!selectedProduct || !quantity || parseInt(quantity) <= 0 || !reason) {
            alert('Por favor, preencha todos os campos obrigatórios (produto, quantidade e motivo).');
            return;
        }

        const movementQuantity = parseInt(quantity);
        
        if (type === MovementType.Saida && movementQuantity > selectedProduct.stock) {
            alert(`Quantidade de saída excede o estoque disponível (${selectedProduct.stock} unidades).`);
            return;
        }

        const newMovement: StockMovement = {
            id: `MOV-${String(movements.length + 1).padStart(3, '0')}`,
            product: {
                id: selectedProduct.id,
                name: selectedProduct.name,
                sku: selectedProduct.sku,
            },
            quantity: movementQuantity,
            type,
            date: new Date().toLocaleDateString('pt-BR'),
            responsible,
            notes,
            reason,
        };
        
        // Update movements list
        setMovements(prev => [newMovement, ...prev]);

        // Update product stock
        setProducts(prevProducts => prevProducts.map(p => {
            if (p.id === selectedProduct.id) {
                const newStock = type === MovementType.Entrada ? p.stock + movementQuantity : p.stock - movementQuantity;
                return { ...p, stock: newStock };
            }
            return p;
        }));
        
        // Close modal
        if (type === MovementType.Entrada) setIsEntradaModalOpen(false);
        if (type === MovementType.Saida) setIsSaidaModalOpen(false);
    };

    const filteredMovements = useMemo(() => {
        return movements
            .filter(mov => filter === 'Todos' || mov.type === filter)
            .filter(mov =>
                mov.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mov.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mov.responsible.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [movements, filter, searchTerm]);
    
    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()));
    }, [products, productSearchTerm]);


    const renderMovementModal = (type: MovementType) => {
        const isOpen = type === MovementType.Entrada ? isEntradaModalOpen : isSaidaModalOpen;
        const closeModal = () => type === MovementType.Entrada ? setIsEntradaModalOpen(false) : setIsSaidaModalOpen(false);
        const title = type === MovementType.Entrada ? "Registrar Entrada de Material" : "Registrar Saída de Material";
        const buttonText = type === MovementType.Entrada ? "Confirmar Entrada" : "Confirmar Saída";
        const buttonClass = type === MovementType.Entrada ? "bg-brand-green hover:bg-brand-green/90" : "bg-brand-orange hover:bg-brand-orange/90";

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                    <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-brand-gray-800">{title}</h2>
                        <button type="button" onClick={closeModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="relative" ref={productDropdownRef}>
                            <label className="block text-sm font-medium text-brand-gray-700 mb-1">Produto *</label>
                            <input 
                                type="text"
                                placeholder="Busque por nome..."
                                value={productSearchTerm}
                                onChange={e => {
                                    setProductSearchTerm(e.target.value);
                                    setSelectedProduct(null);
                                    setIsProductListOpen(true);
                                }}
                                onFocus={() => setIsProductListOpen(true)}
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                            />
                            {isProductListOpen && filteredProducts.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-brand-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {filteredProducts.map(p => (
                                        <li key={p.id} onClick={() => handleSelectProduct(p)} className="px-3 py-2 cursor-pointer hover:bg-brand-gray-100">
                                            {p.name} <span className="text-xs text-brand-gray-500">(Estoque: {p.stock})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-brand-gray-700 mb-1">Quantidade *</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    min="1"
                                    step="1"
                                />
                             </div>
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-brand-gray-700 mb-1">Motivo da Movimentação *</label>
                                <select
                                    id="reason"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue bg-white"
                                    required
                                >
                                    <option value="" disabled>Selecione um motivo...</option>
                                    {(type === MovementType.Entrada ? entryReasons : exitReasons).map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                             </div>
                         </div>
                         <div>
                            <label htmlFor="responsible" className="block text-sm font-medium text-brand-gray-700 mb-1">Responsável</label>
                            <input
                                id="responsible"
                                type="text"
                                value={responsible}
                                onChange={e => setResponsible(e.target.value)}
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                            />
                         </div>
                         <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-brand-gray-700 mb-1">Notas (Opcional)</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                                placeholder={type === MovementType.Entrada ? "Ex: NF-e 12345, Fornecedor X" : "Ex: Obra Y, Projeto Z"}
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                            />
                         </div>
                    </div>
                    <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                        <button type="button" onClick={() => handleConfirmMovement(type)} className={`px-6 py-2 text-white font-semibold rounded-lg shadow-sm ${buttonClass}`}>
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        )
    };
    

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Movimentações</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Controle de entrada e saída de estoque</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleOpenSaidaModal} className="flex items-center justify-center bg-white border border-brand-orange text-brand-orange font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-orange-50 transition-colors">
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                        Realizar Saída
                    </button>
                    <button onClick={handleOpenEntradaModal} className="flex items-center justify-center bg-brand-green text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-green/90 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Realizar Entrada
                    </button>
                </div>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por produto, SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-gray-600">Tipo:</span>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as MovementType | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todos</option>
                            <option value={MovementType.Entrada}>Entrada</option>
                            <option value={MovementType.Saida}>Saída</option>
                        </select>
                    </div>
                </div>

                {/* Movements Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-gray-200">
                        <thead className="bg-brand-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Produto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Quantidade</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Motivo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Responsável</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-gray-200">
                            {filteredMovements.map((mov) => (
                                <tr key={mov.id} className="hover:bg-brand-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-900">
                                        <div className="font-semibold">{mov.product.name}</div>
                                        <div className="text-xs text-brand-gray-500">SKU: {mov.product.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClass(mov.type)}`}>
                                            {mov.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-gray-800">{mov.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{mov.reason || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{mov.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{mov.responsible}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isEntradaModalOpen && renderMovementModal(MovementType.Entrada)}
            {isSaidaModalOpen && renderMovementModal(MovementType.Saida)}
        </div>
    );
};

export default Movimentacoes;