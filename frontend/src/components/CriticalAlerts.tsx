import React from 'react';
import { type MaterialItem } from '../types';
import { ExclamationTriangleIcon } from '../constants';

const CubeTransparentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m3.27 6.96 8.73 5.05 8.73-5.05" />
        <path d="M12 22.08V12" />
        <path d="m14.5 10.25-2.5 1.5-2.5-1.5" />
        <path d="m14.5 17.75-2.5 1.5-2.5-1.5" />
        <path d="m3.5 14.25 5 3 5-3" />
    </svg>
);

interface CriticalAlertsProps {
    materials: MaterialItem[];
}

const CriticalAlerts: React.FC<CriticalAlertsProps> = ({ materials }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-orange-100 hover:border-orange-200 card-hover transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm ring-1 ring-orange-200/50">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-600"/>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Alertas Críticos</h2>
            </div>
            {materials.length === 0 ? (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm ring-1 ring-green-200/50">
                        <CubeTransparentIcon className="w-8 h-8 text-green-600"/>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">Tudo em ordem!</h3>
                    <p className="mt-1.5 text-sm text-gray-500">Nenhum item com estoque crítico</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className='text-sm text-gray-500 mb-4'>Os seguintes itens precisam de atenção imediata:</p>
                    {materials.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3.5 bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors duration-200">
                            <div>
                                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-xl text-red-600">{item.stock}</span>
                                <p className="text-xs text-red-500 font-medium">{item.unitOfMeasure}.</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CriticalAlerts;