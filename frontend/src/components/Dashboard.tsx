import React from 'react';
import StatCard from './StatCard';
import RecentMovements from './RecentMovements';
import CriticalAlerts from './CriticalAlerts';
import QuickActions from './QuickActions';
import OngoingProjects from './OngoingProjects';
import { ProjectStatus, type StatCardData, type Project } from '../types';
import { 
    CubeIcon, 
    BlueprintIcon, 
    CurrencyDollarIcon, 
    ExclamationTriangleIcon, 
    TrendingUpIcon,
    CatalogIcon,
    BoltIcon
} from '../constants';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';
// Removido import de dados mock - usando API

const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);



interface DashboardProps {
    toggleSidebar: () => void;
    onNavigate: (view: string) => void;
    projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ toggleSidebar, onNavigate, projects }) => {
    // Calculate dynamic data (usando dados vazios por enquanto)
    const totalCatalogItems = 0; // Será carregado da API
    const activeProjectsCount = projects.filter(p => p.status === ProjectStatus.EmExecucao || p.status === ProjectStatus.Planejamento).length;
    const totalStockValue = 0; // Será carregado da API
    const criticalItems: any[] = []; // Será carregado da API
    const criticalAlertsCount = 0;

    // Função para testar autenticação
    const testAuth = async () => {
        try {
            const response = await axiosApiService.get(ENDPOINTS.CLIENTES);
            console.log('🔐 Teste de autenticação:', response.statusCode, response.success);
            if (response.success) {
                alert('✅ Autenticação funcionando!');
            } else {
                alert('❌ Erro na autenticação: ' + response.statusCode);
            }
        } catch (error) {
            console.error('❌ Erro no teste:', error);
            alert('❌ Erro na conexão');
        }
    };


    const statCardsData: StatCardData[] = [
        { 
            title: 'Itens no Catálogo', 
            value: totalCatalogItems.toString(), 
            subtitle: 'Produtos e Kits', 
            color: 'bg-blue-500', 
            subtitleIcon: <CatalogIcon className="w-3.5 h-3.5" />, 
            icon: <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm ring-1 ring-blue-200/50"><CatalogIcon className="w-7 h-7 text-blue-600" /></div> 
        },
        { 
            title: 'Projetos Ativos', 
            value: activeProjectsCount.toString(), 
            subtitle: 'Em andamento/planejamento', 
            color: 'bg-green-500', 
            subtitleIcon: <BoltIcon className="w-3.5 h-3.5" />, 
            icon: <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-sm ring-1 ring-green-200/50"><BlueprintIcon className="w-7 h-7 text-green-600" /></div> 
        },
        { 
            title: 'Valor do Estoque', 
            value: `R$ ${totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            subtitle: 'Total em materiais', 
            color: 'bg-purple-500', 
            subtitleIcon: <TrendingUpIcon className="w-3.5 h-3.5" />, 
            icon: <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center shadow-sm ring-1 ring-purple-200/50"><CurrencyDollarIcon className="w-7 h-7 text-purple-600" /></div> 
        },
        { 
            title: 'Alertas Críticos', 
            value: criticalAlertsCount.toString(), 
            subtitle: 'Estoque abaixo do mínimo', 
            color: 'bg-orange-500', 
            subtitleIcon: <ExclamationTriangleIcon className="w-3.5 h-3.5" />, 
            icon: <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm ring-1 ring-orange-200/50"><ExclamationTriangleIcon className="w-7 h-7 text-orange-600" /></div> 
        },
    ];
    const lastUpdate = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium'});

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {/* Header Modernizado */}
            <header className="flex justify-between items-start mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Dashboard Executivo</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Visão geral do sistema de gestão S3E</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500 font-medium">Última atualização</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{lastUpdate}</p>
                    </div>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0 ring-2 ring-white shadow-medium overflow-hidden">
                         <img className="w-full h-full object-cover" src="https://picsum.photos/100" alt="User Avatar" />
                    </div>
                </div>
            </header>

            {/* Stats Cards Grid com animação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {statCardsData.map((card, index) => (
                    <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                        <StatCard data={card} />
                    </div>
                ))}
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    <RecentMovements movements={[]} materials={[]} />
                    <OngoingProjects projects={projects} />
                </div>
                <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                    <CriticalAlerts materials={criticalItems} />
                    <QuickActions onNavigate={onNavigate} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;