import React, { useState, useEffect } from 'react';
import ObraKanban from '../components/ObraKanban';
import { obrasService } from '../services/obrasService';

// Icons
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

const BuildingOffice2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
);

const ClipboardDocumentCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.25m-12 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-13.5 0v2.625c0 .621.504 1.125 1.125 1.125h2.625m0 0h5.625c.621 0 1.125-.504 1.125-1.125V21m-9 0h9m-12-3.75h.008v.008H4.5V15.75zm0 3h.008v.008H4.5V18.75zm3-6h.008v.008H7.5V12.75zm0 3h.008v.008H7.5V15.75zm0 3h.008v.008H7.5V18.75zm3-6h.008v.008h-.008V12.75zm0 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75zm3-6h.008v.008h-.008V12.75zm0 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75zm3-6h.008v.008H16.5V12.75zm0 3h.008v.008H16.5V15.75zm0 3h.008v.008H16.5V18.75zm3-6h.008v.008h-.008V12.75zm0 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75zm3-6h.008v.008h-.008V12.75z" />
    </svg>
);

const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
);

const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ObrasKanbanProps {
    toggleSidebar: () => void;
}

const ObrasKanbanPage: React.FC<ObrasKanbanProps> = ({ toggleSidebar }) => {
    const [isModalNovaObraOpen, setIsModalNovaObraOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Obras</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Gerencie projetos e acompanhe execução</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalNovaObraOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg font-semibold"
                >
                    <PlusIcon className="w-5 h-5" />
                    Nova Obra
                </button>
            </header>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <BuildingOffice2Icon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Total de Obras</p>
                            <p className="text-2xl font-bold text-orange-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <ClipboardDocumentCheckIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Planejamento</p>
                            <p className="text-2xl font-bold text-gray-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Em Execução</p>
                            <p className="text-2xl font-bold text-blue-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <CheckBadgeIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Controle Qualidade</p>
                            <p className="text-2xl font-bold text-purple-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Concluídas</p>
                            <p className="text-2xl font-bold text-green-600">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Valor Total</p>
                            <p className="text-xl font-bold text-emerald-600">R$ 0K</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quadro Kanban */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Quadro de Execução</h2>
                    <p className="text-sm text-gray-500 mt-1">Arraste os cards para mover entre as etapas</p>
                </div>
                <ObraKanban key={refreshKey} onRefresh={handleRefresh} />
            </div>

            {/* Modal Nova Obra (Simplificado) */}
            {isModalNovaObraOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
                                    <PlusIcon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Nova Obra</h2>
                                    <p className="text-sm text-gray-600 mt-1">Crie um novo projeto de obra</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalNovaObraOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">💡</span>
                                    <div>
                                        <p className="text-sm text-blue-900 font-medium">Modal simplificado para demonstração</p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            A implementação completa incluirá formulários detalhados para criação e edição de obras.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalNovaObraOpen(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        alert('⚙️ Funcionalidade em desenvolvimento');
                                        setIsModalNovaObraOpen(false);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 font-semibold"
                                >
                                    Criar Obra
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObrasKanbanPage;

