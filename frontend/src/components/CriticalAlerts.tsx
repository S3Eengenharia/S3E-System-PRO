import React, { useState, useEffect } from 'react';
import { type MaterialItem } from '../types';
import { ExclamationTriangleIcon } from '../constants';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';

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

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

interface CriticalAlertsProps {
    materials: MaterialItem[];
}

interface AlertItem {
    id: string;
    nome: string;
    sku: string;
    estoque: number;
    estoqueMinimo: number;
    diferenca: number;
}

interface AlertsData {
    estoqueBaixo: {
        titulo: string;
        nivel: string;
        itens: AlertItem[];
    };
    orcamentosVencendo?: any;
    contasVencidas?: any;
    projetosAtrasados?: any;
}

const CriticalAlerts: React.FC<CriticalAlertsProps> = ({ materials }) => {
    const [alertsData, setAlertsData] = useState<AlertsData | null>(null);
    const [loading, setLoading] = useState(false);

    // Carregar alertas da API
    const loadAlerts = async () => {
        try {
            setLoading(true);
            
            const alertasRes = await axiosApiService.get(ENDPOINTS.DASHBOARD.ALERTAS);
            
            if (alertasRes.success && alertasRes.data) {
                setAlertsData(alertasRes.data);
                console.log('🚨 Alertas carregados da API:', alertasRes.data);
            } else {
                console.warn('Falha ao carregar alertas da API, usando dados locais');
            }
        } catch (err) {
            console.error('Erro ao carregar alertas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    // Determinar quais materiais usar (API ou props)
    const criticalMaterials = alertsData?.estoqueBaixo?.itens || materials.filter(material => {
        const estoque = material.estoque || material.stock || 0;
        const estoqueMinimo = material.estoqueMinimo || material.minStock || 5;
        return estoque <= estoqueMinimo;
    });

    // Normalizar dados dos materiais críticos
    const normalizedCriticalMaterials = criticalMaterials.map((item: any) => ({
        id: item.id,
        name: item.nome || item.name,
        sku: item.sku,
        stock: item.estoque || item.stock || 0,
        minStock: item.estoqueMinimo || item.minStock || 5,
        unitOfMeasure: item.unidadeMedida || item.unitOfMeasure || 'un',
        diferenca: item.diferenca || ((item.estoque || item.stock || 0) - (item.estoqueMinimo || item.minStock || 5))
    }));

    const getUrgencyLevel = (stock: number, minStock: number) => {
        if (stock === 0) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'ESGOTADO' };
        if (stock <= minStock / 2) return { level: 'high', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'CRÍTICO' };
        return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'BAIXO' };
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-orange-100 hover:border-orange-200 card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm ring-1 ring-orange-200/50">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600"/>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Alertas Críticos</h2>
                </div>
                <div className="flex items-center gap-2">
                    {alertsData && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            API
                        </span>
                    )}
                    <button
                        onClick={loadAlerts}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Recarregar alertas"
                    >
                        <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            
            {normalizedCriticalMaterials.length === 0 ? (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm ring-1 ring-green-200/50">
                        <CubeTransparentIcon className="w-8 h-8 text-green-600"/>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">Tudo em ordem!</h3>
                    <p className="mt-1.5 text-sm text-gray-500">Nenhum item com estoque crítico</p>
                    {alertsData && (
                        <p className="text-xs text-green-600 mt-2">✅ Dados verificados via API</p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex justify-between items-center mb-4">
                        <p className='text-sm text-gray-500'>Os seguintes itens precisam de atenção imediata:</p>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            {normalizedCriticalMaterials.length} alertas
                        </span>
                    </div>
                    
                    {normalizedCriticalMaterials.map((item: any) => {
                        const urgency = getUrgencyLevel(item.stock, item.minStock);
                        
                        return (
                            <div 
                                key={item.id} 
                                className={`flex justify-between items-center p-3.5 rounded-xl border transition-all duration-200 hover:shadow-sm ${urgency.bg}`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${urgency.color} bg-white/80`}>
                                            {urgency.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Mín: {item.minStock} {item.unitOfMeasure} 
                                        {item.diferenca !== undefined && (
                                            <span className="ml-2 text-red-600 font-medium">
                                                ({item.diferenca > 0 ? '+' : ''}{item.diferenca})
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold text-xl ${urgency.color}`}>{item.stock}</span>
                                    <p className="text-xs text-gray-500 font-medium">{item.unitOfMeasure}</p>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Resumo dos alertas */}
                    <div className="mt-4 pt-4 border-t border-orange-200">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total de alertas:</span>
                            <span className="font-bold text-orange-700">{normalizedCriticalMaterials.length} itens</span>
                        </div>
                        {alertsData && (
                            <p className="text-xs text-green-600 mt-1">📡 Dados sincronizados com o backend</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CriticalAlerts;