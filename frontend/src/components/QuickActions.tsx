import React from 'react';
import { BoltIcon, CubeIcon, BlueprintIcon, SupplierIcon, PlusCircleIcon, BudgetIcon } from '../constants';

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

interface QuickActionsProps {
    onNavigate: (view: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-gray-200">
            <div className="flex items-center text-brand-gray-800 mb-5">
                <BoltIcon className="w-6 h-6 mr-3 text-brand-blue" />
                <h2 className="text-lg font-bold">Ações Rápidas</h2>
            </div>
            <div className="space-y-3">
                <button 
                    onClick={() => onNavigate('Materiais')} 
                    className="w-full flex justify-between items-center p-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-all hover:shadow-md group"
                >
                    <div className="flex items-center gap-3">
                        <CubeIcon className="w-5 h-5" />
                        <span className="font-medium">Gerenciar Materiais</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                    onClick={() => onNavigate('Projetos')} 
                    className="w-full flex justify-between items-center p-3 bg-brand-gray-100 text-brand-gray-700 rounded-lg hover:bg-brand-gray-200 transition-all hover:shadow-sm group"
                >
                    <div className="flex items-center gap-3">
                        <PlusCircleIcon className="w-5 h-5 text-brand-green" />
                        <span className="font-medium">Novo Projeto</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-brand-green group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                    onClick={() => onNavigate('Orçamentos')} 
                    className="w-full flex justify-between items-center p-3 bg-brand-gray-100 text-brand-gray-700 rounded-lg hover:bg-brand-gray-200 transition-all hover:shadow-sm group"
                >
                    <div className="flex items-center gap-3">
                        <BudgetIcon className="w-5 h-5 text-brand-purple" />
                        <span className="font-medium">Criar Orçamento</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-brand-purple group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                    onClick={() => onNavigate('Fornecedores')} 
                    className="w-full flex justify-between items-center p-3 bg-brand-gray-100 text-brand-gray-700 rounded-lg hover:bg-brand-gray-200 transition-all hover:shadow-sm group"
                >
                    <div className="flex items-center gap-3">
                        <SupplierIcon className="w-5 h-5 text-brand-orange" />
                        <span className="font-medium">Gerenciar Fornecedores</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default QuickActions;