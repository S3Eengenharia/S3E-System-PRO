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
        <div className="py-3">
            <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-brand-gray-800">{project.name}</p>
                <p className="text-sm font-medium text-brand-gray-600">{project.progress}%</p>
            </div>
            <div className="w-full bg-brand-gray-200 rounded-full h-2">
                <div className="bg-brand-blue h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
             <p className="text-xs text-brand-gray-500 mt-1">{project.status}</p>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-gray-200">
            <div className="flex items-center text-brand-gray-800 mb-4">
                <div className="bg-gradient-to-br from-brand-blue to-blue-600 p-2 rounded-lg mr-3">
                    <BlueprintIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold">Projetos em Andamento</h2>
            </div>
            <div className="divide-y divide-brand-gray-100">
                {ongoingProjects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
};

export default OngoingProjects;