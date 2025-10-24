import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Import missing enums for Client type to resolve TypeScript errors.
import { type Budget, BudgetStatus, type Client, ProjectType, type Material, type BudgetMaterial, type BudgetImage, ClientType, ClientStatus, ContactPreference, ClientSource, type BudgetService, type CatalogItem, CatalogItemType } from '../types';
// Removido import de dados mock - usando API
import { apiService } from '../services/api';
import { CubeIcon } from '../constants';
import RichTextEditor from './RichTextEditor';

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
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);
const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h2.25" /></svg>;
const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>;
const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 3V9M3 12V9" /></svg>;

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
);

// Simplified in-memory list of materials for the form (usando dados vazios)
const simpleMaterialsData: Array<{id: string, name: string, price: number}> = [];

const getStatusClass = (status: BudgetStatus) => {
    switch (status) {
        case BudgetStatus.Aprovado: return 'bg-green-100 text-green-800';
        case BudgetStatus.Pendente: return 'bg-yellow-100 text-yellow-800';
        case BudgetStatus.Recusado: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface OrcamentosProps {
    toggleSidebar: () => void;
    initialBudgetId?: string | null;
    clearInitialBudgetId?: () => void;
}

interface BudgetDraft extends Partial<Budget> {
    _formState?: {
        clientSearchTerm: string;
        laborCost: string;
        discount: string;
        taxes: string;
    }
}
const DRAFT_KEY = 's3e-budget-draft';

const BudgetPrintView: React.FC<{ budget: Budget }> = ({ budget }) => (
    <>
        {/* Estilos de Impressão */}
        <style>{`
            @media print {
                @page {
                    size: A4;
                    margin: 15mm;
                }
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
                .print\\:break-inside-avoid {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .print\\:break-before {
                    break-before: page;
                    page-break-before: always;
                }
                /* Ocultar elementos não necessários na impressão */
                button, .no-print {
                    display: none !important;
                }
                /* Ajustes de cores para impressão */
                .bg-gradient-to-br, .bg-gradient-to-r {
                    background: white !important;
                    border: 1px solid #e5e7eb !important;
                }
                /* Garantir visibilidade de bordas */
                table, th, td {
                    border-color: #9ca3af !important;
                }
            }
        `}</style>
        
    <div className="relative max-w-4xl mx-auto bg-white print:shadow-none print:max-w-full">
        {/* Marca d'água - Logo S3E */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 print:opacity-10 pointer-events-none">
            <div className="text-center">
                <div className="text-9xl font-bold text-brand-blue mb-4">S3E</div>
                <div className="text-2xl font-semibold text-brand-gray-600">ENGENHARIA ELÉTRICA</div>
            </div>
        </div>
        
        {/* Conteúdo Principal */}
        <div className="relative z-10 p-8 print:p-12">
            {/* Cabeçalho Profissional */}
            <header className="mb-8 pb-6 border-b-4 border-brand-blue">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">S3E</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-brand-gray-900">S3E ENGENHARIA ELÉTRICA</h1>
                                <p className="text-sm text-brand-gray-600">Soluções Completas em Engenharia Elétrica</p>
                            </div>
                        </div>
                        <div className="text-xs text-brand-gray-600 space-y-1 mt-3">
                            <p>📧 contato@s3eengenharia.com.br | 📞 (XX) XXXX-XXXX</p>
                            <p>🌐 www.s3eengenharia.com.br</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-brand-blue text-white px-4 py-2 rounded-lg mb-2">
                            <p className="text-xs font-semibold">ORÇAMENTO Nº</p>
                            <p className="text-lg font-bold">{budget.id}</p>
                        </div>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(budget.status)}`}>
                            {budget.status}
                        </span>
                    </div>
                </div>
                
                {/* Título do Projeto */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-brand-blue mt-4">
                    <h2 className="text-xl font-bold text-brand-gray-900 mb-1">{budget.projectName}</h2>
                    <p className="text-sm text-brand-gray-600">Cliente: <span className="font-semibold text-brand-gray-800">{budget.clientName}</span></p>
                </div>
            </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 space-y-8">
                {/* Informações do Orçamento */}
                <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-xl border border-brand-gray-200">
                    <h3 className="font-bold text-brand-gray-900 mb-4 text-lg flex items-center gap-2">
                        <UserIcon className="w-6 h-6 text-brand-blue" />
                        Informações do Orçamento
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-brand-gray-200">
                            <p className="text-xs font-semibold text-brand-gray-500 uppercase mb-1">Cliente</p>
                            <p className="font-bold text-brand-gray-800">{budget.clientName}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-brand-gray-200">
                            <p className="text-xs font-semibold text-brand-gray-500 uppercase mb-1">Data de Emissão</p>
                            <p className="font-bold text-brand-gray-800">{budget.date}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-brand-gray-200 sm:col-span-2">
                            <p className="text-xs font-semibold text-brand-gray-500 uppercase mb-1">Tipo de Projeto</p>
                            <p className="font-bold text-brand-blue">{budget.projectType}</p>
                        </div>
                    </div>
                </div>
                
                {/* Descrição Técnica */}
                {budget.description && (
                    <div className="bg-white p-6 rounded-xl border-2 border-brand-blue/20">
                        <h3 className="font-bold text-brand-gray-900 mb-4 text-lg flex items-center gap-2 border-b-2 border-brand-blue pb-2">
                            <FolderIcon className="w-6 h-6 text-brand-blue" />
                            Escopo do Projeto
                        </h3>
                        <div className="prose prose-sm max-w-none">
                            <div 
                                className="text-brand-gray-700 leading-relaxed text-justify"
                                dangerouslySetInnerHTML={{ __html: budget.description }}
                            />
                        </div>
                    </div>
                )}

                {budget.materials.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border-2 border-purple-500/20">
                        <h3 className="font-bold text-brand-gray-900 mb-4 text-lg flex items-center gap-2 border-b-2 border-purple-500 pb-2">
                            <CubeIcon className="w-6 h-6 text-purple-600" />
                            Materiais e Equipamentos
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-brand-gray-700 uppercase border-b-2 border-purple-300">Item</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-brand-gray-700 uppercase border-b-2 border-purple-300">Qtd.</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-brand-gray-700 uppercase border-b-2 border-purple-300">Preço Unit.</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-brand-gray-700 uppercase border-b-2 border-purple-300">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-gray-200">
                                    {budget.materials.map((m, index) => (
                                        <tr key={m.materialId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 font-medium text-brand-gray-800">{m.name}</td>
                                            <td className="px-4 py-3 text-center font-bold text-brand-gray-700">{m.quantity}</td>
                                            <td className="px-4 py-3 text-right text-brand-gray-600">R$ {m.price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-purple-700">R$ {(m.price * m.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-purple-100 border-t-2 border-purple-300">
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-brand-gray-800 uppercase text-sm">Total Materiais:</td>
                                        <td className="px-4 py-3 text-right font-bold text-purple-700 text-lg">
                                            R$ {budget.materials.reduce((sum, m) => sum + (m.price * m.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
                
                {budget.services && budget.services.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border-2 border-green-500/20">
                        <h3 className="font-bold text-brand-gray-900 mb-4 text-lg flex items-center gap-2 border-b-2 border-green-500 pb-2">
                            <WalletIcon className="w-6 h-6 text-green-600" />
                            Serviços de Engenharia
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-brand-gray-700 uppercase border-b-2 border-green-300">Descrição do Serviço</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-brand-gray-700 uppercase border-b-2 border-green-300">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-gray-200">
                                    {budget.services.map((s, index) => (
                                        <tr key={s.serviceId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 font-medium text-brand-gray-800">{s.name}</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-700">R$ {s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-green-100 border-t-2 border-green-300">
                                        <td className="px-4 py-3 text-right font-bold text-brand-gray-800 uppercase text-sm">Total Serviços:</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">
                                            R$ {budget.services.reduce((sum, s) => sum + s.price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
                
                {budget.images.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border-2 border-orange-500/20">
                        <h3 className="font-bold text-brand-gray-900 mb-4 text-lg flex items-center gap-2 border-b-2 border-orange-500 pb-2">
                            <PaperClipIcon className="w-6 h-6 text-orange-600" />
                            Imagens de Referência
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {budget.images.map((image, index) => (
                                <div key={index} className="group">
                                    <a href={image.dataUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border-2 border-brand-gray-200">
                                        <img src={image.dataUrl} alt={image.name} className="w-full h-32 object-cover" />
                                    </a>
                                    <p className="text-xs text-brand-gray-600 mt-1 text-center truncate">{image.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Sidebar - Resumo Financeiro */}
            <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-brand-blue to-blue-600 p-6 rounded-xl shadow-xl text-white sticky top-4">
                    <h3 className="font-bold text-xl mb-6 border-b-2 border-white/30 pb-3">Resumo Financeiro</h3>
                    
                    <div className="space-y-4 text-sm mb-6">
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="font-medium">Subtotal:</span>
                            <span className="font-bold text-lg">R$ {budget.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        
                        {budget.discount > 0 && (
                            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                <span className="font-medium">Desconto:</span>
                                <span className="font-bold text-lg text-red-300">- R$ {budget.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        
                        {budget.taxes > 0 && (
                            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                <span className="font-medium">Taxas:</span>
                                <span className="font-bold text-lg">+ R$ {budget.taxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t-2 border-white/30 pt-4 mb-6">
                        <div className="bg-white text-brand-blue p-4 rounded-lg shadow-lg">
                            <p className="text-xs font-semibold mb-1 text-brand-gray-600">VALOR TOTAL</p>
                            <p className="text-3xl font-bold">R$ {budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    
                    {budget.paymentTerms && (
                        <div className="bg-white/10 p-4 rounded-lg">
                            <div className="flex items-start gap-2 mb-2">
                                <WalletIcon className="w-5 h-5 mt-0.5" />
                                <p className="text-xs font-bold uppercase">Condições de Pagamento</p>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{budget.paymentTerms}</p>
                        </div>
                    )}
                </div>
                
                {/* Validade do Orçamento */}
                <div className="mt-4 bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                    <p className="text-xs font-bold text-amber-900 mb-2">⏰ VALIDADE DO ORÇAMENTO</p>
                    <p className="text-sm text-amber-800">Este orçamento tem validade de <strong>30 dias</strong> a partir da data de emissão.</p>
                </div>
            </div>
        </div>
        
        {/* Rodapé Profissional */}
        <footer className="mt-12 pt-6 border-t-4 border-brand-blue">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs font-bold text-brand-gray-600 mb-1">📞 TELEFONE</p>
                    <p className="font-semibold text-brand-blue">(XX) XXXX-XXXX</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs font-bold text-brand-gray-600 mb-1">📧 E-MAIL</p>
                    <p className="font-semibold text-brand-blue">contato@s3eengenharia.com.br</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs font-bold text-brand-gray-600 mb-1">🌐 WEBSITE</p>
                    <p className="font-semibold text-brand-blue">www.s3eengenharia.com.br</p>
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-brand-gray-800 to-gray-700 text-white p-4 rounded-lg text-center">
                <p className="text-xs font-semibold">S3E ENGENHARIA ELÉTRICA - CNPJ XX.XXX.XXX/0001-XX</p>
                <p className="text-xs mt-1 text-gray-300">Soluções completas em projetos, instalações e manutenção elétrica</p>
            </div>
        </footer>
    </div>
    </div>
    </>
);


const Orcamentos: React.FC<OrcamentosProps> = ({ toggleSidebar, initialBudgetId, clearInitialBudgetId }) => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [services, setServices] = useState<BudgetService[]>([]);
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<BudgetStatus | 'Todos'>('Todos');

    // Carregar dados da API
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [budgetsRes, clientsRes, materialsRes, servicesRes, catalogRes] = await Promise.all([
                apiService.get<Budget[]>('/api/orcamentos'),
                apiService.get<Client[]>('/api/clientes'),
                apiService.get<Material[]>('/api/materiais'),
                apiService.get<BudgetService[]>('/api/servicos'),
                apiService.get<CatalogItem[]>('/api/catalogo')
            ]);

            if (budgetsRes.success && budgetsRes.data) setBudgets(budgetsRes.data);
            if (clientsRes.success && clientsRes.data) setClients(clientsRes.data);
            if (materialsRes.success && materialsRes.data) setMaterials(materialsRes.data);
            if (servicesRes.success && servicesRes.data) setServices(servicesRes.data);
            if (catalogRes.success && catalogRes.data) setCatalogItems(catalogRes.data);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    
    const [budgetToView, setBudgetToView] = useState<Budget | null>(null);
    const [gerandoPDF, setGerandoPDF] = useState(false);

    const [draft, setDraft] = useState<BudgetDraft | null>(null);

    const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const clientListRef = useRef<HTMLUListElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [isClientListVisible, setIsClientListVisible] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [projectType, setProjectType] = useState<ProjectType>(ProjectType.CompletoComObra);
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [projectMaterials, setProjectMaterials] = useState<BudgetMaterial[]>([]);
    const [projectServices, setProjectServices] = useState<BudgetService[]>([]);
    const [materialToAddId, setMaterialToAddId] = useState<string>('');
    const [serviceToAddId, setServiceToAddId] = useState<string>('');
    const [projectImages, setProjectImages] = useState<BudgetImage[]>([]);
    const [laborCost, setLaborCost] = useState('');
    const [discount, setDiscount] = useState('');
    const [taxes, setTaxes] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    
    // Estados para autocomplete de materiais
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [isMaterialListVisible, setIsMaterialListVisible] = useState(false);
    const [highlightedMaterialIndex, setHighlightedMaterialIndex] = useState(-1);
    const materialListRef = useRef<HTMLUListElement>(null);
    const materialAutocompleteRef = useRef<HTMLDivElement>(null);
    
    // Estados para autocomplete de itens do catálogo
    const [catalogItemSearchTerm, setCatalogItemSearchTerm] = useState('');
    const [isCatalogItemListVisible, setIsCatalogItemListVisible] = useState(false);
    const [highlightedCatalogItemIndex, setHighlightedCatalogItemIndex] = useState(-1);
    const [projectCatalogItems, setProjectCatalogItems] = useState<BudgetMaterial[]>([]);
    const catalogItemListRef = useRef<HTMLUListElement>(null);
    const catalogItemAutocompleteRef = useRef<HTMLDivElement>(null);

    const handleStatusChange = (budgetId: string, newStatus: BudgetStatus) => {
        setBudgets(prevBudgets =>
            prevBudgets.map(budget =>
                budget.id === budgetId ? { ...budget, status: newStatus } : budget
            )
        );
        setOpenDropdownId(null);
    };
    
    const parseAndValidateFloat = (val: number | string) => {
        const num = parseFloat(String(val));
        return isNaN(num) ? 0 : num;
    };
    
    const materialsSubtotal = useMemo(() => {
        return projectMaterials.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [projectMaterials]);

    const catalogItemsSubtotal = useMemo(() => {
        return projectCatalogItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [projectCatalogItems]);

    const servicesSubtotal = useMemo(() => {
        return projectServices.reduce((sum, item) => sum + item.price, 0);
    }, [projectServices]);

    const total = useMemo(() => {
        const numLaborCost = parseAndValidateFloat(laborCost);
        const numDiscount = parseAndValidateFloat(discount);
        const numTaxes = parseAndValidateFloat(taxes);
        return materialsSubtotal + catalogItemsSubtotal + servicesSubtotal + numLaborCost - numDiscount + numTaxes;
    }, [materialsSubtotal, catalogItemsSubtotal, servicesSubtotal, laborCost, discount, taxes]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setIsClientListVisible(false);
            }
            if (materialAutocompleteRef.current && !materialAutocompleteRef.current.contains(event.target as Node)) {
                setIsMaterialListVisible(false);
            }
            if (catalogItemAutocompleteRef.current && !catalogItemAutocompleteRef.current.contains(event.target as Node)) {
                setIsCatalogItemListVisible(false);
            }
            if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    useEffect(() => {
        if (!isClientListVisible) {
            setHighlightedIndex(-1);
        }
    }, [isClientListVisible]);
    
    useEffect(() => {
        if (highlightedIndex < 0 || !clientListRef.current) return;
        const list = clientListRef.current;
        const highlightedItem = list.children[highlightedIndex] as HTMLLIElement;
        if (highlightedItem) {
            highlightedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [highlightedIndex]);

    useEffect(() => {
        if (initialBudgetId && budgets.length > 0) {
            const budgetToOpen = budgets.find(b => b.id === initialBudgetId);
            if (budgetToOpen) {
                setBudgetToView(budgetToOpen);
                clearInitialBudgetId?.();
            }
        }
    }, [initialBudgetId, budgets, clearInitialBudgetId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalLaborCost = parseAndValidateFloat(laborCost);

        if (!selectedClient || !projectName || (finalLaborCost <= 0 && materialsSubtotal <= 0 && catalogItemsSubtotal <= 0 && servicesSubtotal <=0) ) {
            alert('Por favor, preencha as informações do cliente, projeto e adicione materiais, itens do catálogo, serviços ou mão de obra.');
            return;
        }

        const finalDiscount = parseAndValidateFloat(discount);
        const finalTaxes = parseAndValidateFloat(taxes);
        
        // Combinar materiais do estoque e itens do catálogo
        const allMaterials = [...projectMaterials, ...projectCatalogItems];
        
        const budgetData = {
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            projectName,
            projectType,
            description,
            materials: allMaterials,
            services: projectServices,
            images: projectImages,
            date: new Date().toLocaleDateString('pt-BR'),
            subtotal: finalLaborCost + materialsSubtotal + catalogItemsSubtotal + servicesSubtotal,
            discount: finalDiscount,
            taxes: finalTaxes,
            total,
            paymentTerms,
            status: editingBudget ? editingBudget.status : BudgetStatus.Pendente,
        };

        if (editingBudget) {
            const updatedBudget: Budget = { ...editingBudget, ...budgetData };
            setBudgets(budgets.map(b => b.id === editingBudget.id ? updatedBudget : b));
        } else {
            const newBudgetIdNumber = budgets.length + 1;
            const newBudget: Budget = {
                id: `ORC-2025-${String(newBudgetIdNumber).padStart(3, '0')}`,
                ...budgetData,
            };
            setBudgets([newBudget, ...budgets]);
            localStorage.removeItem(DRAFT_KEY);
        }
        
        handleCloseModal();
    };

    const handleOpenModal = () => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                setDraft(parsedDraft);
            } catch (error) {
                console.error("Falha ao analisar rascunho:", error);
                localStorage.removeItem(DRAFT_KEY);
            }
        }
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        setDraft(null);
        setSelectedClient(null);
        setClientSearchTerm('');
        setProjectType(ProjectType.CompletoComObra);
        setProjectName('');
        setDescription('');
        setProjectMaterials([]);
        setProjectCatalogItems([]);
        setProjectServices([]);
        setProjectImages([]);
        setLaborCost('');
        setDiscount('');
        setTaxes('');
        setPaymentTerms('');
        setMaterialSearchTerm('');
        setCatalogItemSearchTerm('');
        setIsMaterialListVisible(false);
        setIsCatalogItemListVisible(false);
    };
    
    const handleSaveDraft = () => {
        const draftData: BudgetDraft = {
            clientId: selectedClient?.id,
            clientName: selectedClient?.name,
            projectName,
            projectType,
            description,
            materials: projectMaterials,
            services: projectServices,
            images: projectImages,
            subtotal: parseAndValidateFloat(laborCost) + materialsSubtotal + servicesSubtotal,
            discount: parseAndValidateFloat(discount),
            taxes: parseAndValidateFloat(taxes),
            total,
            paymentTerms,
            _formState: {
                clientSearchTerm,
                laborCost,
                discount,
                taxes,
            }
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        alert('Rascunho salvo com sucesso!');
        handleCloseModal();
    };
    
    const handleRestoreDraft = () => {
        if (!draft) return;

        const client = clients.find(c => c.id === draft.clientId);
        if (client) {
            setSelectedClient(client);
            setClientSearchTerm(draft._formState?.clientSearchTerm || client.name);
        }

        setProjectName(draft.projectName || '');
        setProjectType(draft.projectType || ProjectType.CompletoComObra);
        setDescription(draft.description || '');
        setProjectMaterials(draft.materials || []);
        setProjectServices(draft.services || []);
        setProjectImages(draft.images || []);
        setPaymentTerms(draft.paymentTerms || '');
        
        if (draft._formState) {
            setLaborCost(draft._formState.laborCost || '');
            setDiscount(draft._formState.discount || '');
            setTaxes(draft._formState.taxes || '');
        }

        setDraft(null);
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraft(null);
    };

    const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClientSearchTerm(e.target.value);
        setSelectedClient(null);
        if (e.target.value) {
            setIsClientListVisible(true);
        } else {
            setIsClientListVisible(false);
        }
    };
    
    const handleSelectClient = (client: Client) => {
        setSelectedClient(client);
        setClientSearchTerm(client.name);
        setIsClientListVisible(false);
    };

    const handleClientSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isClientListVisible && filteredClients.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % filteredClients.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + filteredClients.length) % filteredClients.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelectClient(filteredClients[highlightedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsClientListVisible(false);
            }
        }
    };

    // Handlers para busca de materiais
    const handleMaterialSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaterialSearchTerm(e.target.value);
        if (e.target.value) {
            setIsMaterialListVisible(true);
        } else {
            setIsMaterialListVisible(false);
        }
    };

    const handleSelectMaterial = (material: typeof simpleMaterialsData[0]) => {
        if (!projectMaterials.some(pm => pm.materialId === material.id)) {
            // Calcular CMP (Custo Médio Ponderado) - simulado
            // Em produção, isso virá do backend com base no histórico de compras
            const cmp = material.price * 0.85; // Simula CMP sendo 85% do preço atual
            
            // Preço da última compra - simulado
            const lastPurchasePrice = material.price * 0.92; // Simula última compra sendo 92% do preço atual
            
            // Preço sugerido para o orçamento (última compra + 30% de margem)
            const suggestedPrice = lastPurchasePrice * 1.30;
            
            const newMaterial: BudgetMaterial = {
                materialId: material.id,
                name: material.name,
                price: Math.round(suggestedPrice * 100) / 100, // Preço orçado (editável)
                quantity: 1,
            };
            setProjectMaterials([...projectMaterials, newMaterial]);
        }
        setMaterialSearchTerm('');
        setIsMaterialListVisible(false);
    };

    const handleMaterialSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isMaterialListVisible && filteredMaterials.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedMaterialIndex(prev => (prev + 1) % filteredMaterials.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedMaterialIndex(prev => (prev - 1 + filteredMaterials.length) % filteredMaterials.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedMaterialIndex >= 0) {
                    handleSelectMaterial(filteredMaterials[highlightedMaterialIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsMaterialListVisible(false);
            }
        }
    };

    // Handlers para busca de itens do catálogo
    const handleCatalogItemSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCatalogItemSearchTerm(e.target.value);
        if (e.target.value) {
            setIsCatalogItemListVisible(true);
        } else {
            setIsCatalogItemListVisible(false);
        }
    };

    const handleSelectCatalogItem = (item: CatalogItem) => {
        if (!projectCatalogItems.some(pm => pm.materialId === item.id)) {
            const newItem: BudgetMaterial = {
                materialId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
            };
            setProjectCatalogItems([...projectCatalogItems, newItem]);
        }
        setCatalogItemSearchTerm('');
        setIsCatalogItemListVisible(false);
    };

    const handleCatalogItemSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isCatalogItemListVisible && filteredCatalogItems.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedCatalogItemIndex(prev => (prev + 1) % filteredCatalogItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedCatalogItemIndex(prev => (prev - 1 + filteredCatalogItems.length) % filteredCatalogItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedCatalogItemIndex >= 0) {
                    handleSelectCatalogItem(filteredCatalogItems[highlightedCatalogItemIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsCatalogItemListVisible(false);
            }
        }
    };

    const handleAddMaterial = () => {
        if (!materialToAddId) return;
        const material = simpleMaterialsData.find(m => m.id === materialToAddId);
        if (material && !projectMaterials.some(pm => pm.materialId === materialToAddId)) {
            const newMaterial: BudgetMaterial = {
                materialId: material.id,
                name: material.name,
                price: material.price,
                quantity: 1,
            };
            setProjectMaterials([...projectMaterials, newMaterial]);
        }
        setMaterialToAddId('');
    };
    
    // FIX: Update function parameter type for materialId to string
    const handleUpdateMaterialQuantity = (materialId: string, quantity: number) => {
        const newQuantity = Math.max(1, quantity);
        setProjectMaterials(projectMaterials.map(m =>
            m.materialId === materialId ? { ...m, quantity: newQuantity } : m
        ));
    };

    // Novo handler para atualizar o preço unitário de um material
    const handleUpdateMaterialPrice = (materialId: string, price: number) => {
        const newPrice = Math.max(0, price);
        setProjectMaterials(projectMaterials.map(m =>
            m.materialId === materialId ? { ...m, price: newPrice } : m
        ));
    };

    // FIX: Update function parameter type for materialId to string
    const handleRemoveMaterial = (materialId: string) => {
        setProjectMaterials(projectMaterials.filter(m => m.materialId !== materialId));
    };

    // Handlers para itens do catálogo
    const handleUpdateCatalogItemQuantity = (itemId: string, quantity: number) => {
        const newQuantity = Math.max(1, quantity);
        setProjectCatalogItems(projectCatalogItems.map(item =>
            item.materialId === itemId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleRemoveCatalogItem = (itemId: string) => {
        setProjectCatalogItems(projectCatalogItems.filter(item => item.materialId !== itemId));
    };

    const handleAddService = () => {
        if (!serviceToAddId) return;
        const service = services.find(s => s.id === serviceToAddId);
        if (service && !projectServices.some(ps => ps.serviceId === serviceToAddId)) {
            const newService: BudgetService = {
                serviceId: service.id,
                name: service.name,
                price: service.price,
            };
            setProjectServices([...projectServices, newService]);
        }
        setServiceToAddId('');
    };
    
    const handleRemoveService = (serviceId: string) => {
        setProjectServices(projectServices.filter(s => s.serviceId !== serviceId));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImage: BudgetImage = {
                        name: file.name,
                        dataUrl: reader.result as string,
                    };
                    setProjectImages(prev => [...prev, newImage]);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const handleRemoveImage = (indexToRemove: number) => {
        setProjectImages(projectImages.filter((_, index) => index !== indexToRemove));
    };

    const handleOpenDeleteModal = (id: string) => {
        setBudgetToDelete(id);
        setDeletePassword('');
        setDeleteError('');
        setOpenDropdownId(null);
    };
    
    const handleCloseDeleteModal = () => {
        setBudgetToDelete(null);
    };
    
    const handleConfirmDelete = () => {
        if (deletePassword === '0000') {
            setBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetToDelete));
            handleCloseDeleteModal();
        } else {
            setDeleteError('Senha incorreta. Tente novamente.');
        }
    };
    
    const handleOpenViewModal = (budget: Budget) => {
        setBudgetToView(budget);
        setOpenDropdownId(null);
    };
    
    const handleCloseViewModal = () => {
        setBudgetToView(null);
    };

    // Função para gerar PDF via backend com fallback frontend
    const handleGerarPDF = async (budget: Budget) => {
        setGerandoPDF(true);
        
        try {
            // Tentar gerar PDF via backend primeiro
            const response = await fetch(`/api/pdf/orcamento/${budget.id}/url`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success && result.data.url) {
                    // PDF gerado com sucesso via backend
                    const link = document.createElement('a');
                    link.href = result.data.url;
                    link.download = result.data.filename;
                    link.click();
                    
                    alert('PDF gerado com sucesso!');
                    return;
                }
            }
            
            // Fallback: usar impressão do navegador
            console.log('Backend PDF não disponível, usando fallback frontend');
            window.print();
            
        } catch (error) {
            console.error('Erro ao gerar PDF via backend:', error);
            
            // Fallback: usar impressão do navegador
            console.log('Erro no backend, usando fallback frontend');
            window.print();
            
        } finally {
            setGerandoPDF(false);
        }
    };

    const handleOpenEditModal = (budget: Budget) => {
        setEditingBudget(budget);
    
        const client = clients.find(c => c.id === budget.clientId);
        setSelectedClient(client || null);
        setClientSearchTerm(client ? client.name : '');
    
        setProjectName(budget.projectName);
        setProjectType(budget.projectType);
        setDescription(budget.description);
        setProjectMaterials(budget.materials);
        setProjectServices(budget.services || []);
        setProjectImages(budget.images);
        
        const materialsCost = budget.materials.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const servicesCost = (budget.services || []).reduce((sum, item) => sum + item.price, 0);
        const labor = budget.subtotal - materialsCost - servicesCost;
        setLaborCost(String(labor > 0 ? labor : ''));

        setDiscount(String(budget.discount > 0 ? budget.discount : ''));
        setTaxes(String(budget.taxes > 0 ? budget.taxes : ''));
        setPaymentTerms(budget.paymentTerms);
    
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };


    const filteredBudgets = budgets
        .filter(budget => filter === 'Todos' || budget.status === filter)
        .filter(budget =>
            budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            budget.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            budget.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

    const filteredMaterials = simpleMaterialsData.filter(material =>
        material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) &&
        !projectMaterials.some(pm => pm.materialId === material.id)
    );

    const filteredCatalogItems = catalogItems.filter(item =>
        item.name.toLowerCase().includes(catalogItemSearchTerm.toLowerCase()) &&
        !projectCatalogItems.some(pm => pm.materialId === item.id)
    );

    const availableMaterials = simpleMaterialsData.filter(
        stockMaterial => !projectMaterials.some(pm => pm.materialId === stockMaterial.id)
    );
    
    const availableServices = services.filter(
        service => !projectServices.some(ps => ps.serviceId === service.id)
    );

    return (
        <div className="p-4 sm:p-8">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Orçamentos</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de propostas e orçamentos</p>
                    </div>
                </div>
                <button 
                    onClick={handleOpenModal}
                    className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Criar Novo Orçamento
                </button>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, projeto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-gray-600">Status:</span>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as BudgetStatus | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todos</option>
                            <option value={BudgetStatus.Pendente}>Pendente</option>
                            <option value={BudgetStatus.Aprovado}>Aprovado</option>
                            <option value={BudgetStatus.Recusado}>Recusado</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredBudgets.map((budget) => (
                        <div key={budget.id} className="bg-white rounded-lg border border-brand-gray-200 shadow-sm p-4 transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-brand-blue">{budget.id}</p>
                                    <h3 className="font-bold text-lg text-brand-gray-800">{budget.projectName}</h3>
                                    <p className="text-sm text-brand-gray-500">{budget.clientName}</p>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setOpenDropdownId(budget.id === openDropdownId ? null : budget.id)} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                    {openDropdownId === budget.id && (
                                        <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                            <div className="py-1">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleOpenViewModal(budget); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">
                                                    <EyeIcon className="w-4 h-4" /> Visualizar
                                                </a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleOpenEditModal(budget); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">
                                                    <PencilIcon className="w-4 h-4" /> Editar
                                                </a>
                                            </div>
                                            <div className="py-1 border-t border-brand-gray-100">
                                                <span className="block px-4 pt-1 pb-1 text-xs text-brand-gray-500">Alterar Status</span>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(budget.id, BudgetStatus.Aprovado); }} className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                                                    <CheckCircleIcon className="w-4 h-4" /> Aprovar
                                                </a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(budget.id, BudgetStatus.Pendente); }} className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">
                                                    <ClockIcon className="w-4 h-4" /> Marcar Pendente
                                                </a>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(budget.id, BudgetStatus.Recusado); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                                                    <XCircleIcon className="w-4 h-4" /> Recusar
                                                </a>
                                            </div>
                                            <div className="py-1 border-t border-brand-gray-100">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(budget.id); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                    <TrashIcon className="w-4 h-4" /> Excluir
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div className="mt-4 pt-4 border-t border-brand-gray-100 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-brand-gray-500">Valor Total</p>
                                    <p className="text-xl font-bold text-brand-gray-800">R$ {budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-brand-gray-500 mb-1">{budget.date}</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(budget.status)}`}>
                                        {budget.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-4 max-h-[95vh] flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[95vh]">
                            {/* Header - Fixo */}
                            <div className="p-4 sm:p-6 border-b border-brand-gray-200 flex justify-between items-center flex-shrink-0 bg-gradient-to-r from-brand-blue to-blue-600">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">{editingBudget ? 'Editar Orçamento' : 'Criar Novo Orçamento'}</h2>
                                    <p className="text-xs sm:text-sm text-blue-100 mt-1">Preencha os dados abaixo para gerar o orçamento</p>
                                </div>
                                <button type="button" onClick={handleCloseModal} className="p-2 rounded-full text-white hover:bg-white/20 transition-colors">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Alerta de Rascunho */}
                            {draft && !editingBudget && (
                                <div className="mx-4 sm:mx-6 mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="w-5 h-5 text-amber-600" />
                                            <p className="font-bold text-amber-900">Rascunho Encontrado</p>
                                        </div>
                                        <p className="text-sm text-amber-700 mt-1">Você tem um rascunho salvo. Deseja continuar de onde parou?</p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button type="button" onClick={handleRestoreDraft} className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">Restaurar</button>
                                        <button type="button" onClick={handleDiscardDraft} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-amber-300 text-amber-900 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors">Descartar</button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Conteúdo - Scrollável */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-brand-gray-50">
                                {/* Fieldset 1 - Cliente e Projeto */}
                                <fieldset className="bg-white border-2 border-brand-blue/20 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <legend className="text-base sm:text-lg font-bold text-brand-blue px-3 flex items-center gap-2">
                                        <UserIcon className="w-5 h-5" />
                                        1. Cliente e Projeto
                                    </legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
                                        <div ref={autocompleteRef} className="relative">
                                            <label htmlFor="client" className="block text-sm font-semibold text-brand-gray-700 mb-2 flex items-center gap-1">
                                                <span className="text-red-500">*</span>
                                                Buscar Cliente
                                            </label>
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                                                <input 
                                                    id="client" 
                                                    type="text" 
                                                    value={clientSearchTerm} 
                                                    onChange={handleClientSearchChange} 
                                                    onFocus={() => clientSearchTerm && setIsClientListVisible(true)} 
                                                    onKeyDown={handleClientSearchKeyDown} 
                                                    placeholder="Digite o nome do cliente..." 
                                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                                                    required 
                                                    autoComplete="off" 
                                                />
                                            </div>
                                            {isClientListVisible && filteredClients.length > 0 && (
                                                <ul ref={clientListRef} className="absolute z-20 w-full bg-white border border-brand-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                                    {filteredClients.map((client, index) => (
                                                      <li 
                                                        key={client.id} 
                                                        onClick={() => handleSelectClient(client)} 
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                        className={`px-4 py-2 cursor-pointer ${highlightedIndex === index ? 'bg-brand-blue-light' : 'hover:bg-brand-blue-light'}`}
                                                      >
                                                        {client.name}
                                                      </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {selectedClient && (
                                                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <p className="text-sm font-semibold text-green-900">Cliente Selecionado</p>
                                                    </div>
                                                    <div className="text-xs text-green-800 space-y-1 ml-7">
                                                        <p><strong>📞 Telefone:</strong> {selectedClient.phone}</p>
                                                        <p><strong>📧 Email:</strong> {selectedClient.email}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="projectName" className="block text-sm font-semibold text-brand-gray-700 mb-2 flex items-center gap-1">
                                                    <span className="text-red-500">*</span>
                                                    Nome do Projeto/Serviço
                                                </label>
                                                <input 
                                                    type="text" 
                                                    id="projectName" 
                                                    value={projectName} 
                                                    onChange={(e) => setProjectName(e.target.value)} 
                                                    placeholder="ex: Instalação Elétrica Residencial" 
                                                    className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="projectType" className="block text-sm font-semibold text-brand-gray-700 mb-2 flex items-center gap-1">
                                                    <span className="text-red-500">*</span>
                                                    Tipo de Projeto
                                                </label>
                                                <select 
                                                    id="projectType" 
                                                    value={projectType} 
                                                    onChange={(e) => setProjectType(e.target.value as ProjectType)} 
                                                    className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all bg-white" 
                                                    required
                                                >
                                                    {Object.values(ProjectType).map(type => (<option key={type} value={type}>{type}</option>))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                                
                                {/* Fieldset 2 - Detalhes e Custos */}
                                <fieldset className="bg-white border-2 border-purple-500/20 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                     <legend className="text-base sm:text-lg font-bold text-purple-600 px-3 flex items-center gap-2">
                                        <WalletIcon className="w-5 h-5" />
                                        2. Detalhes e Custos
                                     </legend>
                                     <div className="pt-4 space-y-6">
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-semibold text-brand-gray-700 mb-2">
                                                Descrição do Projeto
                                            </label>
                                            <RichTextEditor
                                                value={description}
                                                onChange={setDescription}
                                                placeholder="Detalhe o escopo do serviço, observações importantes, etc..."
                                                className="w-full"
                                            />
                                        </div>
                                        
                                        {(projectType === ProjectType.Montagem || projectType === ProjectType.CompletoComObra) && (
                                            <div className="border-t-2 border-dashed border-brand-gray-300 pt-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base sm:text-lg font-bold text-brand-gray-800 flex items-center gap-2">
                                                        <CubeIcon className="w-5 h-5 text-purple-600" />
                                                        Materiais do Estoque
                                                    </h3>
                                                    {projectMaterials.length > 0 && (
                                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                            {projectMaterials.length} {projectMaterials.length === 1 ? 'item' : 'itens'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div ref={materialAutocompleteRef} className="relative">
                                                    <div className="relative">
                                                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400 z-10" />
                                                        <input 
                                                            type="text"
                                                            value={materialSearchTerm}
                                                            onChange={handleMaterialSearchChange}
                                                            onFocus={() => materialSearchTerm && setIsMaterialListVisible(true)}
                                                            onKeyDown={handleMaterialSearchKeyDown}
                                                            placeholder="🔍 Digite para buscar materiais do estoque..."
                                                            className="w-full pl-12 pr-4 py-3 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                    {isMaterialListVisible && filteredMaterials.length > 0 && (
                                                        <ul ref={materialListRef} className="absolute z-20 w-full bg-white border-2 border-purple-500 rounded-lg mt-2 max-h-60 overflow-y-auto shadow-xl">
                                                            {filteredMaterials.map((material, index) => (
                                                                <li 
                                                                    key={material.id} 
                                                                    onClick={() => handleSelectMaterial(material)} 
                                                                    onMouseEnter={() => setHighlightedMaterialIndex(index)}
                                                                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${highlightedMaterialIndex === index ? 'bg-purple-100' : 'hover:bg-purple-50'} transition-colors`}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-semibold text-brand-gray-800">{material.name}</span>
                                                                        <span className="text-sm font-bold text-purple-700">R$ {material.price.toFixed(2)}</span>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {isMaterialListVisible && filteredMaterials.length === 0 && materialSearchTerm && (
                                                        <div className="absolute z-20 w-full bg-white border-2 border-gray-300 rounded-lg mt-2 p-4 text-center text-gray-500 shadow-lg">
                                                            Nenhum material encontrado para "{materialSearchTerm}"
                                                        </div>
                                                    )}
                                                </div>
                                                {projectMaterials.length > 0 && (
                                                    <div className="space-y-4 bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                                                        <p className="text-xs text-purple-700 font-semibold">💡 Dica: Ajuste o preço orçado baseado nos custos de referência para garantir sua margem</p>
                                                        {projectMaterials.map(material => {
                                                            // Buscar dados do material original para mostrar custos de referência
                                                            const originalMaterial = simpleMaterialsData.find(m => m.id === material.materialId);
                                                            const cmp = originalMaterial ? originalMaterial.price * 0.85 : 0;
                                                            const lastPurchase = originalMaterial ? originalMaterial.price * 0.92 : 0;
                                                            const margin = material.price > 0 && cmp > 0 ? ((material.price - cmp) / cmp * 100) : 0;
                                                            
                                                            return (
                                                            <div key={material.materialId} className="p-4 rounded-lg bg-white shadow-md border-2 border-brand-gray-200">
                                                                {/* Nome do Material */}
                                                                <div className="mb-3 pb-2 border-b border-brand-gray-200">
                                                                    <h4 className="font-bold text-brand-gray-800">{material.name}</h4>
                                                                </div>
                                                                
                                                                {/* Custos de Referência */}
                                                                <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-md">
                                                                    <div>
                                                                        <p className="text-xs text-brand-gray-500 font-semibold">📊 CMP (Custo Médio)</p>
                                                                        <p className="text-sm font-bold text-blue-700">R$ {cmp.toFixed(2)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-brand-gray-500 font-semibold">🔄 Última Compra</p>
                                                                        <p className="text-sm font-bold text-purple-700">R$ {lastPurchase.toFixed(2)}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Campos Editáveis */}
                                                                <div className="grid grid-cols-12 gap-3 items-end">
                                                                    <div className="col-span-6 sm:col-span-3">
                                                                        <label className="text-xs font-semibold text-brand-gray-700 mb-1 block">Quantidade</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={material.quantity} 
                                                                            onChange={e => handleUpdateMaterialQuantity(material.materialId, parseInt(e.target.value))} 
                                                                            className="w-full px-3 py-2 border-2 border-brand-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center font-bold" 
                                                                            min="1" 
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-6 sm:col-span-3">
                                                                        <label className="text-xs font-semibold text-brand-gray-700 mb-1 block">Preço Unit. (Orçado)</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={material.price} 
                                                                            onChange={e => handleUpdateMaterialPrice(material.materialId, parseFloat(e.target.value))} 
                                                                            className="w-full px-3 py-2 border-2 border-green-500 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-600 text-center font-bold text-green-700 bg-green-50" 
                                                                            min="0" 
                                                                            step="0.01"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-8 sm:col-span-4 text-center sm:text-right">
                                                                        <p className="text-xs text-brand-gray-500 mb-1">Subtotal</p>
                                                                        <p className="text-lg font-bold text-purple-700">R$ {(material.price * material.quantity).toFixed(2)}</p>
                                                                    </div>
                                                                    <div className="col-span-4 sm:col-span-2 flex justify-end">
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleRemoveMaterial(material.materialId)} 
                                                                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4" />
                                                                            <span className="hidden sm:inline text-xs">Remover</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Indicador de Margem */}
                                                                <div className={`mt-3 p-2 rounded-md ${margin >= 20 ? 'bg-green-100' : margin >= 10 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                                                                    <p className="text-xs font-semibold">
                                                                        📈 Margem sobre CMP: <span className={`${margin >= 20 ? 'text-green-700' : margin >= 10 ? 'text-yellow-700' : 'text-red-700'}`}>
                                                                            {margin.toFixed(1)}%
                                                                        </span>
                                                                        {margin < 10 && <span className="text-red-700 ml-2">⚠️ Margem baixa!</span>}
                                                                        {margin >= 20 && <span className="text-green-700 ml-2">✓ Margem saudável</span>}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )})}
                                                        <div className="text-right pt-3 border-t-2 border-purple-300">
                                                            <span className="text-sm text-brand-gray-600 mr-2">Subtotal Materiais:</span>
                                                            <span className="text-2xl font-bold text-purple-700">R$ {materialsSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Itens do Catálogo (Kits/Produtos) - Para TODOS os tipos de projeto */}
                                        <div className="border-t-2 border-dashed border-brand-gray-300 pt-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base sm:text-lg font-bold text-brand-gray-800 flex items-center gap-2">
                                                    <FolderIcon className="w-5 h-5 text-blue-600" />
                                                    Itens do Catálogo (Kits/Produtos)
                                                </h3>
                                                {projectCatalogItems.length > 0 && (
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                        {projectCatalogItems.length} {projectCatalogItems.length === 1 ? 'item' : 'itens'}
                                                    </span>
                                                )}
                                            </div>
                                            <div ref={catalogItemAutocompleteRef} className="relative">
                                                <div className="relative">
                                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400 z-10" />
                                                    <input 
                                                        type="text"
                                                        value={catalogItemSearchTerm}
                                                        onChange={handleCatalogItemSearchChange}
                                                        onFocus={() => catalogItemSearchTerm && setIsCatalogItemListVisible(true)}
                                                        onKeyDown={handleCatalogItemSearchKeyDown}
                                                        placeholder="🔍 Digite para buscar kits ou produtos do catálogo..."
                                                        className="w-full pl-12 pr-4 py-3 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                {isCatalogItemListVisible && filteredCatalogItems.length > 0 && (
                                                    <ul ref={catalogItemListRef} className="absolute z-20 w-full bg-white border-2 border-blue-500 rounded-lg mt-2 max-h-60 overflow-y-auto shadow-xl">
                                                        {filteredCatalogItems.map((item, index) => (
                                                            <li 
                                                                key={item.id} 
                                                                onClick={() => handleSelectCatalogItem(item)} 
                                                                onMouseEnter={() => setHighlightedCatalogItemIndex(index)}
                                                                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${highlightedCatalogItemIndex === index ? 'bg-blue-100' : 'hover:bg-blue-50'} transition-colors`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                                        <span className="font-semibold text-brand-gray-800">{item.name}</span>
                                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.type === CatalogItemType.Kit ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                            {item.type === CatalogItemType.Kit ? '📦 Kit' : '🔧 Produto'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-blue-700">R$ {item.price.toFixed(2)}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {isCatalogItemListVisible && filteredCatalogItems.length === 0 && catalogItemSearchTerm && (
                                                    <div className="absolute z-20 w-full bg-white border-2 border-gray-300 rounded-lg mt-2 p-4 text-center text-gray-500 shadow-lg">
                                                        Nenhum item do catálogo encontrado para "{catalogItemSearchTerm}"
                                                    </div>
                                                )}
                                            </div>
                                            {projectCatalogItems.length > 0 && (
                                                <div className="space-y-3 bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-lg border border-blue-200">
                                                    {projectCatalogItems.map(item => (
                                                        <div key={item.materialId} className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-white shadow-sm border border-brand-gray-200">
                                                            <span className="col-span-12 sm:col-span-5 text-sm font-semibold text-brand-gray-800">{item.name}</span>
                                                            <div className="col-span-5 sm:col-span-2 flex items-center gap-2">
                                                                <label className="text-xs text-brand-gray-500">Qtd:</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={item.quantity} 
                                                                    onChange={e => handleUpdateCatalogItemQuantity(item.materialId, parseInt(e.target.value))} 
                                                                    className="w-full px-3 py-1.5 border-2 border-brand-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-bold" 
                                                                    min="1" 
                                                                />
                                                            </div>
                                                            <span className="col-span-3 sm:col-span-2 text-xs sm:text-sm text-center text-brand-gray-600">x R$ {item.price.toFixed(2)}</span>
                                                            <span className="col-span-3 sm:col-span-2 text-sm sm:text-base font-bold text-right text-blue-700">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveCatalogItem(item.materialId)} 
                                                                className="col-span-1 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors flex justify-center"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="text-right pt-2 border-t-2 border-blue-300">
                                                        <span className="text-sm text-brand-gray-600 mr-2">Subtotal Catálogo:</span>
                                                        <span className="text-xl font-bold text-blue-700">R$ {catalogItemsSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t-2 border-dashed border-brand-gray-300 pt-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base sm:text-lg font-bold text-brand-gray-800 flex items-center gap-2">
                                                    <WalletIcon className="w-5 h-5 text-green-600" />
                                                    Serviços Adicionais
                                                </h3>
                                                {projectServices.length > 0 && (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                        {projectServices.length} {projectServices.length === 1 ? 'serviço' : 'serviços'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                <select 
                                                    value={serviceToAddId} 
                                                    onChange={e => setServiceToAddId(e.target.value)} 
                                                    className="flex-grow px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                                >
                                                    <option value="">🔍 Selecione um serviço...</option>
                                                    {availableServices.map(s => (<option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>))}
                                                </select>
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddService} 
                                                    className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2" 
                                                    disabled={!serviceToAddId}
                                                >
                                                    <PlusIcon className="w-5 h-5" />
                                                    Adicionar
                                                </button>
                                            </div>
                                            {projectServices.length > 0 && (
                                                <div className="space-y-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                                    {projectServices.map(service => (
                                                        <div key={service.serviceId} className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-white shadow-sm border border-brand-gray-200">
                                                            <span className="col-span-10 sm:col-span-9 text-sm font-semibold text-brand-gray-800">{service.name}</span>
                                                            <span className="col-span-11 sm:col-span-2 text-sm sm:text-base font-bold text-right text-green-700">R$ {service.price.toFixed(2)}</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveService(service.serviceId)} 
                                                                className="col-span-1 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors flex justify-center"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="text-right pt-2 border-t-2 border-green-300">
                                                        <span className="text-sm text-brand-gray-600 mr-2">Subtotal Serviços:</span>
                                                        <span className="text-xl font-bold text-green-700">R$ {servicesSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="border-t-2 border-dashed border-brand-gray-300 pt-6">
                                            <h3 className="text-base sm:text-lg font-bold text-brand-gray-800 mb-4">Resumo Financeiro</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                              <div>
                                                  <label htmlFor="laborCost" className="block text-sm font-semibold text-brand-gray-700 mb-2">💰 Mão de Obra (R$)</label>
                                                  <input 
                                                    type="number" 
                                                    id="laborCost" 
                                                    value={laborCost} 
                                                    onChange={(e) => setLaborCost(e.target.value)} 
                                                    placeholder="0.00" 
                                                    className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" 
                                                    step="0.01" 
                                                    min="0" 
                                                  />
                                              </div>
                                              <div>
                                                  <label htmlFor="discount" className="block text-sm font-semibold text-brand-gray-700 mb-2">🏷️ Desconto (R$)</label>
                                                  <input 
                                                    type="number" 
                                                    id="discount" 
                                                    value={discount} 
                                                    onChange={(e) => setDiscount(e.target.value)} 
                                                    placeholder="0.00" 
                                                    className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" 
                                                    step="0.01" 
                                                    min="0" 
                                                  />
                                              </div>
                                              <div>
                                                  <label htmlFor="taxes" className="block text-sm font-semibold text-brand-gray-700 mb-2">📊 Taxas (R$)</label>
                                                  <input 
                                                    type="number" 
                                                    id="taxes" 
                                                    value={taxes} 
                                                    onChange={(e) => setTaxes(e.target.value)} 
                                                    placeholder="0.00" 
                                                    className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" 
                                                    step="0.01" 
                                                    min="0" 
                                                  />
                                              </div>
                                              <div className="flex items-end">
                                                <div className="w-full p-4 bg-gradient-to-br from-brand-blue to-blue-600 rounded-lg text-white shadow-lg">
                                                    <p className="text-xs font-medium mb-1">TOTAL GERAL</p>
                                                    <p className="text-2xl font-bold">
                                                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                              </div>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                                
                                {/* Fieldset 3 - Finalização */}
                                <fieldset className="bg-white border-2 border-orange-500/20 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                                     <legend className="text-base sm:text-lg font-bold text-orange-600 px-3 flex items-center gap-2">
                                        <PaperClipIcon className="w-5 h-5" />
                                        3. Finalização
                                     </legend>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-brand-gray-700 mb-3">📷 Imagens de Apresentação</label>
                                            <div className="flex flex-col gap-3">
                                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => fileInputRef.current?.click()} 
                                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                                                >
                                                    <PaperClipIcon className="w-5 h-5" />
                                                    Anexar Imagens
                                                </button>
                                            </div>
                                            {projectImages.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-xs text-brand-gray-600 mb-2">{projectImages.length} {projectImages.length === 1 ? 'imagem anexada' : 'imagens anexadas'}</p>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {projectImages.map((image, index) => (
                                                            <div key={index} className="relative group">
                                                                <img src={image.dataUrl} alt={image.name} className="w-full h-24 object-cover rounded-lg border-2 border-brand-gray-200" />
                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => handleRemoveImage(index)} 
                                                                        className="text-white p-2 bg-red-600 rounded-full hover:bg-red-700 shadow-lg"
                                                                    >
                                                                        <TrashIcon className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="paymentTerms" className="block text-sm font-semibold text-brand-gray-700 mb-2">💳 Termos de Pagamento</label>
                                            <textarea 
                                                id="paymentTerms" 
                                                value={paymentTerms} 
                                                onChange={(e) => setPaymentTerms(e.target.value)} 
                                                rows={5} 
                                                placeholder="Ex: 50% de entrada e 50% na entrega&#10;Parcelamento em até 3x sem juros&#10;Boleto ou PIX" 
                                                className="w-full px-4 py-3 border-2 border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all resize-none" 
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            {/* Footer - Fixo */}
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-gray-50 to-gray-100 border-t-2 border-brand-gray-300 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 flex-shrink-0">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal} 
                                    className="px-5 py-3 bg-white border-2 border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50 transition-colors order-3 sm:order-1"
                                >
                                    ✕ Cancelar
                                </button>
                                {!editingBudget && (
                                    <button 
                                        type="button" 
                                        onClick={handleSaveDraft} 
                                        className="px-5 py-3 bg-amber-100 border-2 border-amber-300 text-amber-900 font-semibold rounded-lg hover:bg-amber-200 transition-colors order-2 sm:order-2 flex items-center justify-center gap-2"
                                    >
                                        <ClockIcon className="w-5 h-5" />
                                        Salvar Rascunho
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    className="px-6 py-3 bg-gradient-to-r from-brand-blue to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-brand-blue/90 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all order-1 sm:order-3 flex items-center justify-center gap-2" 
                                    disabled={!selectedClient || !projectName || total <= 0}
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    {editingBudget ? 'Salvar Alterações' : 'Criar Orçamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {budgetToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-brand-gray-200">
                            <h2 className="text-xl font-bold text-brand-gray-800">Confirmar Exclusão</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-brand-gray-600">
                                Você tem certeza que deseja excluir o orçamento <strong className="text-brand-gray-800">{budgetToDelete}</strong>?
                                <br />
                                Esta ação não pode ser desfeita. Para confirmar, digite a senha.
                            </p>
                            <div>
                                <label htmlFor="delete-password" className="block text-sm font-medium text-brand-gray-700 mb-1">Senha de Confirmação (0000)</label>
                                <input
                                    id="delete-password"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => {
                                        setDeletePassword(e.target.value);
                                        setDeleteError('');
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg ${deleteError ? 'border-red-500' : 'border-brand-gray-300'}`}
                                    autoFocus
                                />
                                {deleteError && <p className="mt-1 text-xs text-red-600">{deleteError}</p>}
                            </div>
                        </div>
                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg shadow-sm hover:bg-brand-red/90"
                            >
                                Excluir Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {budgetToView && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-brand-gray-800">Detalhes do Orçamento</h2>
                                    <p className="text-sm text-brand-gray-500">{budgetToView.id}</p>
                                </div>
                                <button type="button" onClick={handleCloseViewModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto bg-brand-gray-50 p-4 sm:p-6 lg:p-8">
                                <BudgetPrintView budget={budgetToView} />
                            </div>

                            <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => budgetToView && handleGerarPDF(budgetToView)}
                                    disabled={gerandoPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {gerandoPDF ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Gerando PDF...
                                        </>
                                    ) : (
                                        <>
                                            <PrinterIcon className="w-5 h-5" />
                                            Gerar PDF
                                        </>
                                    )}
                                </button>
                                <button type="button" onClick={handleCloseViewModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="hidden print:block">
                        <BudgetPrintView budget={budgetToView} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Orcamentos;