import React from 'react';

export interface GanttItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  team: string;
  color: string;
}

export interface GanttChartProps {
  items: GanttItem[];
  startDate: Date;
  endDate: Date;
  onItemClick?: (item: GanttItem) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ items, startDate, endDate, onItemClick }) => {
  // Calcular dimensões
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const chartWidth = Math.max(800, totalDays * 30);
  const itemHeight = 40;
  const headerHeight = 60;
  const sidebarWidth = 200;

  // Gerar labels de dias
  const generateDayLabels = () => {
    const labels = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i <= totalDays; i++) {
      labels.push({
        date: new Date(currentDate),
        label: currentDate.getDate().toString(),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return labels;
  };

  const dayLabels = generateDayLabels();

  // Calcular posição de um item no gráfico
  const getItemPosition = (item: GanttItem) => {
    const startOffset = Math.floor((item.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      left: (startOffset / totalDays) * (chartWidth - sidebarWidth),
      width: (duration / totalDays) * (chartWidth - sidebarWidth),
      progressWidth: (item.progress / 100) * ((duration / totalDays) * (chartWidth - sidebarWidth))
    };
  };

  // Obter cor baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return '#fbbf24'; // yellow
      case 'in-progress': return '#3b82f6'; // blue
      case 'completed': return '#10b981'; // green
      case 'cancelled': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Obter cor do progresso
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'drawing': return '#8b5cf6'; // purple
      case 'in-progress': return '#06b6d4'; // cyan
      case 'completed': return '#10b981'; // green
      case 'cancelled': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="gantt-chart bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header die Chart */}
      <div className="gantt-header border-b border-gray-200">
        <div className="flex">
          {/* Sidebar Header */}
          <div 
            className="bg-gray-50 border-r border-gray-200 flex items-center px-4"
            style={{ width: sidebarWidth, height: headerHeight }}
          >
            <span className="font-semibold text-gray-700">Projeto / Equipe</span>
          </div>
          
          {/* Timeline Header */}
          <div 
            className="flex-1 overflow-x-auto"
            style={{ width: chartWidth - sidebarWidth }}
          >
            <div className="flex" style={{ width: chartWidth - sidebarWidth }}>
              {dayLabels.map((day, index) => (
                <div
                  key={index}
                  className={`border-r border-gray-200 text-center text-xs py-2 ${
                    day.isWeekend ? 'bg-gray-100' : 'bg-white'
                  }`}
                  style={{ width: (chartWidth - sidebarWidth) / dayLabels.length }}
                >
                  <div className="font-medium">{day.label}</div>
                  <div className="text-gray-500">
                    {day.date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Body */}
      <div className="gantt-body overflow-auto" style={{ maxHeight: '400px' }}>
        {items.map((item, index) => {
          const position = getItemPosition(item);
          
          return (
            <div key={item.id} className="flex border-b border-gray-100 hover:bg-gray-50">
              {/* Sidebar Item */}
              <div 
                className="flex items-center px-4 border-r border-gray-200"
                style={{ width: sidebarWidth, height: itemHeight }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.team}
                  </div>
                </div>
              </div>
              
              {/* Timeline Item */}
              <div 
                className="relative flex-1"
                style={{ width: chartWidth - sidebarWidth, height: itemHeight }}
              >
                {/* Background */}
                <div 
                  className="absolute top-2 bottom-2 rounded-md border cursor-pointer transition-all hover:shadow-md"
                  style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: getStatusColor(item.status),
                    opacity: 0.8
                  }}
                  onClick={() => onItemClick?.(item)}
                >
                  {/* Progress Bar */}
                  {item.progress > 0 && (
                    <div 
                      className="absolute top-0 left-0 bottom-0 rounded-l-md"
                      style={{
                        width: position.progressWidth,
                        backgroundColor: getProgressColor(item.status),
                        opacity: 0.9
                      }}
                    />
                  )}
                  
                  {/* Progress Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {item.progress}%
                    </span>
                  </div>
                </div>
                
                {/* Timeline Grid Lines */}
                <div className="absolute inset-0 flex">
                  {dayLabels.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-r border-gray-100"
                      style={{ width: (chartWidth - sidebarWidth) / dayLabels.length }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="gantt-legend p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400"></div>
            <span>Planejado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Cancelado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span>Progresso</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
