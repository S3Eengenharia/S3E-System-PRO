import React, { useState } from 'react';
import FinanceiroDashboard from './FinanceiroDashboard';
import ContasAReceber from './ContasAReceber';
import ContasAPagar from './ContasAPagar';

// ==================== ICONS ====================
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

interface FinanceiroProps {
    toggleSidebar: () => void;
}

type AbaType = 'dashboard' | 'receber' | 'pagar';

const Financeiro: React.FC<FinanceiroProps> = ({ toggleSidebar }) => {
    const [abaAtiva, setAbaAtiva] = useState<AbaType>('dashboard');

    // Renderização condicional baseada na aba ativa
    if (abaAtiva === 'dashboard') {
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
                        onClick={() => setAbaAtiva('dashboard')}
                        className="px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-medium"
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setAbaAtiva('receber')}
                        className="px-6 py-3 rounded-xl font-semibold transition-all bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50"
                    >
                        📈 Contas a Receber
                    </button>
                    <button
                        onClick={() => setAbaAtiva('pagar')}
                        className="px-6 py-3 rounded-xl font-semibold transition-all bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50"
                    >
                        📉 Contas a Pagar
                    </button>
                </div>

                {/* Dashboard Content */}
                <div className="animate-fade-in">
                    <FinanceiroDashboard setAbaAtiva={setAbaAtiva} />
                </div>
            </div>
        );
    }

    if (abaAtiva === 'receber') {
        return <ContasAReceber setAbaAtiva={setAbaAtiva} toggleSidebar={toggleSidebar} />;
    }

    if (abaAtiva === 'pagar') {
        return <ContasAPagar setAbaAtiva={setAbaAtiva} toggleSidebar={toggleSidebar} />;
    }

    return null;
};

export default Financeiro;
