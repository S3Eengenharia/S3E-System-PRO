import React, { useState, useEffect, useMemo } from 'react';
import { useContext } from 'react';
import { toast } from 'sonner';
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h16.5M6 18h12" />
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
    dataPrimeiraParcela: string;
    observacoesComerciais?: string;
    condicoesEspeciaisPagamento?: string;
}

type TabType = 'nova' | 'lista' | 'dashboard' | 'config' | 'ajuda';

const Vendas: React.FC<VendasProps> = ({ toggleSidebar }) => {
    const { user } = useContext(AuthContext)!;
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    
    // Estado para meta mensal (salvo no localStorage)
    const [metaMensal, setMetaMensal] = useState<number>(() => {
        const saved = localStorage.getItem('vendas_meta_mensal');
        return saved ? parseFloat(saved) : 100000;
    });

    // Salvar meta no localStorage quando mudar
    useEffect(() => {
        localStorage.setItem('vendas_meta_mensal', metaMensal.toString());
    }, [metaMensal]);

    // Estados para nova venda
    const [vendaForm, setVendaForm] = useState<VendaForm>({
        orcamentoId: '',
        formaPagamento: 'À vista',
        parcelas: 1,
        valorEntrada: 0,
        observacoes: '',
        dataPrimeiraParcela: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoesComerciais: '',
        condicoesEspeciaisPagamento: ''
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

    // Cálculos financeiros automáticos
    const calculosFinanceiros = useMemo(() => {
        const valorTotal = orcamentoSelecionado?.precoVenda || 0;
        const valorEntrada = vendaForm.valorEntrada || 0;
        const valorFinanciado = Math.max(0, valorTotal - valorEntrada);
        const numeroParcelas = vendaForm.parcelas || 1;
        const valorParcela = numeroParcelas > 0 ? valorFinanciado / numeroParcelas : 0;

        return {
            valorTotal,
            valorFinanciado,
            valorParcela
        };
    }, [orcamentoSelecionado, vendaForm.valorEntrada, vendaForm.parcelas]);

    // Estatísticas calculadas em TEMPO REAL
    const estatisticasVendas = useMemo(() => {
        // Calcular do zero baseado nas vendas reais
        const totalVendas = vendas.reduce((acc, venda) => acc + (venda.valorTotal || 0), 0);
        const vendasMesCount = vendas.length;
        const ticketMedio = vendasMesCount > 0 ? totalVendas / vendasMesCount : 0;
        
        // Se tiver dados do dashboard, usar como referência mas sempre calcular
        const receitaReal = dashboardData?.receitaMes || totalVendas;
        const vendasReal = dashboardData?.vendasMes || vendasMesCount;
        
        return {
            totalVendas: receitaReal,
            vendasMes: vendasReal,
            ticketMedio: vendasReal > 0 ? receitaReal / vendasReal : ticketMedio,
            metaMes: metaMensal, // Usa meta configurável
            percentualMeta: metaMensal > 0 ? (receitaReal / metaMensal) * 100 : 0
        };
    }, [dashboardData, vendas, metaMensal]);

    const formasPagamento = [
        'À vista',
        'Cartão de crédito',
        'Boleto integral',
        'Boleto parcelado'
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
                valorTotal: orcamentoSelecionado.precoVenda, // ✅ Campo obrigatório
                formaPagamento: vendaForm.formaPagamento,
                numeroParcelas: vendaForm.parcelas,
                valorEntrada: vendaForm.valorEntrada,
                valorFinanciado: calculosFinanceiros.valorFinanciado,
                dataVencimentoPrimeiraParcela: vendaForm.dataPrimeiraParcela,
                observacoes: vendaForm.observacoes,
                observacoesComerciais: vendaForm.observacoesComerciais,
                condicoesEspeciaisPagamento: vendaForm.condicoesEspeciaisPagamento
            };

            console.log('📤 Enviando dados da venda:', vendaData);

            const response = await vendasService.realizarVenda(vendaData);

            console.log('📥 Resposta do servidor:', response);

            if (response.success) {
                console.log('✅ Venda realizada com sucesso');
                toast.error(response.message || '✅ Venda registrada com sucesso!');
                
                // Resetar formulário
                setVendaForm({
                    orcamentoId: '',
                    formaPagamento: 'À vista',
                    parcelas: 1,
                    valorEntrada: 0,
                    observacoes: '',
                    dataPrimeiraParcela: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    observacoesComerciais: '',
                    condicoesEspeciaisPagamento: ''
                });
                
                // Recarregar dados
                await loadData();
                setActiveTab('lista');
            } else {
                const errorMsg = response.error || 'Erro ao registrar venda';
                console.warn('⚠️ Erro ao realizar venda:', errorMsg);
                setError(errorMsg);
                
                // Verificar se é erro de venda duplicada
                if (errorMsg.includes('Já existe uma venda')) {
                    toast.error('Venda Duplicada', {
                        description: errorMsg,
                        duration: 7000
                    });
                } else {
                    toast.error(`❌ ${errorMsg}`);
                }
            }
        } catch (err: any) {
            console.error('❌ Erro crítico ao realizar venda:', err);
            const errorMsg = err?.response?.data?.error || err?.message || 'Erro de conexão ao registrar venda';
            setError(errorMsg);
            
            if (errorMsg.includes('Já existe uma venda')) {
                toast.error('Venda Duplicada', {
                    description: errorMsg,
                    duration: 7000
                });
            } else {
                toast.error(`❌ ${errorMsg}`);
            }
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
                    <span className={`text-lg font-bold ${estatisticasVendas.percentualMeta >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                        {estatisticasVendas.percentualMeta.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                        className={`h-4 rounded-full transition-all duration-500 ${
                            estatisticasVendas.percentualMeta >= 100 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${Math.min(estatisticasVendas.percentualMeta, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>R$ {estatisticasVendas.totalVendas.toLocaleString('pt-BR')}</span>
                    <span>R$ {estatisticasVendas.metaMes.toLocaleString('pt-BR')}</span>
                </div>
                {estatisticasVendas.percentualMeta >= 100 && (
                    <div className="mt-4 bg-green-100 border border-green-300 p-3 rounded-lg">
                        <p className="text-sm text-green-800 font-semibold text-center">
                            🎉 Parabéns! Meta do mês alcançada!
                        </p>
                    </div>
                )}
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
                                        R$ {(venda.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-soft max-w-7xl mx-auto">
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-green-600 to-green-700">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-medium">
                        <CurrencyDollarIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">Nova Venda / Projeto</h2>
                        <p className="text-sm text-white/80 mt-1">
                            Converta um orçamento aprovado em venda e defina as condições financeiras
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmitVenda} className="p-6 space-y-6">
                {/* SEÇÃO 1: Seleção de Orçamento */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">📋</span>
                        Seleção do Orçamento/Projeto
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        {!vendaForm.orcamentoId && (
                            <div className="mb-4 bg-blue-50 border-2 border-blue-300 rounded-xl p-4 flex items-start gap-3">
                                <span className="text-2xl">ℹ️</span>
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">
                                        Selecione um Orçamento para Começar
                                    </p>
                                    <p className="text-xs text-blue-700">
                                        Após selecionar um orçamento aprovado, as demais seções do formulário (Informações do Projeto, Condições Financeiras, Documentos e Observações) serão exibidas automaticamente.
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Orçamento Aprovado *
                                </label>
                                <select
                                    value={vendaForm.orcamentoId}
                                    onChange={(e) => setVendaForm({...vendaForm, orcamentoId: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Selecione um orçamento aprovado para converter em venda</option>
                                    {orcamentosAprovados.map(orc => (
                                        <option key={orc.id} value={orc.id}>
                                            {orc.titulo} - {orc.cliente?.nome} - R$ {orc.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </option>
                                    ))}
                                </select>
                                {orcamentosAprovados.length === 0 && (
                                    <div className="mt-3 bg-orange-50 border-2 border-orange-300 rounded-xl p-4 flex items-start gap-3">
                                        <span className="text-2xl">⚠️</span>
                                        <div>
                                            <p className="text-sm font-semibold text-orange-900 mb-1">
                                                Nenhum Orçamento Aprovado Disponível
                                            </p>
                                            <p className="text-xs text-orange-700">
                                                Para criar uma venda, você precisa primeiro aprovar um orçamento na página de <strong>Orçamentos</strong>. Vá até lá, selecione um orçamento em status "Pendente" e aprove-o para que ele apareça aqui.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 2: Informações do Projeto (Read-Only) */}
                {orcamentoSelecionado && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">🏢</span>
                            Informações do Projeto (Herdadas)
                        </h3>
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Cliente</h4>
                                    <p className="text-gray-900 font-medium">{orcamentoSelecionado.cliente?.nome || 'N/A'}</p>
                                    <p className="text-xs text-gray-600 mt-1">{orcamentoSelecionado.cliente?.email || ''}</p>
                                </div>
                                <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Projeto</h4>
                                    <p className="text-gray-900 font-medium">{orcamentoSelecionado.titulo || 'Projeto'}</p>
                                    <p className="text-xs text-gray-600 mt-1">Nº Orçamento: {orcamentoSelecionado.numeroOrcamento || orcamentoSelecionado.id?.slice(0, 8)}</p>
                                </div>
                                <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Status</h4>
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg">
                                        ✅ Aprovado
                                    </span>
                                </div>
                                <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Endereço da Obra</h4>
                                    <p className="text-sm text-gray-900">{orcamentoSelecionado.enderecoObra || orcamentoSelecionado.cliente?.endereco || 'Não especificado'}</p>
                                </div>
                                <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Tipo de Projeto</h4>
                                    <p className="text-sm text-gray-900">{orcamentoSelecionado.tipoInstalacao || 'Instalação Elétrica'}</p>
                                </div>
                                <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Itens/Serviços</h4>
                                    <p className="text-sm text-gray-900 font-medium">{orcamentoSelecionado.items?.length || 0} item(s)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEÇÃO 3: Condições Financeiras (Inputs Ativos) */}
                {orcamentoSelecionado && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">💰</span>
                            Condições Financeiras
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                            {/* Valor Total (Read-Only) */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-6 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="text-sm font-semibold text-green-700 uppercase mb-1">Valor Total do Projeto</h4>
                                        <p className="text-xs text-gray-600">Valor herdado do orçamento aprovado</p>
                                    </div>
                                    <p className="text-4xl font-bold text-green-700">
                                        R$ {calculosFinanceiros.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Lista de Itens/Serviços (Read-Only) */}
                            {orcamentoSelecionado?.items && orcamentoSelecionado.items.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-green-600">📦</span>
                                        Itens/Serviços do Orçamento ({orcamentoSelecionado.items.length})
                                    </h4>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        {/* Header da Tabela */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 uppercase">
                                            <div className="col-span-5">Item/Serviço</div>
                                            <div className="col-span-2 text-center">Quantidade</div>
                                            <div className="col-span-2 text-right">Valor Unit.</div>
                                            <div className="col-span-3 text-right">Subtotal</div>
                                        </div>
                                        
                                        {/* Linhas de Itens */}
                                        <div className="divide-y divide-gray-200">
                                            {orcamentoSelecionado.items.map((item: any, index: number) => (
                                                <div key={index} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors">
                                                    <div className="col-span-5">
                                                        <p className="font-semibold text-gray-900">{item.nome || item.descricao || item.material?.nome || item.material?.descricao || item.servicoNome || 'Material'}</p>
                                                        {item.descricao && item.nome && (
                                                            <p className="text-xs text-gray-500 mt-1">{item.descricao}</p>
                                                        )}
                                                        {item.sku && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                                SKU: {item.sku}
                                                            </span>
                                                        )}
                                                        {/* Flag de Banco Frio */}
                                                        {(item.tipo === 'COTACAO' || item.cotacaoId) && (
                                                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                                                <span>❄️</span>
                                                                <span>Banco Frio</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-gray-900 font-medium">
                                                            {item.quantidade || item.quantity || 0}
                                                        </span>
                                                        {item.unidadeMedida && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                {item.unidadeMedida}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 text-right text-gray-900 font-semibold">
                                                        R$ {(item.precoUnit || item.valorUnitario || item.precoUnitario || item.preco || item.custoUnit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="col-span-3 text-right">
                                                        <span className="font-bold text-green-700 text-lg">
                                                            R$ {(item.subtotal || ((item.quantidade || item.quantity || 0) * (item.precoUnit || item.valorUnitario || item.precoUnitario || item.preco || item.custoUnit || 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer com Total */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-300 px-6 py-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-700">TOTAL DOS ITENS:</span>
                                                <span className="text-2xl font-bold text-green-700">
                                                    R$ {calculosFinanceiros.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Inputs de Pagamento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Número de Parcelas *
                                    </label>
                                    <input
                                        type="number"
                                        value={vendaForm.parcelas}
                                        onChange={(e) => setVendaForm({...vendaForm, parcelas: Number(e.target.value)})}
                                        min="1"
                                        max="36"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Valor de Entrada (R$)
                                    </label>
                                    <input
                                        type="number"
                                        value={vendaForm.valorEntrada}
                                        onChange={(e) => setVendaForm({...vendaForm, valorEntrada: Number(e.target.value)})}
                                        min="0"
                                        max={calculosFinanceiros.valorTotal}
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="0,00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Data da Primeira Parcela *
                                    </label>
                                    <input
                                        type="date"
                                        value={vendaForm.dataPrimeiraParcela}
                                        onChange={(e) => setVendaForm({...vendaForm, dataPrimeiraParcela: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {/* Cálculos Automáticos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                    <h4 className="text-xs font-semibold text-blue-700 uppercase mb-1">Valor Financiado</h4>
                                    <p className="text-2xl font-bold text-blue-900">
                                        R$ {calculosFinanceiros.valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Total - Entrada = Valor a parcelar
                                    </p>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">Valor da Parcela</h4>
                                    <p className="text-2xl font-bold text-purple-900">
                                        R$ {calculosFinanceiros.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {vendaForm.parcelas}x de R$ {calculosFinanceiros.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEÇÃO 4: Documentos Vinculados */}
                {orcamentoSelecionado && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">📄</span>
                            Documentos do Projeto
                        </h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Projeto Elétrico</p>
                                    <p className="text-xs text-gray-500 mt-1">Disponível no orçamento</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-700">ART/RRT</p>
                                    <p className="text-xs text-gray-500 mt-1">A ser gerado</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Laudos</p>
                                    <p className="text-xs text-gray-500 mt-1">A ser anexado</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Contrato</p>
                                    <p className="text-xs text-gray-500 mt-1">A ser gerado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEÇÃO 5: Observações e Controles */}
                {orcamentoSelecionado && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">📝</span>
                            Observações e Controles
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Observações Comerciais
                            </label>
                            <textarea
                                value={vendaForm.observacoesComerciais}
                                onChange={(e) => setVendaForm({...vendaForm, observacoesComerciais: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Informações adicionais sobre a negociação, descontos aplicados, etc..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Condições Especiais de Pagamento
                            </label>
                            <textarea
                                value={vendaForm.condicoesEspeciaisPagamento}
                                onChange={(e) => setVendaForm({...vendaForm, condicoesEspeciaisPagamento: e.target.value})}
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Ex: Pagamento mediante conclusão de etapas, bonificações, etc..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Observações Gerais
                            </label>
                            <textarea
                                value={vendaForm.observacoes}
                                onChange={(e) => setVendaForm({...vendaForm, observacoes: e.target.value})}
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Outras informações relevantes sobre a venda..."
                            />
                        </div>
                        </div>
                    </div>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
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
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processando...
                            </>
                        ) : (
                            <>
                                <CreditCardIcon className="w-5 h-5" />
                                Registrar Venda e Criar Projeto
                            </>
                        )}
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
                                        R$ {(venda.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Pago: R$ {(venda.valorPago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

    // Renderizar página de configurações
    const renderConfig = () => (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl">⚙️</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Configurações de Vendas</h2>
                        <p className="text-gray-600">Defina metas e parâmetros para o módulo de vendas</p>
                    </div>
                </div>

                {/* Configuração de Meta Mensal */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🎯</span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Meta Mensal de Vendas</h3>
                            <p className="text-sm text-gray-600">Defina o objetivo de faturamento mensal da equipe</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Valor da Meta (R$)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                    R$
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={metaMensal}
                                    onChange={(e) => setMetaMensal(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Meta Atual:</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        R$ {metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Faturado no Mês:</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        R$ {estatisticasVendas.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">
                                        {estatisticasVendas.percentualMeta.toFixed(1)}% da meta
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${
                                            estatisticasVendas.percentualMeta >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${Math.min(estatisticasVendas.percentualMeta, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setMetaMensal(100000);
                                    toast.success('Meta resetada para R$ 100.000,00');
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
                            >
                                Resetar para R$ 100.000
                            </button>
                            <button
                                onClick={() => {
                                    toast.success('Meta salva com sucesso!', {
                                        description: `Nova meta: R$ ${metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                    });
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 font-semibold"
                            >
                                💾 Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>

                {/* Informações sobre permissões */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-yellow-600 text-xl">⚠️</span>
                        <div>
                            <p className="font-semibold text-yellow-900">Apenas Administradores e Gerentes</p>
                            <p className="text-sm text-yellow-800 mt-1">
                                Somente usuários com perfil de Administrador ou Gerente podem alterar as metas mensais.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar página de ajuda (Como funcionam as métricas)
    const renderAjuda = () => (
        <div className="space-y-6">
            <div className="card-primary p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span className="text-2xl">📚</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Como Funcionam as Métricas de Vendas</h2>
                        <p className="text-gray-600 dark:text-dark-text-secondary">Entenda cada indicador e como são calculados</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Total em Vendas */}
                    <div className="border-l-4 border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 p-6 rounded-r-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-green-900 dark:text-green-300">💰 Total em Vendas</h3>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-green-300">O que é:</strong> Soma de TODOS os valores de vendas realizadas no mês atual.
                        </p>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-green-300">Como é calculado:</strong>
                        </p>
                        <div className="card-secondary p-4 rounded-lg border border-green-200 dark:border-green-800 font-mono text-sm">
                            <code className="text-gray-900 dark:text-dark-text">Total = Venda₁ + Venda₂ + Venda₃ + ... + Vendaₙ</code>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mt-3">
                            <strong className="dark:text-green-300">Exemplo:</strong> Se você fez 3 vendas de R$ 5.000, R$ 3.200 e R$ 1.800, o total será R$ 10.000.
                        </p>
                        <div className="mt-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-800 dark:text-green-300">
                                ✅ <strong>Atualização:</strong> Essa métrica atualiza automaticamente em tempo real sempre que uma nova venda é registrada!
                            </p>
                        </div>
                    </div>

                    {/* Vendas no Mês */}
                    <div className="border-l-4 border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-r-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">📊 Vendas no Mês</h3>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-blue-300">O que é:</strong> Quantidade total de vendas fechadas no mês atual.
                        </p>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-blue-300">Como é calculado:</strong>
                        </p>
                        <div className="card-secondary p-4 rounded-lg border border-blue-200 dark:border-blue-800 font-mono text-sm">
                            <code className="text-gray-900 dark:text-dark-text">Vendas no Mês = Contagem de todas as vendas registradas</code>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mt-3">
                            <strong className="dark:text-blue-300">Exemplo:</strong> Se você registrou 15 vendas este mês, o valor será 15.
                        </p>
                    </div>

                    {/* Ticket Médio */}
                    <div className="border-l-4 border-purple-500 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-r-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-300">🎫 Ticket Médio</h3>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-purple-300">O que é:</strong> Valor médio de cada venda realizada no mês.
                        </p>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-purple-300">Como é calculado:</strong>
                        </p>
                        <div className="card-secondary p-4 rounded-lg border border-purple-200 dark:border-purple-800 font-mono text-sm">
                            <code className="text-gray-900 dark:text-dark-text">Ticket Médio = Total em Vendas ÷ Vendas no Mês</code>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mt-3">
                            <strong className="dark:text-purple-300">Exemplo:</strong> Se você faturou R$ 10.000 em 5 vendas, o ticket médio é R$ 2.000.
                        </p>
                        <div className="mt-4 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="text-sm text-purple-800 dark:text-purple-300">
                                💡 <strong>Dica:</strong> Um ticket médio alto indica vendas de maior valor. Use isso para estratégias comerciais!
                            </p>
                        </div>
                    </div>

                    {/* Meta do Mês */}
                    <div className="border-l-4 border-orange-500 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20 p-6 rounded-r-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300">🎯 Meta do Mês</h3>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-orange-300">O que é:</strong> Objetivo de faturamento definido para o mês atual.
                        </p>
                        <p className="text-gray-700 dark:text-dark-text mb-3">
                            <strong className="dark:text-orange-300">Como é definida:</strong>
                        </p>
                        <div className="card-secondary p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                            <p className="text-gray-700 dark:text-dark-text">
                                A meta é configurada manualmente por Administradores ou Gerentes na aba <strong className="dark:text-orange-300">"⚙️ Configurações"</strong>.
                                O valor padrão é R$ 100.000,00, mas pode ser ajustado conforme a estratégia da empresa.
                            </p>
                        </div>
                        <p className="text-gray-700 dark:text-dark-text mt-3">
                            <strong className="dark:text-orange-300">Progresso:</strong>
                        </p>
                        <div className="card-secondary p-4 rounded-lg border border-orange-200 dark:border-orange-800 font-mono text-sm">
                            <code className="text-gray-900 dark:text-dark-text">Percentual = (Total em Vendas ÷ Meta do Mês) × 100%</code>
                        </div>
                        <div className="mt-4 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                            <p className="text-sm text-orange-800 dark:text-orange-300">
                                🔥 <strong>Meta Alcançada:</strong> Quando você atingir 100% da meta, a barra de progresso ficará verde!
                            </p>
                        </div>
                    </div>

                    {/* Resumo Rápido */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-gray-200 dark:border-dark-border p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">📋 Resumo das Fórmulas</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 card-primary p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                <span className="text-green-600 dark:text-green-400 font-bold min-w-[160px]">Total em Vendas:</span>
                                <code className="text-sm text-gray-700 dark:text-dark-text">Σ (valor de cada venda)</code>
                            </div>
                            <div className="flex items-center gap-3 card-primary p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                <span className="text-blue-600 dark:text-blue-400 font-bold min-w-[160px]">Vendas no Mês:</span>
                                <code className="text-sm text-gray-700 dark:text-dark-text">COUNT(vendas)</code>
                            </div>
                            <div className="flex items-center gap-3 card-primary p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                <span className="text-purple-600 dark:text-purple-400 font-bold min-w-[160px]">Ticket Médio:</span>
                                <code className="text-sm text-gray-700 dark:text-dark-text">Total ÷ Vendas no Mês</code>
                            </div>
                            <div className="flex items-center gap-3 card-primary p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                <span className="text-orange-600 dark:text-orange-400 font-bold min-w-[160px]">Progresso da Meta:</span>
                                <code className="text-sm text-gray-700 dark:text-dark-text">(Total ÷ Meta) × 100%</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                {(user?.role === 'admin' || user?.role === 'gerente') && (
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            activeTab === 'config'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-medium'
                                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                    >
                        ⚙️ Configurações
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('ajuda')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'ajuda'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-medium'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                >
                    ❓ Como Funcionam as Métricas
                </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="animate-fade-in">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'nova' && renderNovaVenda()}
                {activeTab === 'lista' && renderListaVendas()}
                {activeTab === 'config' && renderConfig()}
                {activeTab === 'ajuda' && renderAjuda()}
            </div>
        </div>
    );
};

export default Vendas;