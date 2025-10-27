import React from 'react';
import { MovementType, StockLevel, type StockMovement, type MaterialItem } from '../types';
import { MovementIcon } from '../constants';

const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const MinusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const MovementItem: React.FC<{ movement: StockMovement; stockLevel: StockLevel }> = ({ movement, stockLevel }) => {
    const isEntrada = movement.type === MovementType.Entrada;

    const stockLevelColor = {
        [StockLevel.Sufficient]: 'bg-green-500',
        [StockLevel.Low]: 'bg-yellow-400',
        [StockLevel.Critical]: 'bg-red-500',
    };
    
    const stockLevelText = {
        [StockLevel.Sufficient]: 'Suficiente',
        [StockLevel.Low]: 'Baixo',
        [StockLevel.Critical]: 'Crítico',
    };

    return (
        <div className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors duration-200">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isEntrada ? 'bg-gradient-to-br from-green-50 to-green-100 ring-1 ring-green-200/50' : 'bg-gradient-to-br from-red-50 to-red-100 ring-1 ring-red-200/50'}`}>
                    {isEntrada ? (
                        <PlusCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                        <MinusCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span 
                            className={`w-2 h-2 rounded-full ${stockLevelColor[stockLevel]}`}
                            title={`Nível de Estoque: ${stockLevelText[stockLevel]}`}
                        ></span>
                        <p className="font-semibold text-gray-900">{movement.product.name}</p>
                    </div>
                    <p className="text-sm text-gray-500 ml-4">{movement.quantity} unidades</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${isEntrada ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {movement.type}
                </span>
                <p className="text-xs text-gray-400 mt-2">{movement.date}</p>
            </div>
        </div>
    );
};

interface RecentMovementsProps {
    movements: StockMovement[];
    materials: MaterialItem[];
}

const RecentMovements: React.FC<RecentMovementsProps> = ({ movements, materials }) => {
    
    const parseDate = (dateString: string) => {
        const [day, month, year] = dateString.split('/');
        return new Date(`${year}-${month}-${day}`).getTime();
    };
    
    const recentMovementsData = [...movements]
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, 5);

    const getStockLevel = (productId: string): StockLevel => {
        const material = materials.find(m => m.id === productId);
        if (!material) return StockLevel.Sufficient; // Default if material not found
        if (material.stock <= 5) return StockLevel.Critical;
        if (material.stock <= 10) return StockLevel.Low;
        return StockLevel.Sufficient;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center shadow-sm ring-1 ring-purple-200/50">
                    <MovementIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Movimentações Recentes</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {recentMovementsData.map((movement) => (
                    <MovementItem 
                      key={movement.id} 
                      movement={movement} 
                      stockLevel={getStockLevel(movement.product.id)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentMovements;