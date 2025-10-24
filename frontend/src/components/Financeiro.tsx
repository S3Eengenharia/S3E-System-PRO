import React, { useState, useMemo, useEffect } from 'react';
import { vendasData } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

// Icons
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

interface FinanceiroProps {
    toggleSidebar: () => void;
}

type TabType = 'dashboard' | 'vendas' | 'receber' | 'pagar' | 'faturamento' | 'cobrancas';

const Financeiro: React.FC<FinanceiroProps> = ({ toggleSidebar }) => {
    const { fetchWithAuth } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [dadosFinanceiros, setDadosFinanceiros] = useState<any[]>([]);
    const [resumoFinanceiro, setResumoFinanceiro] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Usar dados mockados de vendas do sistema
    const vendas = vendasData.map(v => ({
        id: v.id,
        cliente: v.cliente.nome,
        projeto: v.projeto.titulo,
        valor: v.valorTotal,
        data: new Date(v.dataVenda).toLocaleDateString('pt-BR'),
        status: v.status === 'Concluida' ? 'Concluído' : v.status
    }));

    // Extrair contas a receber de todas as vendas
    const contasReceber = vendasData.flatMap(v => 
        v.contasReceber.map(c => ({
            id: c.id,
            cliente: v.cliente.nome,
            descricao: `Parcela (${v.numeroVenda})`,
            valor: c.valorParcela,
            vencimento: new Date(c.dataVencimento).toLocaleDateString('pt-BR'),
            status: c.status === 'Pago' ? 'Pago' : 'Pendente'
        }))
    ).filter(c => c.status === 'Pendente');

    const contasPagar = [
        { id: '1', fornecedor: 'Distribuidora Elétrica', descricao: 'Materiais Projeto A', valor: 15000, vencimento: '25/10/2025', status: 'Pendente' },
    ];

    // Dados para gráficos melhorados
    const dadosDistribuicaoDespesas = [
        { name: 'Materiais', value: 45000, color: '#3b82f6' },
        { name: 'Mão de Obra', value: 28000, color: '#10b981' },
        { name: 'Equipamentos', value: 15000, color: '#f59e0b' },
        { name: 'Transporte', value: 8000, color: '#ef4444' },
        { name: 'Outros', value: 5000, color: '#8b5cf6' }
    ];

    const dadosComparativoMensal = [
        { mes: 'Jan', receita: 120000, despesa: 95000, lucro: 25000 },
        { mes: 'Fev', receita: 135000, despesa: 110000, lucro: 25000 },
        { mes: 'Mar', receita: 150000, despesa: 120000, lucro: 30000 },
        { mes: 'Abr', receita: 165000, despesa: 130000, lucro: 35000 },
        { mes: 'Mai', receita: 180000, despesa: 140000, lucro: 40000 },
        { mes: 'Jun', receita: 195000, despesa: 150000, lucro: 45000 }
    ];

    const dadosTendenciaVendas = [
        { mes: 'Jan', vendas: 120000, orcamentos: 180000 },
        { mes: 'Fev', vendas: 135000, orcamentos: 200000 },
        { mes: 'Mar', vendas: 150000, orcamentos: 220000 },
        { mes: 'Abr', vendas: 165000, orcamentos: 240000 },
        { mes: 'Mai', vendas: 180000, orcamentos: 260000 },
        { mes: 'Jun', vendas: 195000, orcamentos: 280000 }
    ];

    // Carregar dados do backend
    useEffect(() => {
        carregarDadosFinanceiros();
    }, []);

    const carregarDadosFinanceiros = async () => {
        setLoading(true);
        try {
            // Tentar buscar dados reais do backend
            const [dadosMensais, resumo] = await Promise.all([
                fetch('http://localhost:3001/api/relatorios/financeiro', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }).then(res => res.json()).catch(() => null),
                fetch('http://localhost:3001/api/relatorios/financeiro/resumo', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }).then(res => res.json()).catch(() => null)
            ]);

            if (dadosMensais?.success) {
                setDadosFinanceiros(dadosMensais.data);
            }

            if (resumo?.success) {
                setResumoFinanceiro(resumo.data);
            }
        } catch (error) {
            console.error('Erro ao carregar dados financeiros:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
        { id: 'vendas' as TabType, label: 'Vendas', icon: '💰' },
        { id: 'receber' as TabType, label: 'Contas a Receber', icon: '📥' },
        { id: 'pagar' as TabType, label: 'Contas a Pagar', icon: '📤' },
        { id: 'faturamento' as TabType, label: 'Faturamento', icon: '📈' },
        { id: 'cobrancas' as TabType, label: 'Status Cobranças', icon: '⚠️' }
    ];

    const totalReceber = useMemo(() => 
        resumoFinanceiro?.contasReceberPendentes || contasReceber.reduce((sum, c) => sum + c.valor, 0), [resumoFinanceiro, contasReceber]);
    
    const totalPagar = useMemo(() => 
        resumoFinanceiro?.contasPagarPendentes || contasPagar.reduce((sum, c) => sum + c.valor, 0), [resumoFinanceiro, contasPagar]);

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
                    {/* Tab: Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard Financeiro - Últimos 12 Meses</h2>
                            
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                                </div>
                            ) : dadosFinanceiros.length > 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={dadosFinanceiros}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="mes" />
                                            <YAxis 
                                                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip 
                                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            />
                                            <Legend />
                                            <Bar 
                                                dataKey="receita" 
                                                fill="#22c55e" 
                                                name="Receitas"
                                                radius={[8, 8, 0, 0]}
                                            />
                                            <Bar 
                                                dataKey="despesa" 
                                                fill="#ef4444" 
                                                name="Despesas"
                                                radius={[8, 8, 0, 0]}
                                            />
                                            <Bar 
                                                dataKey="lucro" 
                                                fill="#3b82f6" 
                                                name="Lucro"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-600">
                                            <strong>📊 Regime de Caixa:</strong> O gráfico mostra apenas valores efetivamente pagos/recebidos por mês.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="text-4xl mb-4 block">📊</span>
                                    <p className="text-gray-600">Nenhum dado financeiro disponível ainda.</p>
                                    <p className="text-sm text-gray-500 mt-2">Realize vendas e registre pagamentos para ver os gráficos.</p>
                                </div>
                            )}

                            {/* Novos gráficos melhorados */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                                {/* Gráfico de Pizza - Distribuição de Despesas */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-2xl">🥧</span>
                                        Distribuição de Despesas
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={dadosDistribuicaoDespesas}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {dadosDistribuicaoDespesas.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Gráfico de Barras Comparativo */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-2xl">📊</span>
                                        Comparativo Mensal
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={dadosComparativoMensal}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="mes" />
                                            <YAxis 
                                                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip 
                                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="receita" fill="#10b981" name="Receita" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="despesa" fill="#ef4444" name="Despesa" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Gráfico de Tendência - Vendas vs Orçamentos */}
                            <div className="mt-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-2xl">📈</span>
                                        Tendência de Vendas vs Orçamentos
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={dadosTendenciaVendas}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="mes" />
                                            <YAxis 
                                                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip 
                                                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            />
                                            <Legend />
                                            <Area 
                                                type="monotone" 
                                                dataKey="vendas" 
                                                stackId="1" 
                                                stroke="#3b82f6" 
                                                fill="#3b82f6" 
                                                fillOpacity={0.6}
                                                name="Vendas Realizadas"
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="orcamentos" 
                                                stackId="2" 
                                                stroke="#10b981" 
                                                fill="#10b981" 
                                                fillOpacity={0.4}
                                                name="Orçamentos Gerados"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-gray-600">
                                            <strong>📈 Análise:</strong> A diferença entre orçamentos e vendas indica o potencial de conversão e oportunidades de melhoria no processo comercial.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

