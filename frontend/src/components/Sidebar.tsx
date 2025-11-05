
import React, { useState, useEffect } from 'react';
import { navLinks, S3ELogoIcon } from '../constants';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeToggle } from './theme-toggle';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    activeView: string;
    onNavigate: (view: string) => void;
    onOpenSettings: () => void;
}

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const ArrowRightOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, activeView, onNavigate, onOpenSettings }) => {
    const { user, logout } = useContext(AuthContext)!;
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);

    useEffect(() => {
        // Carregar logo do localStorage
        const savedLogo = localStorage.getItem('companyLogo');
        if (savedLogo) {
            setCompanyLogo(savedLogo);
        }

        // Ouvir mudanças na logo
        const handleStorageChange = () => {
            const updatedLogo = localStorage.getItem('companyLogo');
            setCompanyLogo(updatedLogo);
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        logout();
    };

    return (
        <aside className={`w-64 flex flex-col bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-r border-gray-200 dark:border-dark-border fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-5 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gradient-to-r from-white to-gray-50 dark:from-dark-card dark:to-dark-bg">
                <div className="flex items-center space-x-3">
                    {companyLogo ? (
                        <div className="w-11 h-11 rounded-xl shadow-medium overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                            <img src={companyLogo} alt="Logo da Empresa" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-2.5 shadow-medium ring-2 ring-blue-100">
                            <S3ELogoIcon className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-base text-gray-900 dark:text-dark-text">S3E Engenharia</h1>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">Gestão de Estoque & Vendas</p>
                    </div>
                </div>
                <button onClick={toggleSidebar} className="lg:hidden p-2 -mr-2 text-gray-500 dark:text-dark-text-secondary rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" aria-label="Close sidebar">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-3 py-5 overflow-y-auto">
                {/* MÓDULOS PRINCIPAIS */}
                <div className="mb-6">
                    <span className="block px-2 mb-3 text-[10px] font-bold text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">Módulos Principais</span>
                    <span className="block px-3 py-1.5 mb-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider bg-gray-50 dark:bg-dark-bg rounded-lg">Geral</span>
                    <ul className="space-y-1">
                        {navLinks.slice(0, 1).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group relative
                                        ${activeView === link.name
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-medium'
                                            : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5 mr-3" />
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COMERCIAL / VENDAS */}
                <div className="mb-6">
                    <span className="block px-3 py-1.5 mb-2 text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider bg-green-50 dark:bg-green-900/20 rounded-lg">Comercial</span>
                    <ul className="space-y-1">
                        {navLinks.slice(1, 4).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group relative
                                        ${activeView === link.name
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-medium'
                                            : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5 mr-3" />
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* SUPRIMENTOS / ESTOQUE */}
                <div className="mb-6">
                    <span className="block px-3 py-1.5 mb-2 text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider bg-orange-50 dark:bg-orange-900/20 rounded-lg">Suprimentos</span>
                    <ul className="space-y-1">
                        {navLinks.slice(4, 9).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group relative
                                        ${activeView === link.name
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-medium'
                                            : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5 mr-3" />
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* OPERACIONAL / PROJETOS */}
                <div className="mb-6">
                    <span className="block px-3 py-1.5 mb-2 text-xs font-semibold text-purple-600 uppercase tracking-wider bg-purple-50 rounded-lg">Operacional</span>
                    <ul className="space-y-1">
                        {navLinks.slice(9, 12).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group relative
                                        ${activeView === link.name
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-medium'
                                            : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5 mr-3" />
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* FINANCEIRO / CONTÁBIL */}
                <div className="mb-6">
                    <span className="block px-3 py-1.5 mb-2 text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 rounded-lg">Financeiro</span>
                    <ul className="space-y-1">
                        {navLinks.slice(12).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group relative
                                        ${activeView === link.name
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-medium'
                                            : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5 mr-3" />
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                <span className="block px-3 py-1.5 mb-3 text-[10px] font-bold text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">Status do Sistema</span>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-white dark:bg-dark-card rounded-lg shadow-soft border border-gray-100 dark:border-dark-border">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-dark-text">Sistema Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gradient-to-r from-gray-50 to-white dark:from-dark-card dark:to-dark-bg">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img className="w-11 h-11 rounded-xl object-cover shadow-medium ring-2 ring-gray-100 dark:ring-dark-border" src={user?.avatar || "https://picsum.photos/100"} alt="User Avatar" />
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></span>
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-dark-text">{user?.name || 'Usuário'}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Botão de alternar tema */}
                        <div className="scale-90">
                            <ThemeToggle />
                        </div>
                        {/* Botão de configurações */}
                        <button 
                            onClick={() => {
                                onNavigate('Configurações');
                                if (window.innerWidth < 1024) toggleSidebar();
                            }} 
                            className="p-2 rounded-xl text-gray-400 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-bg hover:text-gray-600 dark:hover:text-dark-text hover:shadow-soft transition-all duration-200" 
                            title="Configurações do Sistema"
                        >
                            <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 border border-red-100 dark:border-red-800 hover:border-red-200 dark:hover:border-red-700 shadow-soft hover:shadow-medium"
                >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
