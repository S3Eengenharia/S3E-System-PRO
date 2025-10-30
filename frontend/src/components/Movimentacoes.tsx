import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type StockMovement, MovementType, type MaterialItem } from '../types';
import { movimentacoesService, type Movimentacao } from '../services/movimentacoesService';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';

// ==================== ICONS ====================
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
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
        case MovementType.Entrada: return 'bg-green-100 text-green-800 ring-1 ring-green-200';
        case MovementType.Saida: return 'bg-orange-100 text-orange-800 ring-1 ring-orange-200';
        default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
    }
};

const getTypeIcon = (type: MovementType) => {
    switch (type) {
        case MovementType.Entrada: return '📥';
        case MovementType.Saida: return '📤';
        default: return '📦';
    }
};

interface MovimentacoesProps {
    toggleSidebar: () => void;
}

const Movimentacoes: React.FC<MovimentacoesProps> = ({ toggleSidebar }) => {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<MovementType | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    
    const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
    const [isSaidaModalOpen, setIsSaidaModalOpen] = useState(false);
    
    // Form state
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [isMaterialListOpen, setIsMaterialListOpen] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [responsible, setResponsible] = useState('Admin');
    const [notes, setNotes] = useState('');
    
    const materialDropdownRef = useRef<HTMLDivElement>(null);

    // Carregar dados da API
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Carregar movimentações
            const movimentacoesResponse = await movimentacoesService.listar();
            
            if (movimentacoesResponse.success && movimentacoesResponse.data) {
                // Converter movimentações da API para o formato do componente
                const movimentacoesFormatadas: StockMovement[] = Array.isArray(movimentacoesResponse.data)
                    ? movimentacoesResponse.data.map((mov: Movimentacao) => ({
                        id: mov.id,
                        materialId: mov.materialId,
                        materialName: mov.material?.nome || 'Material não encontrado',
                        type: mov.tipo === 'ENTRADA' ? MovementType.Entrada : MovementType.Saida,
                        quantity: mov.quantidade,
                        reason: mov.motivo,
                        responsible: 'Sistema', // TODO: adicionar responsável quando disponível na API
                        date: mov.createdAt || mov.data,
                        notes: mov.observacoes
                    }))
                    : [];
                
                setMovements(movimentacoesFormatadas);
            } else {
                console.warn('Nenhuma movimentação encontrada ou erro na resposta:', movimentacoesResponse);
                setMovements([]);
            }
            
            // Carregar materiais
            const materiaisResponse = await axiosApiService.get<MaterialItem[]>(ENDPOINTS.MATERIAIS);
            
            if (materiaisResponse.success && materiaisResponse.data) {
                const materiaisData = Array.isArray(materiaisResponse.data) ? materiaisResponse.data : [];
                setMaterials(materiaisData);
            } else {
                console.warn('Nenhum material encontrado ou erro na resposta:', materiaisResponse);
                setMaterials([]);
            }
        } catch (err) {
            setError('Erro ao carregar movimentações');
            console.error('Erro ao carregar movimentações:', err);
            setMovements([]);
            setMaterials([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtros
    const filteredMovements = useMemo(() => {
        let filtered = movements;

        // Filtro por tipo
        if (filter !== 'Todos') {
            filtered = filtered.filter(movement => movement.type === filter);
        }

        // Filtro por busca
        if (searchTerm) {
            filtered = filtered.filter(movement =>
                movement.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movement.responsible.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por data
        if (dateFilter) {
            filtered = filtered.filter(movement =>
                movement.date.startsWith(dateFilter)
            );
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [movements, filter, searchTerm, dateFilter]);

    // Estatísticas
    const stats = useMemo(() => {
        const totalMovimentos = movements.length;
        const entradas = movements.filter(m => m.type === MovementType.Entrada).length;
        const saidas = movements.filter(m => m.type === MovementType.Saida).length;
        const movimentosHoje = movements.filter(m => {
            const hoje = new Date().toISOString().split('T')[0];
            return m.date.startsWith(hoje);
        }).length;

        return { totalMovimentos, entradas, saidas, movimentosHoje };
    }, [movements]);

    // Filtrar materiais para seleção
    const filteredMaterials = useMemo(() => {
        return materials.filter(material =>
            material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
            material.sku.toLowerCase().includes(materialSearchTerm.toLowerCase())
        );
    }, [materials, materialSearchTerm]);

    // Handlers
    const resetForm = () => {
        setSelectedMaterial(null);
        setMaterialSearchTerm('');
        setQuantity('');
        setReason('');
        setNotes('');
        setIsMaterialListOpen(false);
    };

    const handleSubmitMovement = async (type: MovementType) => {
        if (!selectedMaterial || !quantity || !reason) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            const quantidadeNum = parseFloat(quantity);
            if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
                alert('Quantidade inválida');
                return;
            }

            const movimentacaoData = {
                materialId: selectedMaterial.id,
                tipo: type === MovementType.Entrada ? 'ENTRADA' : 'SAIDA' as 'ENTRADA' | 'SAIDA',
                quantidade: quantidadeNum,
                motivo: reason,
                observacoes: notes || undefined
            };

            const response = await movimentacoesService.criar(movimentacaoData);
            
            if (response.success && response.data) {
                alert(`✅ ${type === MovementType.Entrada ? 'Entrada' : 'Saída'} registrada com sucesso!`);
                resetForm();
                setIsEntradaModalOpen(false);
                setIsSaidaModalOpen(false);
                await loadData();
            } else {
                alert(`❌ Erro ao registrar movimentação: ${response.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao registrar movimentação:', error);
            alert('❌ Erro ao registrar movimentação. Verifique o console para mais detalhes.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando movimentações...</p>
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
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Movimentações</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Controle de entradas e saídas de estoque</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEntradaModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Entrada
                    </button>
                    <button
                        onClick={() => setIsSaidaModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-medium font-semibold"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        Saída
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                            <ClockIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total de Movimentos</p>
                            <p className="text-2xl font-bold text-indigo-600">{stats.totalMovimentos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <ArrowDownTrayIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Entradas</p>
                            <p className="text-2xl font-bold text-green-600">{stats.entradas}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <ArrowUpTrayIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Saídas</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.saidas}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl">📅</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Hoje</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.movimentosHoje}</p>
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
                                placeholder="Buscar por material, motivo ou responsável..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as MovementType | 'Todos')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Todos">Todos os Tipos</option>
                            <option value={MovementType.Entrada}>Entradas</option>
                            <option value={MovementType.Saida}>Saídas</option>
                        </select>
                    </div>

                    <div>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Exibindo <span className="font-bold text-gray-900">{filteredMovements.length}</span> de <span className="font-bold text-gray-900">{movements.length}</span> movimentações
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Entradas: {stats.entradas}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Saídas: {stats.saidas}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Movimentações */}
            {filteredMovements.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📦</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || filter !== 'Todos' || dateFilter
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece registrando sua primeira movimentação'}
                    </p>
                    {!searchTerm && filter === 'Todos' && !dateFilter && (
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setIsEntradaModalOpen(true)}
                                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5 inline mr-2" />
                                Primeira Entrada
                            </button>
                            <button
                                onClick={() => setIsSaidaModalOpen(true)}
                                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-medium font-semibold"
                            >
                                <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
                                Primeira Saída
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMovements.map((movement) => (
                        <div key={movement.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-indigo-300 transition-all duration-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">{movement.materialName}</h3>
                                        <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getTypeClass(movement.type)}`}>
                                            {getTypeIcon(movement.type)} {movement.type === MovementType.Entrada ? 'Entrada' : 'Saída'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span>📦</span>
                                            <span><strong>Quantidade:</strong> {movement.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>📝</span>
                                            <span><strong>Motivo:</strong> {movement.reason}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4" />
                                            <span><strong>Por:</strong> {movement.responsible}</span>
                                        </div>
                                    </div>
                                    {movement.notes && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium">Observações:</span> {movement.notes}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-indigo-700">
                                        {new Date(movement.date).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(movement.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE ENTRADA */}
            {isEntradaModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        {/* Header */}
                        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-medium ring-2 ring-green-100">
                                    <ArrowDownTrayIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">Registrar Entrada</h2>
                                    <p className="text-sm text-gray-600 mt-1">Adicione materiais ao estoque</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsEntradaModalOpen(false); resetForm(); }}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                <p className="text-blue-800 font-medium">
                                    🚧 Modal simplificado para demonstração. 
                                    A implementação completa incluirá seleção de materiais e validações.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => { setIsEntradaModalOpen(false); resetForm(); }}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleSubmitMovement(MovementType.Entrada)}
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold"
                                >
                                    Registrar Entrada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE SAÍDA */}
            {isSaidaModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        {/* Header */}
                        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-medium ring-2 ring-orange-100">
                                    <ArrowUpTrayIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">Registrar Saída</h2>
                                    <p className="text-sm text-gray-600 mt-1">Remova materiais do estoque</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsSaidaModalOpen(false); resetForm(); }}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                <p className="text-blue-800 font-medium">
                                    🚧 Modal simplificado para demonstração. 
                                    A implementação completa incluirá seleção de materiais e validações.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => { setIsSaidaModalOpen(false); resetForm(); }}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleSubmitMovement(MovementType.Saida)}
                                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-medium font-semibold"
                                >
                                    Registrar Saída
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movimentacoes;