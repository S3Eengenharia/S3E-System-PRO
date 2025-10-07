import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    type Project, ProjectStatus, ProjectType, 
    type User, UserRole,
    type ProjectStage, ProjectStageStatus
} from '../types';
import { obrasTeamData } from '../data/mockData';
import { UsersIcon } from '../constants';


// Icons
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>;
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const ClipboardDocumentListIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5v-1.5h-1.5v1.5zm1.5 0v-1.5c0-.828.672-1.5 1.5-1.5h1.5c.828 0 1.5.672 1.5 1.5v1.5m-3 0h3m-3 0h-1.5m1.5 0v1.5m0-1.5h1.5m-1.5 0h-1.5m6 6v-1.5m0 1.5h1.5m-1.5 0h-1.5m1.5 0v1.5m0-1.5h1.5m-1.5 0h-1.5" /></svg>;
const ViewColumnsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>;
const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.242 1.434l-1.005.827c-.294.24-.438.613-.438.995a6.473 6.473 0 010 .255c0 .382.144.755.438.995l1.005.827c.48.398.668 1.036.242 1.434l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.242-1.434l1.006-.827c.294-.24.438-.613.438-.995a6.473 6.473 0 010-.255c0-.382-.144-.755-.438-.995l-1.006-.827a1.125 1.125 0 01-.242-1.434l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>;


const KANBAN_COLUMNS = [ProjectStatus.EmExecucao, ProjectStatus.ControleQualidade, ProjectStatus.Concluido];

