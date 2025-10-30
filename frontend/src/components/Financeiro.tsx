import React, { useState, useMemo, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { financeiroService } from '../services/financeiroService';
import { vendasService } from '../services/vendasService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

// ==================== ICONS ====================
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.268-.268-1.268-.732 0-.464.543-.732 1.268-.732.725 0 1.268.268 1.268.732" />
    </svg>
);
const ArrowTrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
);
const ArrowTrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
    </svg>
);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H15.75c.621 0 1.125.504 1.125 1.125v.375m-13.5 0h12m-12 0v.75c0 .414.336.75.75.75h9.75c.621 0 1.125-.504 1.125-1.125v-.375M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5zm-3 0h.008v.008H12V10.5zm-3 0h.008v.008H9V10.5zm-3 0h.008v.008H6V10.5z" />
    </svg>
);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25a3 3 0 106 0m-6 0a3 3 0 616 0m6 0a3 3 0 106 0m-6 0a3 3 0 616 0m6-3a3 3 0 106 0m-6 0a3 3 0 616 0" />
    </svg>
);

interface FinanceiroProps {
    toggleSidebar: () => void;
}

type TabType = 'dashboard' | 'vendas' | 'receber' | 'pagar' | 'faturamento' | 'cobrancas';

const Financeiro: React.FC<FinanceiroProps> = ({ toggleSidebar }) => {
    const { user } = useContext(AuthContext)!;
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [dadosFinanceiros, setDadosFinanceiros] = useState<any[]>([]);
    const [resumoFinanceiro, setResumoFinanceiro] = useState<any>(null);
    const [dadosMensais, setDadosMensais] = useState<any[]>([]);
    const [contasReceber, setContasReceber] = useState<any[]>([]);
    const [contasPagar, setContasPagar] = useState<any[]>([]);
    const [vendas, setVendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Carregar dados do backend
    useEffect(() => {
        carregarDadosFinanceiros();
    }, []);

    const carregarDadosFinanceiros = async () => {
        setLoading(true);
        try {
            // Carregar resumo financeiro
            const resumoResponse = await financeiroService.getResumo();
            if (resumoResponse.success && resumoResponse.data) {
                setResumoFinanceiro(resumoResponse.data);
            }

            // Carregar dados mensais
            const mensaisResponse = await financeiroService.getDadosMensais();
            if (mensaisResponse.success && mensaisResponse.data) {
                setDadosMensais(mensaisResponse.data);
            }

            // Carregar contas a receber
            const receberResponse = await financeiroService.listarContasReceber();
            if (receberResponse.success && receberResponse.data) {
                setContasReceber(receberResponse.data);
            }

            // Carregar contas a pagar
            const pagarResponse = await financeiroService.listarContasPagar();
            if (pagarResponse.success && pagarResponse.data) {
                setContasPagar(pagarResponse.data);
            }

            // Carregar vendas
            const vendasResponse = await vendasService.listarVendas({ limit: 10 });
            if (vendasResponse.success && vendasResponse.data) {
                setVendas(vendasResponse.data.vendas || []);
            }
        } catch (error) {
            console.error('Erro ao carregar dados financeiros:', error);
        } finally {
            setLoading(false);
        }
    };

    // Estatísticas calculadas
    const estatisticas = useMemo(() => {
        if (resumoFinanceiro) {
            return {
                receitaTotal: resumoFinanceiro.receitaTotal || 0,
                contasReceberTotal: resumoFinanceiro.contasReceber || 0,
                contasPagarTotal: resumoFinanceiro.contasPagar || 0,
                lucroEstimado: resumoFinanceiro.lucroLiquido || 0,
                totalVendas: vendas.length,
                contasVencendo: contasReceber.filter(c => {
                    const vencimento = new Date(c.dataVencimento);
                    const hoje = new Date();
                    const diffTime = vencimento.getTime() - hoje.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7 && diffDays > 0 && c.status === 'Pendente';
                }).length
            };
        }
        return {
            receitaTotal: 0,
            contasReceberTotal: 0,
            contasPagarTotal: 0,
            lucroEstimado: 0,
            totalVendas: 0,
            contasVencendo: 0
        };
    }, [resumoFinanceiro, vendas, contasReceber]);

    // Dados para gráficos
    const dadosComparativoMensal = useMemo(() => {
        if (dadosMensais && dadosMensais.length > 0) {
            return dadosMensais.slice(-6).map((item: any) => ({
                mes: item.mes,
                receita: item.receita || 0,
                despesa: item.despesa || 0,
                lucro: item.lucro || 0
            }));
        }
        return [
            { mes: 'Jan', receita: 0, despesa: 0, lucro: 0 },
            { mes: 'Fev', receita: 0, despesa: 0, lucro: 0 },
            { mes: 'Mar', receita: 0, despesa: 0, lucro: 0 },
            { mes: 'Abr', receita: 0, despesa: 0, lucro: 0 },
            { mes: 'Mai', receita: 0, despesa: 0, lucro: 0 },
            { mes: 'Jun', receita: 0, despesa: 0, lucro: 0 }
        ];
    }, [dadosMensais]);

    const dadosDistribuicaoDespesas = useMemo(() => {
        // Mock data por enquanto - pode ser substituído por dados reais quando disponível
        return [
            { name: 'Materiais', value: 45000, color: '#3b82f6' },
            { name: 'Mão de Obra', value: 28000, color: '#10b981' },
            { name: 'Equipamentos', value: 15000, color: '#f59e0b' },
            { name: 'Transporte', value: 8000, color: '#ef4444' },
            { name: 'Outros', value: 5000, color: '#8b5cf6' }
        ];
    }, []);

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Receita Total</p>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {estatisticas.receitaTotal.toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">A Receber</p>
                            <p className="text-2xl font-bold text-blue-600">
                                R$ {estatisticas.contasReceberTotal.toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                            <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">A Pagar</p>
                            <p className="text-2xl font-bold text-red-600">
                                R$ {estatisticas.contasPagarTotal.toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Lucro Estimado</p>
                            <p className="text-2xl font-bold text-purple-600">
                                R$ {estatisticas.lucroEstimado.toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Receitas vs Despesas */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Receitas vs Despesas (6 meses)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dadosComparativoMensal}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                            <Legend />
                            <Bar dataKey="receita" fill="#10b981" name="Receita" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="despesa" fill="#ef4444" name="Despesa" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de Distribuição de Despesas */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Despesas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dadosDistribuicaoDespesas}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {dadosDistribuicaoDespesas.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alertas e Resumos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contas a Vencer */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contas a Receber (Próximas)</h3>
                    <div className="space-y-3">
                        {contasReceber.slice(0, 5).length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Nenhuma conta a receber encontrada</p>
                        ) : (
                            contasReceber.slice(0, 5).map((conta: any) => (
                                <div key={conta.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">{conta.cliente?.nome || conta.venda?.cliente?.nome || 'Cliente não informado'}</p>
                                        <p className="text-sm text-gray-600">Parcela {conta.numeroParcela}</p>
                                        <p className="text-xs text-blue-600">Vence: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-700">
                                            R$ {conta.valor?.toLocaleString('pt-BR') || '0,00'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Contas a Pagar */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contas a Pagar (Próximas)</h3>
                    <div className="space-y-3">
                        {contasPagar.slice(0, 5).length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Nenhuma conta a pagar encontrada</p>
                        ) : (
                            contasPagar.slice(0, 5).map((conta: any) => (
                                <div key={conta.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">{conta.fornecedorNome || conta.fornecedor?.nome || 'Fornecedor não informado'}</p>
                                        <p className="text-sm text-gray-600">{conta.descricao}</p>
                                        <p className="text-xs text-red-600">Vence: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-700">
                                            R$ {conta.valor?.toLocaleString('pt-BR') || '0,00'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderVendas = () => (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Relatório de Vendas</h3>
            <div className="space-y-4">
                {vendas.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma venda encontrada</p>
                ) : (
                    vendas.map((venda: any) => (
                        <div key={venda.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900">{venda.cliente?.nome || 'Cliente não informado'}</p>
                                <p className="text-sm text-gray-600">{venda.orcamento?.titulo || 'Sem descrição'}</p>
                                <p className="text-xs text-gray-500">{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">
                                    R$ {venda.valorTotal?.toLocaleString('pt-BR') || '0,00'}
                                </p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    venda.status === 'Finalizada' || venda.status === 'Ativa'
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {venda.status || 'Desconhecido'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderContasReceber = () => (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Contas a Receber</h3>
            <div className="space-y-4">
                {contasReceber.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma conta a receber encontrada</p>
                ) : (
                    contasReceber.map((conta: any) => (
                        <div key={conta.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900">{conta.cliente?.nome || conta.venda?.cliente?.nome || 'Cliente não informado'}</p>
                                <p className="text-sm text-gray-600">Parcela {conta.numeroParcela}</p>
                                <p className="text-xs text-blue-600">Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-blue-700">
                                    R$ {conta.valor?.toLocaleString('pt-BR') || '0,00'}
                                </p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    conta.status === 'Pago' 
                                        ? 'bg-green-100 text-green-800'
                                        : conta.status === 'Atrasado'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {conta.status || 'Pendente'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderContasPagar = () => (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Contas a Pagar</h3>
            <div className="space-y-4">
                {contasPagar.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma conta a pagar encontrada</p>
                ) : (
                    contasPagar.map((conta: any) => (
                        <div key={conta.id} className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900">{conta.fornecedorNome || conta.fornecedor?.nome || 'Fornecedor não informado'}</p>
                                <p className="text-sm text-gray-600">{conta.descricao}</p>
                                <p className="text-xs text-red-600">Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-red-700">
                                    R$ {conta.valor?.toLocaleString('pt-BR') || '0,00'}
                                </p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    conta.status === 'Pago' 
                                        ? 'bg-green-100 text-green-800'
                                        : conta.status === 'Atrasado'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {conta.status || 'Pendente'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dados financeiros...</p>
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
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Financeiro</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Dashboard financeiro e controle de fluxo de caixa</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500 font-medium">Última atualização</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{new Date().toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </header>

            {/* Tabs de Navegação */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'dashboard'
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                >
                    📊 Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('vendas')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'vendas'
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                >
                    💰 Vendas
                </button>
                <button
                    onClick={() => setActiveTab('receber')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'receber'
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                >
                    📈 A Receber
                </button>
                <button
                    onClick={() => setActiveTab('pagar')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'pagar'
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                >
                    📉 A Pagar
                </button>
                <button
                    onClick={() => setActiveTab('faturamento')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'faturamento'
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                >
                    📋 Faturamento
                </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="animate-fade-in">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'vendas' && renderVendas()}
                {activeTab === 'receber' && renderContasReceber()}
                {activeTab === 'pagar' && renderContasPagar()}
                {activeTab === 'faturamento' && (
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Relatório de Faturamento</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={dadosComparativoMensal}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                                <Legend />
                                <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} />
                                <Line type="monotone" dataKey="lucro" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Financeiro;