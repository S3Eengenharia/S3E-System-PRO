import React from 'react';
import { MovementType, StockLevel, type StockMovement, type MaterialItem } from '../types';

const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const MinusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
                {isEntrada ? (
                    <PlusCircleIcon className="w-8 h-8 text-brand-green" />
                ) : (
                    <MinusCircleIcon className="w-8 h-8 text-brand-red" />
                )}
                <div className="ml-4">
                    <div className="flex items-center">
                        <span 
                            className={`w-2.5 h-2.5 rounded-full mr-2 ${stockLevelColor[stockLevel]}`}
                            title={`Nível de Estoque: ${stockLevelText[stockLevel]}`}
                        ></span>
                        <p className="font-semibold text-brand-gray-800">{movement.product.name}</p>
                    </div>
                    <p className="text-sm text-brand-gray-500 pl-5">{movement.quantity} unidades</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${isEntrada ? 'bg-brand-gray-800 text-white' : 'bg-brand-gray-200 text-brand-gray-600'}`}>
                    {movement.type}
                </span>
                <p className="text-xs text-brand-gray-400 mt-1">{movement.date}</p>
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
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center text-brand-gray-800 mb-4">
                <CalendarDaysIcon className="w-6 h-6 mr-3" />
                <h2 className="text-lg font-bold">Movimentações Recentes</h2>
            </div>
            <div className="divide-y divide-brand-gray-100">
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