const columnStyles: { [key in ProjectStatus]?: { Icon: React.FC<React.SVGProps<SVGSVGElement>>, bgColor: string, textColor: string, borderColor: string } } = {
    [ProjectStatus.EmExecucao]: { Icon: Cog6ToothIcon, bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-500' },
    [ProjectStatus.ControleQualidade]: { Icon: CheckBadgeIcon, bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-500' },
    [ProjectStatus.Concluido]: { Icon: CheckCircleIcon, bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-500' },
};

const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.Planejamento: return 'bg-blue-100 text-blue-800';
        case ProjectStatus.EmExecucao: return 'bg-yellow-100 text-yellow-800';
        case ProjectStatus.ControleQualidade: return 'bg-purple-100 text-purple-800';
        case ProjectStatus.Concluido: return 'bg-green-100 text-green-800';
        case ProjectStatus.Cancelado: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getRoleClass = (role: UserRole) => {
    switch (role) {
        case UserRole.Admin: return 'bg-red-100 text-red-800';
        case UserRole.Engenheiro: return 'bg-blue-100 text-blue-800';
        case UserRole.Tecnico: return 'bg-yellow-100 text-yellow-800';
        case UserRole.DesenhistaIndustrial: return 'bg-purple-100 text-purple-800';
        case UserRole.Desenvolvedor: return 'bg-gray-800 text-white';
        default: return 'bg-gray-100 text-gray-800';
    }
}

interface ObrasProps {
    toggleSidebar: () => void;
    onViewProject: (projectId: string) => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

type TeamManagementModalMode = 'view' | 'add' | 'edit';

const Obras: React.FC<ObrasProps> = ({ toggleSidebar, onViewProject, projects, setProjects }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todos'>('Todos');
    const [obraToView, setObraToView] = useState<Project | null>(null);
    const [viewModalActiveTab, setViewModalActiveTab] = useState('overview');
    
    // Team Management State
    const [isTeamManagementModalOpen, setIsTeamManagementModalOpen] = useState(false);
    const [teamManagementMode, setTeamManagementMode] = useState<TeamManagementModalMode>('view');
    const [obrasTeam, setObrasTeam] = useState<User[]>(obrasTeamData);
    const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
    const [memberForm, setMemberForm] = useState({ name: '', email: '', role: UserRole.Tecnico });
    
    // Obra Kanban state
    const [draggingObraId, setDraggingObraId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);
    const [assignMenuOpenFor, setAssignMenuOpenFor] = useState<string | null>(null);
    const assignMenuRef = useRef<HTMLDivElement>(null);
    
    // Task Kanban state
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<ProjectStage | null>(null);
    const [taskForm, setTaskForm] = useState<{ title: string; dueDate: string; status: ProjectStageStatus, assignedMemberId: string }>({
        title: '', dueDate: '', status: ProjectStageStatus.AFazer, assignedMemberId: ''
    });
    const [draggingTask, setDraggingTask] = useState<ProjectStage | null>(null);
    const [dragOverTaskColumn, setDragOverTaskColumn] = useState<ProjectStageStatus | null>(null);
    const [openTaskOptions, setOpenTaskOptions] = useState<string | null>(null);
    const taskOptionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (taskOptionsRef.current && !taskOptionsRef.current.contains(event.target as Node)) {
                setOpenTaskOptions(null);
            }
             if (assignMenuRef.current && !assignMenuRef.current.contains(event.target as Node)) {
                setAssignMenuOpenFor(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredObras = useMemo(() => {
        return projects
            .filter(o => o.obraStarted === true)
            .filter(o => statusFilter === 'Todos' || o.status === statusFilter)
            .filter(o =>
                o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [projects, searchTerm, statusFilter]);

    const handleOpenViewModal = (obra: Project) => { setObraToView(obra); setViewModalActiveTab('overview'); };
    const handleCloseViewModal = () => setObraToView(null);

    // Team Management Handlers
    const openTeamModal = () => setIsTeamManagementModalOpen(true);
    const closeTeamModal = () => {
        setIsTeamManagementModalOpen(false);
        setTeamManagementMode('view');
        setMemberToEdit(null);
        setMemberForm({ name: '', email: '', role: UserRole.Tecnico });
    };

    const handleOpenAddMember = () => {
        setMemberToEdit(null);
        setMemberForm({ name: '', email: '', role: UserRole.Tecnico });
        setTeamManagementMode('add');
    };
    
    const handleOpenEditMember = (user: User) => {
        setMemberToEdit(user);
        setMemberForm({ name: user.name, email: user.email, role: user.role });
        setTeamManagementMode('edit');
    };
    
    const handleMemberFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (memberToEdit) {
            setObrasTeam(obrasTeam.map(u => u.id === memberToEdit.id ? { ...memberToEdit, ...memberForm } : u));
        } else {
            const newUser: User = { id: `OBR-TM-${Date.now()}`, ...memberForm };
            setObrasTeam([...obrasTeam, newUser]);
        }
        setTeamManagementMode('view');
    };

    const handleConfirmDeleteMember = () => {
        if (memberToDelete) {
            setObrasTeam(obrasTeam.filter(u => u.id !== memberToDelete.id));
            setMemberToDelete(null);
        }
    };
    
     // Obra Kanban D&D Handlers
    const handleObraDragStart = (e: React.DragEvent<HTMLDivElement>, obraId: string) => {
        setDraggingObraId(obraId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleObraDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProjectStatus) => {
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleObraDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleObraDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProjectStatus) => {
        e.preventDefault();
        if (!draggingObraId) return;

        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === draggingObraId ? { ...p, status: newStatus } : p
            )
        );
        
        setDraggingObraId(null);
        setDragOverColumn(null);
    };
    
    const handleAssignMember = (obraId: string, memberId: string) => {
        const member = obrasTeam.find(m => m.id === memberId);
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === obraId) {
                return {
                    ...p,
                    assignedObraTeamMemberId: memberId,
                    assignedObraTeamMemberName: member ? member.name : undefined,
                };
            }
            return p;
        }));
        setAssignMenuOpenFor(null);
    };


    // Task Kanban Handlers
    const handleOpenAddTaskModal = (status: ProjectStageStatus) => {
        setTaskToEdit(null);
        setTaskForm({ title: '', dueDate: '', status, assignedMemberId: '' });
        setIsTaskModalOpen(true);
    };

    const handleOpenEditTaskModal = (task: ProjectStage) => {
        setTaskToEdit(task);
        setTaskForm({ title: task.title, dueDate: task.dueDate || '', status: task.status, assignedMemberId: task.assignedMemberId || '' });
        setIsTaskModalOpen(true);
        setOpenTaskOptions(null);
    };

    const handleCloseTaskModal = () => {
        setIsTaskModalOpen(false);
        setTaskToEdit(null);
    };
    
    const handleSaveTask = () => {
        if (!obraToView || !taskForm.title) return;

        const member = obrasTeam.find(m => m.id === taskForm.assignedMemberId);

        const updatedStages = taskToEdit
            ? obraToView.stages.map(stage => stage.id === taskToEdit.id ? { ...stage, ...taskForm, dueDate: taskForm.dueDate || undefined, assignedMemberName: member?.name } : stage)
            : [...obraToView.stages, { id: `STG-${obraToView.id}-${Date.now()}`, ...taskForm, assignedMemberName: member?.name, dueDate: taskForm.dueDate || undefined }];
        
        const updatedProject = { ...obraToView, stages: updatedStages };
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setObraToView(updatedProject); 
        handleCloseTaskModal();
    };
    
    const handleUpdateTaskStatus = (taskId: string, newStatusOrHighlight: 'Concluido' | 'Em Andamento' | 'paused' | 'cancelled') => {
        if (!obraToView) return;
    
        const updatedStages = obraToView.stages.map(task => {
            if (task.id === taskId) {
                switch (newStatusOrHighlight) {
                    case 'Concluido':
                        return { ...task, status: ProjectStageStatus.Concluido, highlight: null };
                    case 'Em Andamento':
                        return { ...task, status: ProjectStageStatus.EmAndamento, highlight: null };
                    case 'paused':
                    case 'cancelled':
                        return { ...task, highlight: newStatusOrHighlight };
                    default:
                        return task;
                }
            }
            return task;
        });
    
        const updatedProject = { ...obraToView, stages: updatedStages };
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setObraToView(updatedProject);
        setOpenTaskOptions(null);
    };
    
    const getTaskCardClasses = (task: ProjectStage) => {
        const base = 'p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing border-l-4'
        if (task.highlight === 'paused') {
            return `${base} bg-yellow-50 border-yellow-400`;
        }
        if (task.highlight === 'cancelled') {
            return `${base} bg-red-50 border-red-400 line-through opacity-70`;
        }
        switch (task.status) {
            case ProjectStageStatus.Concluido:
                return `${base} bg-green-50 border-green-500 opacity-80`;
            case ProjectStageStatus.EmAndamento:
                return `${base} bg-white border-blue-500`;
            case ProjectStageStatus.AFazer:
                return `${base} bg-white border-gray-400`;
            default:
                return `${base} bg-white border-gray-400`;
        }
    };

    const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, task: ProjectStage) => { setDraggingTask(task); e.dataTransfer.effectAllowed = 'move'; };
    const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProjectStageStatus) => { e.preventDefault(); if (draggingTask && draggingTask.status !== status) setDragOverTaskColumn(status); };
    const handleTaskDragLeave = () => setDragOverTaskColumn(null);
    const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProjectStageStatus) => {
        e.preventDefault();
        if (!draggingTask || !obraToView || draggingTask.status === newStatus) return;

        const updatedStages = obraToView.stages.map(stage => stage.id === draggingTask.id ? { ...stage, status: newStatus, highlight: null } : stage);
        const updatedProject = { ...obraToView, stages: updatedStages };
        setProjects(projects.map(p => (p.id === updatedProject.id ? updatedProject : p)));
        setObraToView(updatedProject);
        setDraggingTask(null);
        setDragOverTaskColumn(null);
    };
    const handleTaskDragEnd = () => { setDraggingTask(null); setDragOverTaskColumn(null); };


    return (
        <div className="p-4 sm:p-8 flex flex-col h-full bg-brand-gray-50">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Kanban de Obras</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Acompanhamento de obras e equipes de campo</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <div className="relative w-full sm:max-w-xs">
                        <input type="text" placeholder="Buscar por obra ou cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border bg-white border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <button onClick={openTeamModal} className="flex items-center justify-center bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-gray-50 transition-colors">
                        <UsersIcon className="w-5 h-5 mr-2" />
                        Equipe
                    </button>
                </div>
            </header>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
                {KANBAN_COLUMNS.map(status => {
                    const style = columnStyles[status];
                    const Icon = style?.Icon || 'div';
                    return (
                        <div key={status} onDragOver={(e) => handleObraDragOver(e, status)} onDragLeave={handleObraDragLeave} onDrop={(e) => handleObraDrop(e, status)} className={`rounded-xl flex flex-col ${style?.bgColor || 'bg-brand-gray-100'} transition-colors ${dragOverColumn === status ? 'ring-2 ring-brand-blue' : ''}`}>
                            <div className={`flex items-center gap-3 p-4 border-b-2 ${style?.borderColor}`}>
                                <Icon className={`w-6 h-6 ${style?.textColor}`} />
                                <h2 className={`font-bold text-lg ${style?.textColor}`}>{status}</h2>
                                <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${style?.textColor} ${style?.bgColor?.replace('100', '200')}`}>{filteredObras.filter(o => o.status === status).length}</span>
                            </div>
                            <div className="p-4 space-y-4 overflow-y-auto flex-grow h-0">
                                {filteredObras.filter(o => o.status === status).map(obra => {
                                    const progress = obra.stages.length > 0 ? Math.round((obra.stages.filter(s => s.status === ProjectStageStatus.Concluido).length / obra.stages.length) * 100) : 0;
                                    const assignedMember = obrasTeam.find(m => m.id === obra.assignedObraTeamMemberId);
                                    return (
                                        <div key={obra.id} draggable onDragStart={(e) => handleObraDragStart(e, obra.id)} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${style?.borderColor} cursor-grab active:cursor-grabbing`}>
                                            <h3 className="font-bold text-brand-gray-800">{obra.name}</h3>
                                            <p className="text-sm text-brand-gray-600 mb-3">{obra.clientName}</p>
                                            
                                            <div className="text-xs text-brand-gray-500 mb-1">Progresso: {progress}%</div>
                                            <div className="w-full bg-brand-gray-200 rounded-full h-2 mb-4">
                                                <div className="bg-brand-blue h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-brand-gray-100 flex justify-between items-center">
                                                <button onClick={() => handleOpenViewModal(obra)} className="text-sm font-semibold text-brand-blue hover:underline">
                                                    Ver Detalhes
                                                </button>
                                                <div className="relative">
                                                     <button onClick={() => setAssignMenuOpenFor(obra.id === assignMenuOpenFor ? null : obra.id)} className="w-8 h-8 rounded-full bg-brand-gray-100 flex items-center justify-center hover:bg-brand-gray-200">
                                                        {assignedMember ? (
                                                            <span className="font-bold text-brand-blue">{assignedMember.name.charAt(0)}</span>
                                                        ) : (
                                                            <UserPlusIcon className="w-5 h-5 text-brand-gray-500" />
                                                        )}
                                                    </button>
                                                    {assignMenuOpenFor === obra.id && (
                                                        <div ref={assignMenuRef} className="origin-top-right absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                                            <div className="p-2">
                                                                <span className="block px-2 pb-1 text-xs text-brand-gray-500">Atribuir a:</span>
                                                                {obrasTeam.map(member => (
                                                                    <a href="#" key={member.id} onClick={(e) => { e.preventDefault(); handleAssignMember(obra.id, member.id); }} className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-brand-gray-700 hover:bg-brand-gray-100 rounded-md">
                                                                        <div className="w-6 h-6 rounded-full bg-brand-gray-200 text-brand-gray-600 text-xs font-bold flex items-center justify-center">{member.name.charAt(0)}</div>
                                                                        <span>{member.name}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {obraToView && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-gray-900">{obraToView.name}</h2>
                                <p className="text-sm text-brand-gray-500">Cliente: {obraToView.clientName}</p>
                            </div>
                            <button onClick={handleCloseViewModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="border-b border-brand-gray-200">
                             <nav className="flex px-6 -mb-px space-x-8">
                                <button onClick={() => setViewModalActiveTab('overview')} className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm ${viewModalActiveTab === 'overview' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700'}`}><ClipboardDocumentListIcon className="w-5 h-5"/> Visão Geral</button>
                                <button onClick={() => setViewModalActiveTab('stages')} className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm ${viewModalActiveTab === 'stages' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700'}`}><ViewColumnsIcon className="w-5 h-5"/> Etapas (Kanban)</button>
                            </nav>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto bg-brand-gray-50 flex-grow">
                            {viewModalActiveTab === 'overview' && (
                                <div className="bg-white p-6 rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                   <div><strong className="block text-brand-gray-500">Responsável Projeto</strong>{obraToView.responsibleUserName}</div>
                                   <div><strong className="block text-brand-gray-500">Status</strong><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClass(obraToView.status)}`}>{obraToView.status}</span></div>
                                   <div><strong className="block text-brand-gray-500">Data de Início</strong>{new Date(obraToView.startDate + "T00:00:00").toLocaleDateString('pt-BR')}</div>
                                   <div><strong className="block text-brand-gray-500">Data de Término</strong>{new Date(obraToView.endDate + "T00:00:00").toLocaleDateString('pt-BR')}</div>
                                   <div className="sm:col-span-2">
                                       <button onClick={() => onViewProject(obraToView.id)} className="font-semibold text-brand-blue hover:underline">
                                           Ver Projeto Completo
                                       </button>
                                   </div>
                               </div>
                            )}
                            {viewModalActiveTab === 'stages' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                                    {Object.values(ProjectStageStatus).map(status => (
                                        <div key={status} onDragOver={(e) => handleTaskDragOver(e, status)} onDragLeave={handleTaskDragLeave} onDrop={(e) => handleTaskDrop(e, status)} className={`rounded-lg p-3 flex flex-col ${dragOverTaskColumn === status ? 'bg-brand-blue-light' : 'bg-brand-gray-100'}`}>
                                            <h4 className="font-semibold text-brand-gray-800 mb-4">{status} ({obraToView.stages.filter(s => s.status === status).length})</h4>
                                            <div className="space-y-3 overflow-y-auto flex-grow">
                                                {obraToView.stages.filter(s => s.status === status).map(task => (
                                                     <div key={task.id} draggable onDragStart={(e) => handleTaskDragStart(e, task)} onDragEnd={handleTaskDragEnd} className={getTaskCardClasses(task)}>
                                                        <div className="flex justify-between items-start">
                                                            <p className={`font-semibold text-brand-gray-900 ${task.highlight === 'cancelled' ? 'line-through' : ''}`}>{task.title}</p>
                                                            <div className="relative">
                                                                <button onClick={() => setOpenTaskOptions(task.id === openTaskOptions ? null : task.id)} className="p-1 -mr-1 -mt-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-200">
                                                                    <EllipsisVerticalIcon className="w-5 h-5"/>
                                                                </button>
                                                                {openTaskOptions === task.id && (
                                                                    <div ref={taskOptionsRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                                                        <div className="py-1">
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleOpenEditTaskModal(task); }} className="block px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">Editar Tarefa</a>
                                                                            <span className="block px-4 pt-2 pb-1 text-xs text-brand-gray-500">Mover / Marcar como</span>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleUpdateTaskStatus(task.id, 'Concluido'); }} className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50">Concluída</a>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleUpdateTaskStatus(task.id, 'Em Andamento'); }} className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">Em Andamento</a>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleUpdateTaskStatus(task.id, 'paused'); }} className="block px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">Pausada</a>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleUpdateTaskStatus(task.id, 'cancelled'); }} className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50">Cancelada</a>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {task.dueDate && <p className="text-xs text-brand-gray-500 mt-1 flex items-center gap-1"><ClockIcon className="w-3 h-3"/> Vence em: {new Date(task.dueDate + 'T00:00').toLocaleDateString('pt-BR')}</p>}
                                                        {task.assignedMemberName && (
                                                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-brand-gray-100">
                                                                <div className="w-6 h-6 rounded-full bg-brand-gray-200 text-brand-gray-600 text-xs font-bold flex items-center justify-center">{task.assignedMemberName.charAt(0)}</div>
                                                                <span className="text-xs font-medium text-brand-gray-700">{task.assignedMemberName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => handleOpenAddTaskModal(status)} className="mt-4 w-full text-sm font-semibold text-brand-gray-600 hover:bg-brand-gray-200 p-2 rounded-md">+ Adicionar Tarefa</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                         <div className="p-4 bg-white border-t border-brand-gray-200 flex justify-end">
                            <button onClick={handleCloseViewModal} className="px-4 py-2 bg-brand-gray-100 text-brand-gray-800 font-semibold rounded-lg hover:bg-brand-gray-200">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isTaskModalOpen && obraToView && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold">{taskToEdit ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Título da Tarefa</label>
                                <input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Atribuir a</label>
                                <select value={taskForm.assignedMemberId} onChange={e => setTaskForm({...taskForm, assignedMemberId: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white">
                                    <option value="">Ninguém</option>
                                    {obrasTeam.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Status</label>
                                    <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value as ProjectStageStatus})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white">
                                        {Object.values(ProjectStageStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Prazo (Opcional)</label>
                                    <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t flex justify-end gap-3">
                            <button type="button" onClick={handleCloseTaskModal} className="px-4 py-2 bg-white border border-brand-gray-300 rounded-lg font-semibold">Cancelar</button>
                            <button type="button" onClick={handleSaveTask} className="px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold">Salvar Tarefa</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isTeamManagementModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                             <div>
                                <h2 className="text-xl font-bold text-brand-gray-800">{teamManagementMode === 'view' ? 'Gerenciar Equipe de Obra' : (memberToEdit ? 'Editar Membro' : 'Adicionar Membro')}</h2>
                                {teamManagementMode !== 'view' && <p className="text-sm text-brand-gray-500">Preencha as informações abaixo.</p>}
                            </div>
                            <button type="button" onClick={closeTeamModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                       
                        {teamManagementMode === 'view' && (
                            <div className="p-6 overflow-y-auto">
                                <div className="flex justify-end mb-4">
                                    <button onClick={handleOpenAddMember} className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">
                                        <PlusIcon className="w-4 h-4" />
                                        Adicionar Membro
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {obrasTeam.map(user => (
                                        <div key={user.id} className="p-3 bg-brand-gray-50 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-blue-light flex items-center justify-center font-bold text-brand-blue">{user.name.charAt(0)}</div>
                                                <div>
                                                    <div className="font-semibold text-brand-gray-800">{user.name}</div>
                                                    <div className="text-sm text-brand-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>
                                                    {user.role}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleOpenEditMember(user)} className="p-1.5 rounded-full text-brand-gray-400 hover:bg-brand-gray-200 hover:text-brand-blue" title="Editar"><PencilIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => setMemberToDelete(user)} className="p-1.5 rounded-full text-brand-gray-400 hover:bg-brand-gray-200 hover:text-brand-red" title="Excluir"><TrashIcon className="w-5 h-5"/></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(teamManagementMode === 'add' || teamManagementMode === 'edit') && (
                             <form onSubmit={handleMemberFormSubmit} className="flex flex-col flex-grow">
                                <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nome</label>
                                            <input type="text" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-1">Função</label>
                                            <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value as UserRole})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white">
                                                {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Email</label>
                                        <input type="email" value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                    </div>
                                </div>
                                <div className="p-4 bg-brand-gray-50 border-t flex justify-end gap-3">
                                    <button type="button" onClick={() => setTeamManagementMode('view')} className="px-4 py-2 bg-white border border-brand-gray-300 rounded-lg font-semibold">Voltar</button>
                                    <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold">{memberToEdit ? 'Salvar Alterações' : 'Criar Membro'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            
            {memberToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
                            <p className="text-sm mt-2 text-brand-gray-600">Tem certeza que deseja excluir o membro da equipe <strong>{memberToDelete.name}</strong>?</p>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t flex justify-end gap-3">
                            <button onClick={() => setMemberToDelete(null)} className="px-4 py-2 bg-white border rounded-lg font-semibold">Cancelar</button>
                            <button onClick={handleConfirmDeleteMember} className="px-4 py-2 bg-brand-red text-white rounded-lg font-semibold">Excluir</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Obras;