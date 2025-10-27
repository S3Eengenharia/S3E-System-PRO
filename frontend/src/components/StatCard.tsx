
import React from 'react';
import { type StatCardData } from '../types';

interface StatCardProps {
    data: StatCardData;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
    const { title, value, subtitle, icon, subtitleIcon } = data;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 flex items-center justify-between card-hover animate-slide-in-up relative overflow-hidden">
            {/* Gradiente de fundo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 pointer-events-none"></div>
            
            <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
                 <div className="flex items-center text-xs text-gray-400 mt-3 gap-1.5">
                    <span className="flex items-center gap-1">
                        {subtitleIcon}
                        {subtitle}
                    </span>
                </div>
            </div>
            
            <div className="relative z-10">
                {icon}
            </div>
        </div>
    );
};

export default StatCard;
