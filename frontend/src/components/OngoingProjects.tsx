import React, { useState, useEffect } from 'react';
import { type Project, ProjectStatus } from '../types';
import { BlueprintIcon, BoltIcon } from '../constants';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';

const StatusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

const ProjectItem: React.FC<{ project: any }> = ({ project }) => {
    // Normalizar dados do projeto (compatível com diferentes formatos da API)
    const projectName = project.titulo || project.name || project.nome || 'Projeto sem nome';
    const projectProgress = project.progresso || project.progress || 0;
    const projectStatus = project.status || 'Desconhecido';
    const clientName = project.cliente?.nome || project.client?.name || 'Cliente não informado';
    
    // Determinar cor do progresso baseado no valor
    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'from-green-500 to-green-600';
        if (progress >= 50) return 'from-yellow-500 to-yellow-600';
        if (progress >= 25) return 'from-blue-500 to-blue-600';
        return 'from-red-500 to-red-600';
    };

    // Ícone do status
    const getStatusIcon = (status: string) => {
        switch (status) {
            case ProjectStatus.EmExecucao:
            case 'EmAndamento':
            case 'Em Execução':
                return '🔧';
            case ProjectStatus.Planejamento:
                return '📋';
            case ProjectStatus.ControleQualidade:
                return '🔍';
            default:
                return '⚡';
        }
    };

    return (
        <div className="py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors duration-200">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{projectName}</p>
                    <p className="text-xs text-gray-500">{clientName}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm">{getStatusIcon(projectStatus)}</span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {projectProgress}%
                    </span>
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div 
                    className={`bg-gradient-to-r ${getProgressColor(projectProgress)} h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm`} 
                    style={{ width: `${projectProgress}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 font-medium">{projectStatus}</p>
                {project.dataFim && (
                    <p className="text-xs text-gray-400">
                        Prazo: {new Date(project.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                )}
            </div>
        </div>
    );
};

interface OngoingProjectsProps {
    projects: Project[];
}

const OngoingProjects: React.FC<OngoingProjectsProps> = ({ projects }) => {
    const [apiProjects, setApiProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Carregar projetos da API
    const loadProjects = async () => {
        try {
            setLoading(true);
            
            const projetosRes = await axiosApiService.get(ENDPOINTS.PROJETOS);
            
            if (projetosRes.success && projetosRes.data) {
                const projetosData = Array.isArray(projetosRes.data) ? projetosRes.data : [];
                setApiProjects(projetosData);
                console.log('🏗️ Projetos carregados da API:', projetosData);
            } else {
                console.warn('Falha ao carregar projetos da API, usando dados locais');
            }
        } catch (err) {
            console.error('Erro ao carregar projetos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    // Usar projetos da API se disponíveis, senão usar os props
    const allProjects = apiProjects.length > 0 ? apiProjects : projects;
    
    const ongoingProjects = allProjects
        .filter((p: any) => {
            const status = p.status;
            return status === ProjectStatus.EmExecucao || 
                   status === ProjectStatus.Planejamento ||
                   status === ProjectStatus.ControleQualidade ||
                   status === 'EmAndamento' ||
                   status === 'Em Execução' ||
                   status === 'Planejamento';
        })
        .slice(0, 4); // Mostrar até 4 projetos

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:border-gray-200 card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-sm ring-1 ring-green-200/50">
                        <BlueprintIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Projetos Ativos</h2>
                </div>
                <div className="flex items-center gap-2">
                    {apiProjects.length > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            API
                        </span>
                    )}
                    <button
                        onClick={loadProjects}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Recarregar projetos"
                    >
                        <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            
            <div className="divide-y divide-gray-100">
                {ongoingProjects.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm ring-1 ring-blue-200/50">
                            <BlueprintIcon className="w-8 h-8 text-blue-600"/>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-gray-900">Nenhum projeto ativo</h3>
                        <p className="mt-1.5 text-sm text-gray-500">Os projetos em andamento aparecerão aqui</p>
                        {apiProjects.length === 0 && projects.length === 0 && (
                            <p className="text-xs text-yellow-600 mt-2">⚠️ Verifique a conexão com o backend</p>
                        )}
                    </div>
                ) : (
                    ongoingProjects.map((project: any) => (
                        <ProjectItem key={project.id} project={project} />
                    ))
                )}
            </div>
            
            {allProjects.length > 4 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full text-green-600 hover:text-green-800 font-medium text-sm transition-colors">
                        Ver todos os projetos ({allProjects.length})
                    </button>
                </div>
            )}
            
            {/* Info sobre fonte dos dados */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Fonte dos dados:</span>
                    <span className={`font-medium ${apiProjects.length > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {apiProjects.length > 0 ? '📡 Backend API' : '💾 Dados locais'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OngoingProjects;