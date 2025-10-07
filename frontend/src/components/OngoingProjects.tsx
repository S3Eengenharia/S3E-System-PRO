import React from 'react';
import { type Project, ProjectStatus } from '../types';

const FolderOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v1" />
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
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center text-brand-gray-800 mb-4">
                <FolderOpenIcon className="w-6 h-6 mr-3" />
                <h2 className="text-lg font-bold">Projetos Ativos</h2>
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