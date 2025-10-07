
import React, { useState, useMemo } from 'react';
import { type HistoryLog, ModuleType, ActionType } from '../types';
import { 
    ShoppingCartIcon,
    BookOpenIcon,
    ArrowPathIcon as StockIcon,
} from '../constants';
import { historyData } from '../data/mockData';

// Fix: Define icons locally because they are not exported from constants.tsx
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);

const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// FIX: Corrected broken SVG path data for PencilIcon.
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
);

const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </svg>
);

const getModuleStyle = (module: ModuleType) => {
    switch (module) {
        case ModuleType.Orçamentos: return { 
            Icon: ShoppingCartIcon, 
            dotColor: 'bg-blue-500', 
            borderColor: 'border-blue-500',
            tagClasses: 'bg-blue-100 text-blue-800'
        };
        case ModuleType.Catálogo: return { 
            Icon: BookOpenIcon, 
            dotColor: 'bg-purple-500',
            borderColor: 'border-purple-500',
            tagClasses: 'bg-purple-100 text-purple-800'
        };
        case ModuleType.Estoque: return { 
            Icon: StockIcon, 
            dotColor: 'bg-orange-500',
            borderColor: 'border-orange-500',
            tagClasses: 'bg-orange-100 text-orange-800'
        };
        default: return { 
            Icon: PencilIcon, 
            dotColor: 'bg-gray-500',
            borderColor: 'border-gray-500',
            tagClasses: 'bg-gray-100 text-gray-800'
        };
    }
};


interface HistoricoProps {
    toggleSidebar: () => void;
}

const Historico: React.FC<HistoricoProps> = ({ toggleSidebar }) => {
    const [logs] = useState<HistoryLog[]>(historyData);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState<ModuleType | 'Todos'>('Todos');
    const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

    const filteredLogs = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return logs
            .filter(log => {
                if (periodFilter === 'today') {
                    return log.timestamp >= today;
                }
                if (periodFilter === '7days') {
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 7);
                    return log.timestamp >= sevenDaysAgo;
                }
                if (periodFilter === '30days') {
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    return log.timestamp >= thirtyDaysAgo;
                }
                return true; // 'all'
            })
            .filter(log => moduleFilter === 'Todos' || log.module === moduleFilter)
            .filter(log => {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                return (
                    log.action.toLowerCase().includes(lowerCaseSearchTerm) ||
                    log.details.toLowerCase().includes(lowerCaseSearchTerm) ||
                    log.user.toLowerCase().includes(lowerCaseSearchTerm) ||
                    log.module.toLowerCase().includes(lowerCaseSearchTerm)
                );
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [logs, searchTerm, moduleFilter, periodFilter]);

    return (
         <div className="p-4 sm:p-8">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100" aria-label="Open sidebar">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Histórico de Atividades</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Log de todas as ações realizadas no sistema</p>
                    </div>
                </div>
            </header>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar no histórico..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-brand-gray-600">Módulo:</span>
                            <select 
                                value={moduleFilter} 
                                onChange={(e) => setModuleFilter(e.target.value as ModuleType | 'Todos')}
                                className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                            >
                                <option value="Todos">Todos</option>
                                {Object.values(ModuleType).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-brand-gray-600">Período:</span>
                            <select 
                                value={periodFilter} 
                                onChange={(e) => setPeriodFilter(e.target.value as 'all' | 'today' | '7days' | '30days')}
                                className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                            >
                                <option value="all">Todo o período</option>
                                <option value="today">Hoje</option>
                                <option value="7days">Últimos 7 dias</option>
                                <option value="30days">Últimos 30 dias</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flow-root">
                    <ul className="-mb-8">
                        {filteredLogs.map((log, logIdx) => {
                            const { Icon, dotColor, tagClasses } = getModuleStyle(log.module);
                            return (
                                <li key={log.id}>
                                    <div className="relative pb-8">
                                        {logIdx !== filteredLogs.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-brand-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full bg-white flex items-center justify-center ring-4 ring-white`}>
                                                   <Icon className="h-5 w-5 text-brand-gray-500" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-brand-gray-500">
                                                        <span className="font-bold text-brand-gray-800">{log.action}</span> - <span className="font-medium text-brand-gray-600">{log.details}</span>
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-4 text-xs">
                                                        <span className={`px-2 py-0.5 font-semibold rounded-full ${tagClasses}`}>{log.module}</span>
                                                         <div className="flex items-center gap-1.5">
                                                            <UserCircleIcon className="w-4 h-4 text-brand-gray-400" />
                                                            <span>{log.user}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-brand-gray-500">
                                                    <time dateTime={log.timestamp.toISOString()}>{log.timestamp.toLocaleDateString('pt-BR')} {log.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Historico;
