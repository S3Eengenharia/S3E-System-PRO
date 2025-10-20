import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { vendasData, budgetsData, clientsData } from '../data/mockData';
import { BudgetStatus } from '../types';

// Icons
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

interface VendasProps {
    toggleSidebar: () => void;
}

interface VendaForm {
    orcamentoId: string;
    formaPagamento: string;
    parcelas: number;
    valorEntrada: number;
    observacoes?: string;
}

type TabType = 'nova' | 'lista' | 'dashboard';

const Vendas: React.FC<VendasProps> = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    // Estados para nova venda
    const [vendaForm, setVendaForm] = useState<VendaForm>({
        orcamentoId: '',
        formaPagamento: 'À vista',
        parcelas: 1,
        valorEntrada: 0,
        observacoes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Filtrar orçamentos aprovados
    const orcamentosAprovados = useMemo(() => {
        return budgetsData.filter(orc => orc.status === BudgetStatus.Aprovado);
    }, []);

    // Orçamento selecionado
    const orcamentoSelecionado = useMemo(() => {
        if (!vendaForm.orcamentoId) return null;
        return budgetsData.find(orc => orc.id === vendaForm.orcamentoId) || null;
    }, [vendaForm.orcamentoId]);

    // Cliente do orçamento selecionado
    const clienteDoOrcamento = useMemo(() => {
        if (!orcamentoSelecionado) return null;
        return clientsData.find(cli => cli.id === orcamentoSelecionado.clienteId) || null;
    }, [orcamentoSelecionado]);

    // Estados para lista de vendas
    const [vendas, setVendas] = useState<any[]>([]);
    const [loadingVendas, setLoadingVendas] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>(null);

    // Carregar dados iniciais
    useEffect(() => {
        if (activeTab === 'lista') {
            carregarVendas();
            carregarDashboard();
        }
    }, [activeTab]);

    const carregarVendas = async () => {
        setLoadingVendas(true);
        try {
            // Usar dados mockados reais
            setVendas(vendasData);
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
        } finally {
            setLoadingVendas(false);
        }
    };

    const carregarDashboard = async () => {
        try {
            // Calcular dados do dashboard baseado nos dados mockados
            const vendasDoMes = vendasData.filter(v => {
                const vendaDate = new Date(v.dataVenda);
                const currentMonth = new Date();
                return vendaDate.getMonth() === currentMonth.getMonth() &&
                       vendaDate.getFullYear() === currentMonth.getFullYear();
            });

            const totalVendas = vendasDoMes.length;
            const valorTotalVendas = vendasDoMes.reduce((sum, v) => sum + v.valorTotal, 0);

            const todasContas = vendasData.flatMap(v => v.contasReceber);
            const contasAReceber = todasContas.filter(c => c.status === 'Pendente');
            const valorAReceber = contasAReceber.reduce((sum, c) => sum + c.valorParcela, 0);

            const contasEmAtraso = contasAReceber.filter(c => {
                const vencimento = new Date(c.dataVencimento);
                return vencimento < new Date() && c.status === 'Pendente';
            });
            const valorEmAtraso = contasEmAtraso.reduce((sum, c) => sum + c.valorParcela, 0);

            setDashboardData({
                vendasDoMes: {
                    total: totalVendas,
                    valorTotal: valorTotalVendas
                },
                contasAReceber: {
                    total: contasAReceber.length,
                    valorTotal: valorAReceber,
                    emAtraso: {
                        total: contasEmAtraso.length,
                        valorTotal: valorEmAtraso
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    };

    const handleSubmitVenda = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!orcamentoSelecionado) {
            alert('Por favor, selecione um orçamento aprovado.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Preparar dados da venda
            const vendaData = {
                orcamentoId: vendaForm.orcamentoId,
                clienteId: orcamentoSelecionado.clienteId,
                valorTotal: orcamentoSelecionado.total,
                formaPagamento: vendaForm.formaPagamento,
                parcelas: vendaForm.parcelas,
                valorEntrada: vendaForm.valorEntrada,
                observacoes: vendaForm.observacoes
            };

            // Aqui faria a chamada real para o backend
            // const response = await fetchWithAuth('/api/vendas/realizar', {
            //     method: 'POST',
            //     body: JSON.stringify(vendaData)
            // });

            // Mock de sucesso
            alert(`Venda realizada com sucesso!\nCliente: ${clienteDoOrcamento?.name}\nValor: R$ ${orcamentoSelecionado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            
            // Resetar formulário
            setVendaForm({
                orcamentoId: '',
                formaPagamento: 'À vista',
                parcelas: 1,
                valorEntrada: 0,
                observacoes: ''
            });
            
            setActiveTab('lista');
        } catch (error) {
            console.error('Erro ao realizar venda:', error);
            alert('Erro ao realizar venda');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVendaForm(prev => ({
            ...prev,
            [name]: name === 'valorTotal' || name === 'parcelas' || name === 'valorEntrada'
                ? parseFloat(value) || 0
                : value
        }));
    };

    // Calcular valor das parcelas
    const valorTotal = orcamentoSelecionado?.total || 0;
    const valorRestante = valorTotal - vendaForm.valorEntrada;
    const valorParcela = vendaForm.parcelas > 0 ? valorRestante / vendaForm.parcelas : 0;

    // Calcular totais para o dashboard
    const totalVendas = useMemo(() => {
        return vendasData.reduce((sum, v) => sum + v.valorTotal, 0);
    }, []);

    const totalContas = useMemo(() => {
        const todasContas = vendasData.flatMap(v => v.contasReceber);
        return todasContas.length;
    }, []);

    const totalReceber = useMemo(() => {
        const todasContas = vendasData.flatMap(v => v.contasReceber);
        return todasContas
            .filter(c => c.status === 'Pendente')
            .reduce((sum, c) => sum + c.valorParcela, 0);
    }, []);

    const totalAtrasado = useMemo(() => {
        const todasContas = vendasData.flatMap(v => v.contasReceber);
        return todasContas
            .filter(c => {
                const vencimento = new Date(c.dataVencimento);
                return vencimento < new Date() && c.status === 'Pendente';
            })
            .reduce((sum, c) => sum + c.valorParcela, 0);
    }, []);

    const tabs = [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
        { id: 'lista' as TabType, label: 'Vendas Realizadas', icon: '💰' },
        { id: 'nova' as TabType, label: 'Nova Venda', icon: '➕' }
    ];

    return (
        <div className="p-4 sm:p-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button 
                        onClick={toggleSidebar} 
                        className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" 
                        aria-label="Open sidebar"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Vendas</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de vendas e contas a receber</p>
                    </div>
                </div>
            </header>

            {/* Cards Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Total de Vendas</h3>
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                        R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{vendasData.length} vendas realizadas</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">A Receber</h3>
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                        R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{totalContas} contas pendentes</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Em Atraso</h3>
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-red-700">
                        R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Requer atenção imediata</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex flex-wrap gap-2 p-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-brand-blue text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Tab: Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Visão Geral de Vendas</h2>
                            
                            {/* Estatísticas Detalhadas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Vendas por Status</h3>
                                    <div className="space-y-3">
                                        {['Concluida', 'Pendente', 'Cancelada'].map(status => {
                                            const count = vendasData.filter(v => v.status === status).length;
                                            const total = vendasData.filter(v => v.status === status).reduce((sum, v) => sum + v.valorTotal, 0);
                                            return (
                                                <div key={status} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">{status}</span>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-blue-700">{count} vendas</p>
                                                        <p className="text-xs text-gray-600">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Contas a Receber</h3>
                                    <div className="space-y-3">
                                        {vendasData.flatMap(v => v.contasReceber).map(conta => (
                                            <div key={conta.id} className="flex justify-between items-center border-b border-green-100 pb-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Parcela</p>
                                                    <p className="text-xs text-gray-500">Venc: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-green-700">
                                                        R$ {conta.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <span className={`text-xs font-semibold ${
                                                        conta.status === 'Pago' ? 'text-green-600' : 'text-yellow-600'
                                                    }`}>
                                                        {conta.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Lista de Vendas */}
                    {activeTab === 'lista' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Vendas Realizadas</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nº Venda</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Projeto</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Parcelas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {vendasData.map(venda => (
                                            <tr key={venda.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{venda.numeroVenda}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{venda.cliente.nome}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{venda.projeto.titulo}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                                                    R$ {venda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                        venda.status === 'Concluida'
                                                            ? 'bg-green-100 text-green-800'
                                                            : venda.status === 'Cancelada'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {venda.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {venda.contasReceber.length}x
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {venda.contasReceber.filter(c => c.status === 'Pago').length} pagas
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab: Nova Venda */}
                    {activeTab === 'nova' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Realizar Nova Venda</h2>

                            <form onSubmit={handleSubmitVenda} className="max-w-3xl mx-auto space-y-6">
                                {/* Orçamento Aprovado */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Orçamento Aprovado <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="orcamentoId"
                                        value={vendaForm.orcamentoId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20"
                                        required
                                    >
                                        <option value="">Selecione um orçamento aprovado...</option>
                                        {orcamentosAprovados.map(orc => (
                                            <option key={orc.id} value={orc.id}>
                                                {orc.id} - {orc.clientName} - {orc.projectName} - R$ {orc.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </option>
                                        ))}
                                    </select>
                                    {orcamentosAprovados.length === 0 && (
                                        <p className="text-xs text-red-600 mt-1">
                                            ⚠️ Nenhum orçamento aprovado disponível. Aprove um orçamento primeiro.
                                        </p>
                                    )}
                                </div>

                                {/* Informações do Orçamento Selecionado */}
                                {orcamentoSelecionado && clienteDoOrcamento && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-3">📋 Dados do Orçamento</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Cliente:</p>
                                                <p className="font-semibold text-gray-900">{clienteDoOrcamento.name}</p>
                                                <p className="text-xs text-gray-600">
                                                    {clienteDoOrcamento.document} • {clienteDoOrcamento.phone}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Projeto:</p>
                                                <p className="font-semibold text-gray-900">{orcamentoSelecionado.projectName}</p>
                                                <p className="text-xs text-gray-600">{orcamentoSelecionado.projectType}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Valor do Orçamento:</p>
                                                <p className="font-bold text-blue-700 text-lg">
                                                    R$ {orcamentoSelecionado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Condições de Pagamento:</p>
                                                <p className="font-semibold text-gray-900">{orcamentoSelecionado.paymentTerms}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Forma de Pagamento e Parcelas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Forma de Pagamento
                                        </label>
                                        <select
                                            name="formaPagamento"
                                            value={vendaForm.formaPagamento}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20"
                                        >
                                            <option value="À vista">À vista</option>
                                            <option value="Parcelado">Parcelado</option>
                                            <option value="Boleto">Boleto</option>
                                            <option value="PIX">PIX</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Número de Parcelas
                                        </label>
                                        <input
                                            type="number"
                                            name="parcelas"
                                            value={vendaForm.parcelas}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20"
                                            min="1"
                                            max="12"
                                        />
                                    </div>
                                </div>

                                {/* Valor de Entrada */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Valor de Entrada (R$)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                                        <input
                                            type="number"
                                            name="valorEntrada"
                                            value={vendaForm.valorEntrada}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20"
                                            placeholder="0,00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Valor restante: R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Resumo das Parcelas */}
                                {vendaForm.parcelas > 1 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">📋 Resumo das Parcelas</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Valor de entrada:</span>
                                                <span className="font-semibold">R$ {vendaForm.valorEntrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Valor restante:</span>
                                                <span className="font-semibold">R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Valor por parcela ({vendaForm.parcelas}x):</span>
                                                <span className="font-semibold">R$ {valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Observações */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Observações
                                    </label>
                                    <textarea
                                        name="observacoes"
                                        value={vendaForm.observacoes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20"
                                        placeholder="Observações sobre a venda..."
                                    />
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('dashboard')}
                                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !vendaForm.orcamentoId || valorTotal <= 0}
                                        className="px-6 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Realizando Venda...' : '💰 Realizar Venda'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Vendas;
