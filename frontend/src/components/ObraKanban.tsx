import React, { useState, useEffect } from 'react';
import { obrasService, type Obra, type ObraKanbanData } from '../services/obrasService';

// Icons
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface ObraKanbanProps {
    onRefresh?: () => void;
}

const ObraKanban: React.FC<ObraKanbanProps> = ({ onRefresh }) => {
    const [kanbanData, setKanbanData] = useState<ObraKanbanData>({
        BACKLOG: [],
        A_FAZER: [],
        ANDAMENTO: [],
        CONCLUIDO: []
    });
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState<Obra | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    useEffect(() => {
        loadObrasKanban();
    }, []);

    const loadObrasKanban = async () => {
        try {
            setLoading(true);
            const response = await obrasService.getObrasKanban();
            
            console.log('📥 Resposta de getObrasKanban:', response);
            
            if (response.success && response.data) {
                // Garantir que cada coluna seja um array
                const safeData: ObraKanbanData = {
                    BACKLOG: Array.isArray(response.data.BACKLOG) ? response.data.BACKLOG : [],
                    A_FAZER: Array.isArray(response.data.A_FAZER) ? response.data.A_FAZER : [],
                    ANDAMENTO: Array.isArray(response.data.ANDAMENTO) ? response.data.ANDAMENTO : [],
                    CONCLUIDO: Array.isArray(response.data.CONCLUIDO) ? response.data.CONCLUIDO : []
                };
                console.log('📋 Kanban carregado:', safeData);
                setKanbanData(safeData);
            } else {
                console.warn('⚠️ Resposta sem dados, inicializando kanban vazio');
            }
        } catch (error) {
            console.error('Erro ao carregar obras:', error);
            alert('❌ Erro ao carregar obras');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, obra: Obra) => {
        setDraggedItem(obra);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnStatus);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (!draggedItem) return;

        // Se não mudou de coluna, não faz nada
        if (draggedItem.status === newStatus) {
            setDraggedItem(null);
            return;
        }

        try {
            // Atualizar no backend
            const response = await obrasService.updateObraStatus(draggedItem.id, newStatus);
            
            if (response.success) {
                // Atualizar estado local
                await loadObrasKanban();
                
                if (onRefresh) onRefresh();
            } else {
                alert(`❌ ${response.error || 'Erro ao mover obra'}`);
            }
        } catch (error) {
            console.error('Erro ao mover obra:', error);
            alert('❌ Erro ao mover obra');
        } finally {
            setDraggedItem(null);
        }
    };

    const getColumnConfig = (status: string) => {
        const configs: Record<string, { title: string; color: string; bgColor: string; borderColor: string }> = {
            BACKLOG: {
                title: 'Backlog',
                color: 'text-gray-700',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-300'
            },
            A_FAZER: {
                title: 'A Fazer',
                color: 'text-blue-700',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-300'
            },
            ANDAMENTO: {
                title: 'Em Andamento',
                color: 'text-orange-700',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-300'
            },
            CONCLUIDO: {
                title: 'Concluído',
                color: 'text-green-700',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-300'
            }
        };

        return configs[status] || configs.BACKLOG;
    };

    const renderObraCard = (obra: Obra) => (
        <div
            key={obra.id}
            draggable
            onDragStart={(e) => handleDragStart(e, obra)}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 cursor-move hover:shadow-lg transition-all hover:border-blue-400"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-900 text-sm line-clamp-2 flex-1">
                    {obra.nomeObra}
                </h4>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                    #{obra.id.slice(0, 8)}
                </span>
            </div>

            {/* Cliente */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <UserIcon className="w-4 h-4" />
                <span className="truncate">{obra.clienteNome}</span>
            </div>

            {/* Data */}
            {obra.dataPrevistaFim && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <ClockIcon className="w-4 h-4" />
                    <span>{new Date(obra.dataPrevistaFim).toLocaleDateString('pt-BR')}</span>
                </div>
            )}

            {/* Progresso */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-bold text-gray-900">{obra.progresso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${obra.progresso}%` }}
                    />
                </div>
            </div>

            {/* Tarefas */}
            <div className="flex items-center gap-2 mt-3 text-xs">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                    {obra.tarefasConcluidas}/{obra.totalTarefas} tarefas
                </span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando quadro...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(kanbanData).map(([status, obras]) => {
                const config = getColumnConfig(status);
                const isOver = dragOverColumn === status;

                return (
                    <div
                        key={status}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status)}
                        className={`rounded-2xl border-2 transition-all ${
                            isOver ? 'ring-4 ring-blue-300 border-blue-400' : config.borderColor
                        }`}
                    >
                        {/* Header da Coluna */}
                        <div className={`${config.bgColor} px-4 py-3 rounded-t-xl border-b-2 ${config.borderColor}`}>
                            <h3 className={`font-bold text-sm ${config.color}`}>
                                {config.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">{obras.length} obra(s)</p>
                        </div>

                        {/* Cards de Obras */}
                        <div className="p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
                            {obras.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p className="text-sm">Nenhuma obra</p>
                                    <p className="text-xs mt-1">Arraste para cá</p>
                                </div>
                            ) : (
                                obras.map(renderObraCard)
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ObraKanban;

