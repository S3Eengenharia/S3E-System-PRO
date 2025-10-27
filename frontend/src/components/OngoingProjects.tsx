import React from 'react';
import { type Project, ProjectStatus } from '../types';
import { BlueprintIcon, BoltIcon } from '../constants';

const StatusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <div className="py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors duration-200">
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-900">{project.name}</p>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm" style={{ width: `${project.progress}%` }}></div>
            </div>
             <p className="text-xs text-gray-500 mt-2 font-medium">{project.status}</p>
        </div>
    );
};

interface OngoingProjectsProps {
    projects: Project[];
}

const OngoingProjects: React.FC<OngoingProjectsProps> = ({ projects }) => {
    const ongoingProjects = projects
        .filter(p => 
            p.status === ProjectStatus.EmExecucao || 
            p.status === ProjectStatus.Planejamento ||
            p.status === ProjectStatus.ControleQualidade
        )
        .slice(0, 3);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-sm ring-1 ring-green-200/50">
                    <BlueprintIcon className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Projetos Ativos</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {ongoingProjects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
};

export default OngoingProjects;