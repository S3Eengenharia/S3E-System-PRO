
import React, { useState, useEffect } from 'react';
import { navLinks, S3ELogoIcon } from '../constants';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

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
        <aside className={`w-64 flex flex-col bg-white border-r border-brand-gray-200 fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b border-brand-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    {companyLogo ? (
                        <div className="w-10 h-10 rounded-lg shadow-md overflow-hidden flex-shrink-0">
                            <img src={companyLogo} alt="Logo da Empresa" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-brand-s3e to-blue-900 rounded-lg p-2 shadow-md">
                            <S3ELogoIcon className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-base text-brand-gray-800">S3E System</h1>
                        <p className="text-xs text-brand-gray-500">Gestão Empresarial</p>
                    </div>
                </div>
                <button onClick={toggleSidebar} className="lg:hidden p-1 -mr-2 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Close sidebar">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 px-2 py-4 overflow-y-auto">
                {/* GERAL / INÍCIO */}
                <div className="mb-4">
                    <span className="px-2 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Geral</span>
                    <ul className="mt-2 space-y-1">
                        {navLinks.slice(0, 1).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                                        ${activeView === link.name
                                            ? 'bg-brand-blue text-white'
                                            : 'text-brand-gray-600 hover:bg-brand-gray-100'
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
                <div className="mb-4">
                    <span className="px-2 text-xs font-semibold text-green-600 uppercase tracking-wider">Comercial</span>
                    <ul className="mt-2 space-y-1">
                        {navLinks.slice(1, 4).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                                        ${activeView === link.name
                                            ? 'bg-brand-blue text-white'
                                            : 'text-brand-gray-600 hover:bg-brand-gray-100'
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
                <div className="mb-4">
                    <span className="px-2 text-xs font-semibold text-orange-600 uppercase tracking-wider">Suprimentos</span>
                    <ul className="mt-2 space-y-1">
                        {navLinks.slice(4, 9).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                                        ${activeView === link.name
                                            ? 'bg-brand-blue text-white'
                                            : 'text-brand-gray-600 hover:bg-brand-gray-100'
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
                <div className="mb-4">
                    <span className="px-2 text-xs font-semibold text-purple-600 uppercase tracking-wider">Operacional</span>
                    <ul className="mt-2 space-y-1">
                        {navLinks.slice(9, 12).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                                        ${activeView === link.name
                                            ? 'bg-brand-blue text-white'
                                            : 'text-brand-gray-600 hover:bg-brand-gray-100'
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
                <div className="mb-4">
                    <span className="px-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">Financeiro</span>
                    <ul className="mt-2 space-y-1">
                        {navLinks.slice(12).map((link) => (
                            <li key={link.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(link.name);
                                    }}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                                        ${activeView === link.name
                                            ? 'bg-brand-blue text-white'
                                            : 'text-brand-gray-600 hover:bg-brand-gray-100'
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

            <div className="p-4 border-t border-brand-gray-200">
                <span className="px-2 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Status do Sistema</span>
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm text-brand-gray-600">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-brand-green mr-2"></span>
                            Sistema Online
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-brand-gray-200">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <img className="w-10 h-10 rounded-full object-cover" src={user?.avatar || "https://picsum.photos/100"} alt="User Avatar" />
                        <div>
                            <p className="font-semibold text-sm text-brand-gray-800">{user?.name || 'Usuário'}</p>
                            <p className="text-xs text-brand-gray-500">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                    <button onClick={onOpenSettings} className="p-2 rounded-full text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-gray-600" title="Configurações da Conta">
                        <Cog6ToothIcon className="w-5 h-5" />
                    </button>
                </div>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-150"
                >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
