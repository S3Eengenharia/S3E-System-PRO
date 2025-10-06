import React from 'react';

const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

interface QuickActionsProps {
    onNavigate: (view: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center text-brand-gray-800 mb-4">
                <BoltIcon className="w-6 h-6 mr-3" />
                <h2 className="text-lg font-bold">Ações Rápidas</h2>
            </div>
            <div className="space-y-3">
                <button onClick={() => onNavigate('Materiais')} className="w-full flex justify-between items-center p-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors">
                    <span>Gerenciar Materiais</span>
                    <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onNavigate('Projetos')} className="w-full flex justify-between items-center p-3 bg-brand-gray-100 text-brand-gray-700 rounded-lg hover:bg-brand-gray-200 transition-colors">
                    <span>Novo Projeto</span>
                     <ArrowRightIcon className="w-4 h-4 text-brand-green" />
                </button>
                <button onClick={() => onNavigate('Fornecedores')} className="w-full flex justify-between items-center p-3 bg-brand-gray-100 text-brand-gray-700 rounded-lg hover:bg-brand-gray-200 transition-colors">
                    <span>Gerenciar Fornecedores</span>
                     <ArrowRightIcon className="w-4 h-4 text-brand-purple" />
                </button>
            </div>
        </div>
    );
};

export default QuickActions;