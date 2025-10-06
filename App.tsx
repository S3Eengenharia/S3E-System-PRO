import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Orcamentos from './components/Orcamentos';
import Catalogo from './components/Catalogo';
import Movimentacoes from './components/Movimentacoes';
import Historico from './components/Historico';
import Compras from './components/Compras';
import Materiais from './components/Materiais';
import Fornecedores from './components/Fornecedores';
import Clientes from './components/Clientes';
import Projetos from './components/Projetos';
import Obras from './components/Obras';
import Servicos from './components/Servicos';
import SettingsModal from './components/SettingsModal';
import { projectsData } from './data/mockData';
import { type Project } from './types';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [initialBudgetId, setInitialBudgetId] = useState<string | null>(null);
  const [initialProjectId, setInitialProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(projectsData);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleNavigate = (view: string) => {
    setActiveView(view);
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
  };

  const handleViewBudget = (budgetId: string) => {
    setInitialBudgetId(budgetId);
    handleNavigate('Orçamentos');
  };
  
  const handleViewProject = (projectId: string) => {
    setInitialProjectId(projectId);
    handleNavigate('Projetos');
  };


  const renderActiveView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard toggleSidebar={toggleSidebar} onNavigate={handleNavigate} projects={projects} />;
      case 'Orçamentos':
        return <Orcamentos 
                 toggleSidebar={toggleSidebar} 
                 initialBudgetId={initialBudgetId}
                 clearInitialBudgetId={() => setInitialBudgetId(null)}
               />;
      case 'Catálogo':
        return <Catalogo toggleSidebar={toggleSidebar} />;
      case 'Serviços':
        return <Servicos toggleSidebar={toggleSidebar} />;
      case 'Movimentações':
        return <Movimentacoes toggleSidebar={toggleSidebar} />;
      case 'Histórico':
        return <Historico toggleSidebar={toggleSidebar} />;
      case 'Compras':
        return <Compras toggleSidebar={toggleSidebar} />;
      case 'Materiais':
        return <Materiais toggleSidebar={toggleSidebar} />;
      case 'Fornecedores':
        return <Fornecedores toggleSidebar={toggleSidebar} />;
      case 'Clientes':
        return <Clientes toggleSidebar={toggleSidebar} />;
      case 'Projetos':
        return <Projetos 
                 toggleSidebar={toggleSidebar} 
                 onNavigate={handleNavigate}
                 onViewBudget={handleViewBudget}
                 initialProjectId={initialProjectId}
                 clearInitialProjectId={() => setInitialProjectId(null)}
                 projects={projects}
                 setProjects={setProjects}
               />;
      case 'Obras':
        return <Obras 
                 toggleSidebar={toggleSidebar} 
                 onViewProject={handleViewProject}
                 projects={projects}
                 setProjects={setProjects}
               />;
      default:
        return <Dashboard toggleSidebar={toggleSidebar} onNavigate={handleNavigate} projects={projects} />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-gray-50 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
      <main className="flex-1 overflow-y-auto">
        {renderActiveView()}
      </main>
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default App;