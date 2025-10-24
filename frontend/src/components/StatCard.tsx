
import React from 'react';
import { type StatCardData } from '../types';

interface StatCardProps {
    data: StatCardData;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
    const { title, value, subtitle, icon, subtitleIcon } = data;

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm text-brand-gray-500">{title}</p>
                <p className="text-3xl font-bold text-brand-gray-800 mt-1">{value}</p>
                 <div className="flex items-center text-xs text-brand-gray-400 mt-2">
                    {subtitleIcon}
                    <span className="ml-1">{subtitle}</span>
                </div>
            </div>
            {icon}
        </div>
    );
};

export default StatCard;
