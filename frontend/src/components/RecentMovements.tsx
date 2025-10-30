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

// Interface para movimentações vindas da API
interface ApiMovement {
    id: string;
    materialName: string;
    type: string;
    quantity: number;
    date: string;
    responsible: string;
    reason: string;
}

const MovementItem: React.FC<{ movement: any; stockLevel: StockLevel }> = ({ movement, stockLevel }) => {
    // Detectar se é entrada ou saída baseado no tipo
    const isEntrada = movement.type === MovementType.Entrada || movement.type === 'Entrada' || movement.type === 'ENTRADA';

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

    // Formatar data vindas da API (ISO string ou formato brasileiro)
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // Se não conseguir parsear como ISO, tentar formato brasileiro
                const [day, month, year] = dateString.split('/');
                const parsedDate = new Date(`${year}-${month}-${day}`);
                return isNaN(parsedDate.getTime()) ? dateString : parsedDate.toLocaleDateString('pt-BR');
            }
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    // Nome do material (compatível com diferentes formatos da API)
    const materialName = movement.materialName || movement.product?.name || movement.material?.nome || 'Material não identificado';

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
                        <p className="font-semibold text-gray-900">{materialName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
                        <span>{movement.quantity} unidades</span>
                        {movement.responsible && (
                            <>
                                <span>•</span>
                                <span>por {movement.responsible}</span>
                            </>
                        )}
                    </div>
                    {movement.reason && (
                        <p className="text-xs text-gray-400 ml-4">{movement.reason}</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${isEntrada ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {isEntrada ? '📥 Entrada' : '📤 Saída'}
                </span>
                <p className="text-xs text-gray-400 mt-2">{formatDate(movement.date)}</p>
            </div>
        </div>
    );
};

interface RecentMovementsProps {
    movements: any[]; // Aceitar dados da API em diferentes formatos
    materials: MaterialItem[];
}

const RecentMovements: React.FC<RecentMovementsProps> = ({ movements, materials }) => {
    
    // Função para ordenar movimentações por data (compatível com diferentes formatos)
    const sortMovementsByDate = (movs: any[]) => {
        return [...movs].sort((a, b) => {
            try {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                
                if (isNaN(dateA) || isNaN(dateB)) {
                    // Fallback para formato brasileiro
                    const parseDate = (dateString: string) => {
                        const [day, month, year] = dateString.split('/');
                        return new Date(`${year}-${month}-${day}`).getTime();
                    };
                    return parseDate(b.date) - parseDate(a.date);
                }
                
                return dateB - dateA;
            } catch {
                return 0;
            }
        });
    };
    
    const recentMovementsData = sortMovementsByDate(movements).slice(0, 5);

    const getStockLevel = (materialName: string): StockLevel => {
        // Buscar material pelo nome (já que a API pode não ter materialId)
        const material = materials.find(m => 
            m.nome === materialName || 
            m.name === materialName ||
            m.sku === materialName
        );
        
        if (!material) return StockLevel.Sufficient;
        
        // Usar diferentes propriedades dependendo da estrutura da API
        const estoque = material.estoque || material.stock || 0;
        const estoqueMinimo = material.estoqueMinimo || material.minStock || 5;
        
        if (estoque <= 0) return StockLevel.Critical;
        if (estoque <= estoqueMinimo) return StockLevel.Low;
        return StockLevel.Sufficient;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center shadow-sm ring-1 ring-purple-200/50">
                        <MovementIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Movimentações Recentes</h2>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Últimas atividades</p>
                    <p className="text-sm font-semibold text-purple-700">{movements.length} registros</p>
                </div>
            </div>
            
            <div className="divide-y divide-gray-100">
                {recentMovementsData.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📦</span>
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma movimentação recente</p>
                        <p className="text-gray-400 text-sm mt-1">As movimentações aparecerão aqui quando disponíveis</p>
                    </div>
                ) : (
                    recentMovementsData.map((movement, index) => (
                        <MovementItem 
                            key={movement.id || index} 
                            movement={movement} 
                            stockLevel={getStockLevel(movement.materialName || movement.product?.name || movement.material?.nome)} 
                        />
                    ))
                )}
            </div>
            
            {movements.length > 5 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors">
                        Ver todas as movimentações ({movements.length})
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentMovements;