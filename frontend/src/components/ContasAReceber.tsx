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

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// ==================== TYPES ====================
interface ContaReceber {
    id: string;
    vendaId: string;
    numeroParcela: number;
    numeroDuplicata: string;
    clienteNome: string;
    projetoTitulo: string;
    dataVencimento: string;
    valor: number;
    valorRecebido?: number;
    dataPagamento?: string;
    status: 'Pendente' | 'Recebido' | 'Atrasado';
    observacoes?: string;
}

interface ContasAReceberProps {
    toggleSidebar?: () => void;
    setAbaAtiva?: (aba: string) => void;
}

// ==================== COMPONENT ====================
const ContasAReceber: React.FC<ContasAReceberProps> = ({ toggleSidebar, setAbaAtiva }) => {
    // Estados
    const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('Todos');
    const [filterPeriodo, setFilterPeriodo] = useState<string>('Todos');
    
    // Modal de Baixa
    const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
    const [contaSelecionada, setContaSelecionada] = useState<ContaReceber | null>(null);
    const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
    const [valorRecebido, setValorRecebido] = useState('0');
    const [observacoesBaixa, setObservacoesBaixa] = useState('');

    // Carregar dados
    useEffect(() => {
        loadContasReceber();
    }, []);

    const loadContasReceber = async () => {
        setLoading(true);
        try {
            console.log('📥 Carregando contas a receber do backend...');
            const response = await financeiroService.listarContasReceber();
            
            if (response.success && response.data) {
                // Processar e enriquecer dados
                const contasProcessadas = response.data.map((conta: any) => {
                    // Detectar atraso
                    const isAtrasada = new Date(conta.dataVencimento) < new Date() && conta.status === 'Pendente';
                    
                    return {
                        id: conta.id,
                        vendaId: conta.vendaId || conta.venda?.id || 'N/A',
                        numeroParcela: conta.numeroParcela || 1,
                        numeroDuplicata: `DUP-${(conta.numeroParcela || 1).toString().padStart(3, '0')}`,
                        clienteNome: conta.cliente?.nome || conta.venda?.cliente?.nome || 'Cliente não informado',
                        projetoTitulo: conta.descricao || conta.venda?.orcamento?.titulo || 'Projeto',
                        dataVencimento: conta.dataVencimento,
                        valor: conta.valorParcela || conta.valor || 0,
                        valorRecebido: conta.valorRecebido,
                        dataPagamento: conta.dataPagamento,
                        status: isAtrasada ? 'Atrasado' : (conta.status === 'Pago' ? 'Recebido' : conta.status),
                        observacoes: conta.observacoes
                    };
                });
                
                setContasReceber(contasProcessadas);
                console.log(`✅ ${contasProcessadas.length} contas a receber carregadas`);
            } else {
                console.warn('⚠️ Erro ao carregar contas:', response.error);
                setContasReceber([]);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar contas a receber:', error);
            setContasReceber([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar contas
    const contasFiltradas = useMemo(() => {
        let filtered = [...contasReceber];

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
                    return vencimento < hoje && conta.status !== 'Recebido';
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
                conta.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conta.projetoTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conta.numeroDuplicata.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [contasReceber, filterStatus, filterPeriodo, searchTerm]);

    // Estatísticas
    const estatisticas = useMemo(() => {
        const totalReceber = contasFiltradas
            .filter(c => c.status === 'Pendente' || c.status === 'Atrasado')
            .reduce((sum, c) => sum + c.valor, 0);
        
        const totalRecebido = contasReceber
            .filter(c => c.status === 'Recebido')
            .reduce((sum, c) => sum + (c.valorRecebido || 0), 0);
        
        const totalAtrasado = contasFiltradas
            .filter(c => c.status === 'Atrasado')
            .reduce((sum, c) => sum + c.valor, 0);
        
        const qtdPendente = contasFiltradas.filter(c => c.status === 'Pendente').length;
        const qtdAtrasado = contasFiltradas.filter(c => c.status === 'Atrasado').length;

        return {
            totalReceber,
            totalRecebido,
            totalAtrasado,
            qtdPendente,
            qtdAtrasado
        };
    }, [contasReceber, contasFiltradas]);

    // Handlers
    const handleOpenBaixaModal = (conta: ContaReceber) => {
        setContaSelecionada(conta);
        setValorRecebido(conta.valor.toString());
        setDataPagamento(new Date().toISOString().split('T')[0]);
        setObservacoesBaixa('');
        setIsBaixaModalOpen(true);
    };

    const handleCloseBaixaModal = () => {
        setIsBaixaModalOpen(false);
        setContaSelecionada(null);
        setValorRecebido('0');
        setObservacoesBaixa('');
    };

    const handleBaixaRecebimento = async () => {
        if (!contaSelecionada) return;

        if (!confirm(`Confirmar o recebimento de R$ ${parseFloat(valorRecebido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}?`)) {
            return;
        }

        try {
            console.log('💰 Registrando recebimento...');
            const response = await financeiroService.darBaixaRecebimento(contaSelecionada.id, {
                dataPagamento,
                valorRecebido: parseFloat(valorRecebido),
                observacoes: observacoesBaixa
            });

            if (response.success) {
                alert('✅ Recebimento registrado com sucesso!');
                handleCloseBaixaModal();
                // Recarregar lista
                await loadContasReceber();
            } else {
                alert(`❌ ${response.error || 'Erro ao registrar recebimento'}`);
            }
        } catch (error) {
            console.error('❌ Erro ao dar baixa:', error);
            alert('❌ Erro ao registrar recebimento');
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Recebido':
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
        if (status === 'Recebido') return false;
        return new Date(dataVencimento) < new Date();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando contas a receber...</p>
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
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Contas a Receber</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gestão de recebimentos e parcelas</p>
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
                        onClick={loadContasReceber}
                        className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all font-semibold"
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">A Receber</p>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {estatisticas.totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{estatisticas.qtdPendente} pendente(s)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Recebido</p>
                            <p className="text-2xl font-bold text-blue-600">
                                R$ {estatisticas.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Atrasado</p>
                            <p className="text-2xl font-bold text-red-600">
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
                                placeholder="Buscar por cliente, projeto ou duplicata..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                        >
                            <option value="Todos">Todos os Status</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Recebido">Recebido</option>
                            <option value="Atrasado">Atrasado</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterPeriodo}
                            onChange={(e) => setFilterPeriodo(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
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
                                    Duplicata
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Cliente / Projeto
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
                                            <p className="text-sm text-gray-400 mt-1">Ajuste os filtros ou aguarde novas vendas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                contasFiltradas.map((conta) => (
                                    <tr key={conta.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{conta.numeroDuplicata}</p>
                                                <p className="text-xs text-gray-500">Parcela {conta.numeroParcela}</p>
                                                <p className="text-xs text-blue-600 mt-1">Venda: {conta.vendaId}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{conta.clienteNome}</p>
                                                <p className="text-sm text-gray-600">{conta.projetoTitulo}</p>
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
                                            {conta.valorRecebido && conta.valorRecebido !== conta.valor && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Recebido: R$ {conta.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusClass(conta.status)}`}>
                                                {conta.status === 'Recebido' && '✅ '}
                                                {conta.status === 'Pendente' && '⏳ '}
                                                {conta.status === 'Atrasado' && '⚠️ '}
                                                {conta.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {conta.status !== 'Recebido' && (
                                                    <button
                                                        onClick={() => handleOpenBaixaModal(conta)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        Dar Baixa
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => alert(`Visualizar venda ${conta.vendaId}`)}
                                                    className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                                                    title="Visualizar Venda"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Baixa */}
            {isBaixaModalOpen && contaSelecionada && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Dar Baixa no Recebimento</h2>
                                <p className="text-sm text-gray-600 mt-1">Registrar o recebimento da parcela</p>
                            </div>
                            <button
                                onClick={handleCloseBaixaModal}
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
                                        <span className="text-blue-700 font-medium">Duplicata:</span>
                                        <p className="text-blue-900 font-semibold">{contaSelecionada.numeroDuplicata}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Cliente:</span>
                                        <p className="text-blue-900">{contaSelecionada.clienteNome}</p>
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
                                        Data do Recebimento *
                                    </label>
                                    <input
                                        type="date"
                                        value={dataPagamento}
                                        onChange={(e) => setDataPagamento(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Valor Recebido (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        value={valorRecebido}
                                        onChange={(e) => setValorRecebido(e.target.value)}
                                        min="0"
                                        max={contaSelecionada.valor}
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                        value={observacoesBaixa}
                                        onChange={(e) => setObservacoesBaixa(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Informações adicionais sobre o recebimento..."
                                    />
                                </div>
                            </div>

                            {/* Resumo */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-700">Valor a Registrar:</span>
                                    <span className="text-2xl font-bold text-green-700">
                                        R$ {parseFloat(valorRecebido || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={handleCloseBaixaModal}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBaixaRecebimento}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold flex items-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Confirmar Recebimento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContasAReceber;

