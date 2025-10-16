import React, { useState, useMemo } from 'react';

// Icons
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

interface FinanceiroProps {
    toggleSidebar: () => void;
}

type TabType = 'vendas' | 'receber' | 'pagar' | 'faturamento' | 'cobrancas';

const Financeiro: React.FC<FinanceiroProps> = ({ toggleSidebar }) => {
    const [activeTab, setActiveTab] = useState<TabType>('vendas');

    // Mock data para demonstração
    const vendas = [
        { id: '1', cliente: 'Empresa A', projeto: 'Subestação 150kVA', valor: 85000, data: '15/10/2025', status: 'Concluído' },
        { id: '2', cliente: 'Empresa B', projeto: 'Quadro de Medição', valor: 12500, data: '10/10/2025', status: 'Em Andamento' }
    ];

    const contasReceber = [
        { id: '1', cliente: 'Empresa A', descricao: 'Parcela 1/3', valor: 28333.33, vencimento: '20/10/2025', status: 'Pendente' },
        { id: '2', cliente: 'Empresa A', descricao: 'Parcela 2/3', valor: 28333.33, vencimento: '20/11/2025', status: 'Pendente' },
    ];

    const contasPagar = [
        { id: '1', fornecedor: 'Distribuidora Elétrica', descricao: 'Materiais Projeto A', valor: 15000, vencimento: '25/10/2025', status: 'Pendente' },
    ];

    const tabs = [
        { id: 'vendas' as TabType, label: 'Vendas', icon: '💰' },
        { id: 'receber' as TabType, label: 'Contas a Receber', icon: '📥' },
        { id: 'pagar' as TabType, label: 'Contas a Pagar', icon: '📤' },
        { id: 'faturamento' as TabType, label: 'Faturamento', icon: '📊' },
        { id: 'cobrancas' as TabType, label: 'Status Cobranças', icon: '⚠️' }
    ];

    const totalReceber = useMemo(() => 
        contasReceber.reduce((sum, c) => sum + c.valor, 0), []);
    
    const totalPagar = useMemo(() => 
        contasPagar.reduce((sum, c) => sum + c.valor, 0), []);

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Financeiro</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão financeira completa</p>
                    </div>
                </div>
            </header>

            {/* Cards Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Contas a Receber</h3>
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                        R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{contasReceber.length} pendências</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Contas a Pagar</h3>
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-red-700">
                        R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{contasPagar.length} pendências</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Saldo Previsto</h3>
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                        R$ {(totalReceber - totalPagar).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Diferença entre receber e pagar</p>
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
                    {/* Tab: Vendas */}
                    {activeTab === 'vendas' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Vendas Realizadas</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Projeto</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {vendas.map(venda => (
                                            <tr key={venda.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{venda.cliente}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{venda.projeto}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{venda.data}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                                                    R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                        venda.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {venda.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab: Contas a Receber */}
                    {activeTab === 'receber' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Contas a Receber</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vencimento</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {contasReceber.map(conta => (
                                            <tr key={conta.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{conta.cliente}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{conta.descricao}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{conta.vencimento}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                                                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        {conta.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab: Contas a Pagar */}
                    {activeTab === 'pagar' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Contas a Pagar</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fornecedor</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vencimento</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {contasPagar.map(conta => (
                                            <tr key={conta.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{conta.fornecedor}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{conta.descricao}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{conta.vencimento}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">
                                                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        {conta.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab: Faturamento */}
                    {activeTab === 'faturamento' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumo de Faturamento</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Receitas (Mês Atual)</h3>
                                    <p className="text-4xl font-bold text-green-600 mb-2">R$ 97.500,00</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Vendas</span>
                                            <span className="font-semibold">R$ 97.500,00</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Despesas (Mês Atual)</h3>
                                    <p className="text-4xl font-bold text-red-600 mb-2">R$ 15.000,00</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Compras</span>
                                            <span className="font-semibold">R$ 15.000,00</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Lucro Líquido (Mês Atual)</h3>
                                    <p className="text-5xl font-bold text-blue-700">R$ 82.500,00</p>
                                    <p className="text-sm text-gray-600 mt-2">Margem: 84.6%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Status de Cobranças */}
                    {activeTab === 'cobrancas' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard de Cobranças</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">⏰</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">A Vencer (7 dias)</p>
                                            <p className="text-2xl font-bold text-yellow-700">2</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">R$ 56.666,66</p>
                                </div>

                                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">❌</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Vencidas</p>
                                            <p className="text-2xl font-bold text-red-700">0</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">R$ 0,00</p>
                                </div>

                                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Pagas (Mês)</p>
                                            <p className="text-2xl font-bold text-green-700">0</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">R$ 0,00</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Financeiro;

