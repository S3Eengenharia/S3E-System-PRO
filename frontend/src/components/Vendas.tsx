import React, { useState, useEffect, useMemo } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { BudgetStatus } from '../types';
import { vendasService, type Venda, type DashboardVendas } from '../services/vendasService';
import { orcamentosService } from '../services/orcamentosService';
import { clientesService } from '../services/clientesService';

// ==================== ICONS ====================
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
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.268-.268-1.268-.732 0-.464.543-.732 1.268-.732.725 0 1.268.268 1.268.732" />
    </svg>
);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M8.25 9h7.5" />
    </svg>
);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25a3 3 0 106 0m-6 0a3 3 0 016 0m6 0a3 3 0 106 0m-6 0a3 3 0 016 0m6 0a3 3 0 106 0m-6 0a3 3 0 016 0m-6-3a3 3 0 106 0m-6 0a3 3 0 616 0" />
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
    const { user } = useContext(AuthContext)!;
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para dados da API
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [orcamentosAprovados, setOrcamentosAprovados] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardVendas | null>(null);

    // Carregar dados iniciais
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Carregando dados de vendas...');
            
            const [vendasRes, orcamentosRes, dashboardRes] = await Promise.all([
                vendasService.listarVendas({ limit: 50 }),
                orcamentosService.listar({ status: 'Aprovado' }),
                vendasService.getDashboard()
            ]);

            console.log('📊 Resposta do serviço - Vendas:', vendasRes);
            console.log('📋 Resposta do serviço - Orçamentos:', orcamentosRes);
            console.log('📈 Resposta do serviço - Dashboard:', dashboardRes);

            // Tratar vendas
            if (vendasRes.success && vendasRes.data) {
                setVendas(vendasRes.data.vendas || []);
                console.log(`✅ ${vendasRes.data.vendas?.length || 0} vendas carregadas`);
            } else {
                console.warn('⚠️ Erro ao carregar vendas:', vendasRes.error);
                setVendas([]);
            }

            // Tratar orçamentos aprovados
            if (orcamentosRes.success && orcamentosRes.data) {
                setOrcamentosAprovados(orcamentosRes.data);
                console.log(`✅ ${orcamentosRes.data.length} orçamentos aprovados carregados`);
            } else {
                console.warn('⚠️ Erro ao carregar orçamentos:', orcamentosRes.error);
                setOrcamentosAprovados([]);
            }

            // Tratar dashboard
            if (dashboardRes.success && dashboardRes.data) {
                setDashboardData(dashboardRes.data);
                console.log('✅ Dashboard de vendas carregado');
            } else {
                console.warn('⚠️ Erro ao carregar dashboard:', dashboardRes.error);
                setDashboardData(null);
            }

        } catch (err) {
            console.error('❌ Erro crítico ao carregar dados:', err);
            setError('Erro de conexão ao carregar dados');
            setVendas([]);
            setOrcamentosAprovados([]);
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Orçamento selecionado
    const orcamentoSelecionado = useMemo(() => {
        if (!vendaForm.orcamentoId) return null;
        return orcamentosAprovados.find(orc => orc.id === vendaForm.orcamentoId) || null;
    }, [vendaForm.orcamentoId, orcamentosAprovados]);

    // Estatísticas calculadas
    const estatisticasVendas = useMemo(() => {
        if (dashboardData) {
            return {
                totalVendas: dashboardData.receitaMes || 0,
                vendasMes: dashboardData.vendasMes || 0,
                ticketMedio: dashboardData.ticketMedio || 0,
                metaMes: 100000
            };
        }
        
        // Fallback para dados locais
        const totalVendas = vendas.reduce((acc, venda) => acc + (venda.valorTotal || 0), 0);
        const vendasMesCount = vendas.length;
        const ticketMedio = vendasMesCount > 0 ? totalVendas / vendasMesCount : 0;
        
        return {
            totalVendas: totalVendas,
            vendasMes: vendasMesCount,
            ticketMedio: ticketMedio,
            metaMes: 100000
        };
    }, [dashboardData, vendas]);

    const formasPagamento = [
        'À vista',
        '2x sem juros',
        '3x sem juros',
        '6x com juros',
        '12x com juros',
        'Financiamento',
        'Cartão de crédito'
    ];

    const handleSubmitVenda = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orcamentoSelecionado) return;

        setIsSubmitting(true);
        setError(null);
        
        try {
            console.log('💰 Realizando nova venda...', vendaForm);

            const vendaData = {
                orcamentoId: vendaForm.orcamentoId,
                clienteId: orcamentoSelecionado.clienteId,
                formaPagamento: vendaForm.formaPagamento,
                numeroParcelas: vendaForm.parcelas,
                dataVencimentoPrimeiraParcela: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
                observacoes: vendaForm.observacoes
            };

            console.log('📤 Enviando dados da venda:', vendaData);

            const response = await vendasService.realizarVenda(vendaData);

            console.log('📥 Resposta do servidor:', response);

            if (response.success) {
                console.log('✅ Venda realizada com sucesso');
                alert(response.message || '✅ Venda registrada com sucesso!');
                
                // Resetar formulário
                setVendaForm({
                    orcamentoId: '',
                    formaPagamento: 'À vista',
                    parcelas: 1,
                    valorEntrada: 0,
                    observacoes: ''
                });
                
                // Recarregar dados
                await loadData();
                setActiveTab('lista');
            } else {
                const errorMsg = response.error || 'Erro ao registrar venda';
                console.warn('⚠️ Erro ao realizar venda:', errorMsg);
                setError(errorMsg);
                alert(`❌ ${errorMsg}`);
            }
        } catch (err) {
            console.error('❌ Erro crítico ao realizar venda:', err);
            const errorMsg = 'Erro de conexão ao registrar venda';
            setError(errorMsg);
            alert(`❌ ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total em Vendas</p>
                            <p className="text-2xl font-bold text-green-600">
                                R$ {(estatisticasVendas.totalVendas || 0).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Vendas no Mês</p>
                            <p className="text-2xl font-bold text-blue-600">{estatisticasVendas.vendasMes || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                            <p className="text-2xl font-bold text-purple-600">
                                R$ {(estatisticasVendas.ticketMedio || 0).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <CreditCardIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Meta do Mês</p>
                            <p className="text-2xl font-bold text-orange-600">
                                R$ {(estatisticasVendas.metaMes || 100000).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar da Meta */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Progresso da Meta Mensal</h3>
                    <span className="text-sm font-medium text-gray-600">
                        {estatisticasVendas.metaMes > 0 ? Math.round(((estatisticasVendas.totalVendas || 0) / estatisticasVendas.metaMes) * 100) : 0}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${estatisticasVendas.metaMes > 0 ? Math.min(((estatisticasVendas.totalVendas || 0) / estatisticasVendas.metaMes) * 100, 100) : 0}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>R$ {(estatisticasVendas.totalVendas || 0).toLocaleString('pt-BR')}</span>
                    <span>R$ {(estatisticasVendas.metaMes || 100000).toLocaleString('pt-BR')}</span>
                </div>
            </div>

            {/* Vendas Recentes */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas Recentes</h3>
                <div className="space-y-4">
                    {vendas.length > 0 ? (
                        vendas.slice(0, 5).map((venda) => (
                            <div key={venda.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900">{venda.cliente?.nome || 'Cliente'}</p>
                                    <p className="text-sm text-gray-600">{venda.orcamento?.titulo || 'Projeto'}</p>
                                    <p className="text-xs text-gray-500">{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">
                                        R$ {venda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        venda.status === 'Finalizada' 
                                            ? 'bg-green-100 text-green-800' 
                                            : venda.status === 'Ativa'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {venda.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhuma venda encontrada</p>
                            <p className="text-sm">As vendas aparecerão aqui quando forem criadas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderNovaVenda = () => (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Registrar Nova Venda</h3>
                <p className="text-gray-600">Selecione um orçamento aprovado para converter em venda</p>
            </div>

            <form onSubmit={handleSubmitVenda} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Orçamento Aprovado *
                        </label>
                        <select
                            value={vendaForm.orcamentoId}
                            onChange={(e) => setVendaForm({...vendaForm, orcamentoId: e.target.value})}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="">Selecione um orçamento aprovado</option>
                            {orcamentosAprovados.map(orc => (
                                <option key={orc.id} value={orc.id}>
                                    {orc.titulo} - {orc.cliente?.nome} - R$ {orc.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </option>
                            ))}
                        </select>
                        {orcamentosAprovados.length === 0 && (
                            <p className="text-sm text-orange-600 mt-2">
                                ⚠️ Nenhum orçamento aprovado encontrado. Aprove um orçamento primeiro.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Forma de Pagamento *
                        </label>
                        <select
                            value={vendaForm.formaPagamento}
                            onChange={(e) => setVendaForm({...vendaForm, formaPagamento: e.target.value})}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            {formasPagamento.map(forma => (
                                <option key={forma} value={forma}>{forma}</option>
                            ))}
                        </select>
                    </div>

                    {vendaForm.formaPagamento.includes('x') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Número de Parcelas
                            </label>
                            <input
                                type="number"
                                value={vendaForm.parcelas}
                                onChange={(e) => setVendaForm({...vendaForm, parcelas: Number(e.target.value)})}
                                min="1"
                                max="24"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Valor de Entrada (R$)
                        </label>
                        <input
                            type="number"
                            value={vendaForm.valorEntrada}
                            onChange={(e) => setVendaForm({...vendaForm, valorEntrada: Number(e.target.value)})}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                {orcamentoSelecionado && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Resumo do Orçamento Selecionado</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-green-700 font-medium">Cliente:</span>
                                <p className="text-green-900">{orcamentoSelecionado.cliente?.nome}</p>
                            </div>
                            <div>
                                <span className="text-green-700 font-medium">Valor Total:</span>
                                <p className="text-green-900 font-bold">
                                    R$ {orcamentoSelecionado.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <span className="text-green-700 font-medium">Itens:</span>
                                <p className="text-green-900">{orcamentoSelecionado.items?.length || 0} item(s)</p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Observações
                    </label>
                    <textarea
                        value={vendaForm.observacoes}
                        onChange={(e) => setVendaForm({...vendaForm, observacoes: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Informações adicionais sobre a venda..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => setActiveTab('dashboard')}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !orcamentoSelecionado}
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Processando...' : 'Registrar Venda'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderListaVendas = () => (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente ou projeto..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                    <div>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
                            <option value="">Todos os Status</option>
                            <option value="concluida">Concluída</option>
                            <option value="andamento">Em Andamento</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Vendas */}
            {vendas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma venda encontrada</h3>
                    <p className="text-gray-500 mb-6">Comece criando uma nova venda a partir de um orçamento aprovado.</p>
                    <button
                        onClick={() => setActiveTab('nova')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Nova Venda
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {vendas.map((venda) => (
                        <div key={venda.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-green-300 transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{venda.cliente?.nome || 'Cliente'}</h4>
                                    <p className="text-sm text-gray-600">{venda.orcamento?.titulo || 'Projeto'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                    <p className="text-lg font-bold text-green-600">
                                        R$ {venda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Pago: R$ {venda.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Data</p>
                                    <p className="text-sm text-gray-900">{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</p>
                                    <p className="text-xs text-gray-500">{venda.formaPagamento}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                                        venda.status === 'Finalizada' 
                                            ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                                            : venda.status === 'Ativa'
                                            ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
                                            : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                                    }`}>
                                        {venda.status === 'Finalizada' && '✅ '}
                                        {venda.status === 'Ativa' && '⏳ '}
                                        {venda.status === 'Cancelada' && '❌ '}
                                        {venda.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-soft">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Vendas</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerencie suas vendas e faturamento</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-semibold disabled:opacity-50"
                        title="Recarregar dados"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Carregando...' : 'Atualizar'}
                    </button>
                    <button
                        onClick={() => setActiveTab('nova')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Nova Venda
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <p className="text-red-800 font-medium">⚠️ {error}</p>
                        <button 
                            onClick={loadData}
                            className="text-red-700 hover:text-red-900 font-medium underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs de Navegação */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'dashboard'
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                    📊 Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('nova')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'nova'
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                    ➕ Nova Venda
                </button>
                <button
                    onClick={() => setActiveTab('lista')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'lista'
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                    📋 Lista de Vendas
                </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="animate-fade-in">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'nova' && renderNovaVenda()}
                {activeTab === 'lista' && renderListaVendas()}
            </div>
        </div>
    );
};

export default Vendas;