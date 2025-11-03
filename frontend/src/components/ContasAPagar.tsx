import React, { useState, useEffect, useMemo } from 'react';
import { financeiroService } from '../services/financeiroService';

// ==================== ICONS ====================
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
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

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.268-.268-1.268-.732 0-.464.543-.732 1.268-.732.725 0 1.268.268 1.268.732" />
    </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);

const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
);

// ==================== TYPES ====================
interface ContaPagar {
    id: string;
    compraId?: string;
    fornecedorId?: string;
    fornecedorNome: string;
    numeroParcela: number;
    descricao: string;
    dataVencimento: string;
    valor: number;
    valorPago?: number;
    dataPagamento?: string;
    status: 'Pendente' | 'Pago' | 'Atrasado';
    observacoes?: string;
}

interface ContasAPagarProps {
    toggleSidebar?: () => void;
    setAbaAtiva?: (aba: string) => void;
}

// ==================== COMPONENT ====================
const ContasAPagar: React.FC<ContasAPagarProps> = ({ toggleSidebar, setAbaAtiva }) => {
    // Estados
    const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('Todos');
    const [filterPeriodo, setFilterPeriodo] = useState<string>('Todos');
    
    // Modal de Pagamento
    const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
    const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | null>(null);
    const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
    const [valorPago, setValorPago] = useState('0');
    const [observacoesPagamento, setObservacoesPagamento] = useState('');

    // Carregar dados
    useEffect(() => {
        loadContasPagar();
    }, []);

    const loadContasPagar = async () => {
        setLoading(true);
        try {
            console.log('📤 Carregando contas a pagar do backend...');
            const response = await financeiroService.listarContasPagar();
            
            if (response.success && response.data) {
                // Processar e enriquecer dados
                const contasProcessadas = response.data.map((conta: any) => {
                    // Detectar atraso
                    const isAtrasada = new Date(conta.dataVencimento) < new Date() && conta.status === 'Pendente';
                    
                    return {
                        id: conta.id,
                        compraId: conta.compraId,
                        fornecedorId: conta.fornecedorId,
                        fornecedorNome: conta.fornecedorNome || conta.fornecedor?.nome || 'Fornecedor não informado',
                        numeroParcela: conta.numeroParcela || 1,
                        descricao: conta.descricao || `Parcela ${conta.numeroParcela || 1}`,
                        dataVencimento: conta.dataVencimento,
                        valor: conta.valorParcela || conta.valor || 0,
                        valorPago: conta.valorPago,
                        dataPagamento: conta.dataPagamento,
                        status: isAtrasada ? 'Atrasado' : conta.status,
                        observacoes: conta.observacoes
                    };
                });
                
                setContasPagar(contasProcessadas);
                console.log(`✅ ${contasProcessadas.length} contas a pagar carregadas`);
            } else {
                console.warn('⚠️ Erro ao carregar contas:', response.error);
                setContasPagar([]);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar contas a pagar:', error);
            setContasPagar([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar contas
    const contasFiltradas = useMemo(() => {
        let filtered = [...contasPagar];

        // Filtro por status
        if (filterStatus !== 'Todos') {
            filtered = filtered.filter(conta => conta.status === filterStatus);
        }

        // Filtro por período
        if (filterPeriodo !== 'Todos') {
            const hoje = new Date();
            filtered = filtered.filter(conta => {
                const vencimento = new Date(conta.dataVencimento);
                if (filterPeriodo === 'Vencidas') {
                    return vencimento < hoje && conta.status !== 'Pago';
                } else if (filterPeriodo === 'Próximo30Dias') {
                    const proximos30 = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return vencimento >= hoje && vencimento <= proximos30;
                }
                return true;
            });
        }

        // Filtro por busca
        if (searchTerm) {
            filtered = filtered.filter(conta =>
                conta.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conta.descricao.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [contasPagar, filterStatus, filterPeriodo, searchTerm]);

    // Estatísticas
    const estatisticas = useMemo(() => {
        const totalPagar = contasFiltradas
            .filter(c => c.status === 'Pendente' || c.status === 'Atrasado')
            .reduce((sum, c) => sum + c.valor, 0);
        
        const totalPago = contasPagar
            .filter(c => c.status === 'Pago')
            .reduce((sum, c) => sum + (c.valorPago || c.valor || 0), 0);
        
        const totalAtrasado = contasFiltradas
            .filter(c => c.status === 'Atrasado')
            .reduce((sum, c) => sum + c.valor, 0);
        
        const qtdPendente = contasFiltradas.filter(c => c.status === 'Pendente').length;
        const qtdAtrasado = contasFiltradas.filter(c => c.status === 'Atrasado').length;

        return {
            totalPagar,
            totalPago,
            totalAtrasado,
            qtdPendente,
            qtdAtrasado
        };
    }, [contasPagar, contasFiltradas]);

    // Handlers
    const handleOpenPagamentoModal = (conta: ContaPagar) => {
        setContaSelecionada(conta);
        setValorPago(conta.valor.toString());
        setDataPagamento(new Date().toISOString().split('T')[0]);
        setObservacoesPagamento('');
        setIsPagamentoModalOpen(true);
    };

    const handleClosePagamentoModal = () => {
        setIsPagamentoModalOpen(false);
        setContaSelecionada(null);
        setValorPago('0');
        setObservacoesPagamento('');
    };

    const handlePagarConta = async () => {
        if (!contaSelecionada) return;

        if (!confirm(`Confirmar o pagamento de R$ ${parseFloat(valorPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}?`)) {
            return;
        }

        try {
            console.log('💳 Registrando pagamento...');
            const response = await financeiroService.pagarContaPagar(contaSelecionada.id, {
                dataPagamento,
                valorPago: parseFloat(valorPago),
                observacoes: observacoesPagamento
            });

            if (response.success) {
                alert('✅ Pagamento registrado com sucesso!');
                handleClosePagamentoModal();
                // Recarregar lista
                await loadContasPagar();
            } else {
                alert(`❌ ${response.error || 'Erro ao registrar pagamento'}`);
            }
        } catch (error) {
            console.error('❌ Erro ao pagar conta:', error);
            alert('❌ Erro ao registrar pagamento');
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Pago':
                return 'bg-green-100 text-green-800 ring-1 ring-green-200';
            case 'Pendente':
                return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
            case 'Atrasado':
                return 'bg-red-100 text-red-800 ring-1 ring-red-200';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
        }
    };

    const isVencida = (dataVencimento: string, status: string) => {
        if (status === 'Pago') return false;
        return new Date(dataVencimento) < new Date();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando contas a pagar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    {toggleSidebar && (
                        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-soft">
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Contas a Pagar</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gestão de pagamentos e fornecedores</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {setAbaAtiva && (
                        <button
                            onClick={() => setAbaAtiva('dashboard')}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Voltar ao Dashboard
                        </button>
                    )}
                    <button
                        onClick={loadContasPagar}
                        className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-semibold"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Atualizar
                    </button>
                </div>
            </header>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">A Pagar</p>
                            <p className="text-2xl font-bold text-red-600">
                                R$ {estatisticas.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{estatisticas.qtdPendente} pendente(s)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pago</p>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {estatisticas.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Atrasado</p>
                            <p className="text-2xl font-bold text-orange-600">
                                R$ {estatisticas.totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{estatisticas.qtdAtrasado} conta(s)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total de Contas</p>
                            <p className="text-2xl font-bold text-purple-600">{contasFiltradas.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por fornecedor ou descrição..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500"
                        >
                            <option value="Todos">Todos os Status</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                            <option value="Atrasado">Atrasado</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterPeriodo}
                            onChange={(e) => setFilterPeriodo(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500"
                        >
                            <option value="Todos">Todos os Períodos</option>
                            <option value="Vencidas">Vencidas</option>
                            <option value="Próximo30Dias">Próximos 30 Dias</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabela de Contas */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Parcela / Compra
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Fornecedor / Descrição
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Vencimento
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {contasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">Nenhuma conta encontrada</p>
                                            <p className="text-sm text-gray-400 mt-1">Ajuste os filtros ou aguarde novas compras</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                contasFiltradas.map((conta) => (
                                    <tr key={conta.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">Parcela {conta.numeroParcela}</p>
                                                {conta.compraId && (
                                                    <p className="text-xs text-blue-600 mt-1">Compra: {conta.compraId.slice(0, 8)}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{conta.fornecedorNome}</p>
                                                <p className="text-sm text-gray-600">{conta.descricao}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div>
                                                <p className={`text-sm font-medium ${isVencida(conta.dataVencimento, conta.status) ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                                                </p>
                                                {conta.dataPagamento && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Pago: {new Date(conta.dataPagamento).toLocaleDateString('pt-BR')}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            {conta.valorPago && conta.valorPago !== conta.valor && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Pago: R$ {conta.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusClass(conta.status)}`}>
                                                {conta.status === 'Pago' && '✅ '}
                                                {conta.status === 'Pendente' && '⏳ '}
                                                {conta.status === 'Atrasado' && '⚠️ '}
                                                {conta.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {conta.status !== 'Pago' && (
                                                    <button
                                                        onClick={() => handleOpenPagamentoModal(conta)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        Pagar
                                                    </button>
                                                )}
                                                {conta.compraId && (
                                                    <button
                                                        onClick={() => alert(`Visualizar compra ${conta.compraId}`)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                                                        title="Visualizar Compra"
                                                    >
                                                        <ShoppingCartIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Pagamento */}
            {isPagamentoModalOpen && contaSelecionada && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Registrar Pagamento</h2>
                                <p className="text-sm text-gray-600 mt-1">Dar baixa na conta a pagar</p>
                            </div>
                            <button
                                onClick={handleClosePagamentoModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Informações da Conta */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <h3 className="font-semibold text-blue-900 mb-3">Informações da Conta</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-700 font-medium">Fornecedor:</span>
                                        <p className="text-blue-900 font-semibold">{contaSelecionada.fornecedorNome}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Descrição:</span>
                                        <p className="text-blue-900">{contaSelecionada.descricao}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Vencimento:</span>
                                        <p className="text-blue-900">{new Date(contaSelecionada.dataVencimento).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Valor Original:</span>
                                        <p className="text-blue-900 font-bold">
                                            R$ {contaSelecionada.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Formulário */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Data do Pagamento *
                                    </label>
                                    <input
                                        type="date"
                                        value={dataPagamento}
                                        onChange={(e) => setDataPagamento(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Valor Pago (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        value={valorPago}
                                        onChange={(e) => setValorPago(e.target.value)}
                                        min="0"
                                        max={contaSelecionada.valor}
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Valor original: R$ {contaSelecionada.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Observações
                                    </label>
                                    <textarea
                                        value={observacoesPagamento}
                                        onChange={(e) => setObservacoesPagamento(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Informações adicionais sobre o pagamento..."
                                    />
                                </div>
                            </div>

                            {/* Resumo */}
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-red-700">Valor a Registrar:</span>
                                    <span className="text-2xl font-bold text-red-700">
                                        R$ {parseFloat(valorPago || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={handleClosePagamentoModal}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePagarConta}
                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-medium font-semibold flex items-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Confirmar Pagamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContasAPagar;

