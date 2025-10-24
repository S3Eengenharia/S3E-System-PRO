import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DashboardAPI from './components/DashboardAPI';
import Orcamentos from './components/Orcamentos';
import Catalogo from './components/Catalogo';
import Movimentacoes from './components/Movimentacoes';
import Historico from './components/Historico';
import Compras from './components/Compras';
import Materiais from './components/Materiais';
import Fornecedores from './components/Fornecedores';
import FornecedoresAPI from './components/FornecedoresAPI';
import Clientes from './components/Clientes';
import ClientesAPI from './components/ClientesAPI';
import Projetos from './components/Projetos';
import ProjetosAPI from './components/ProjetosAPI';
import Obras from './components/Obras';
import ServicosAPI from './components/ServicosAPI';
import Financeiro from './components/Financeiro';
import EmissaoNFe from './components/EmissaoNFe';
import ComparacaoPrecos from './components/ComparacaoPrecos';
import Vendas from './components/Vendas';
import SettingsModal from './components/SettingsModal';
import GerenciamentoObras from './pages/Obras/Gerenciamento';
import { type Project } from './types';

const MainApp: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [initialBudgetId, setInitialBudgetId] = useState<string | null>(null);
  const [initialProjectId, setInitialProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

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
      case 'Movimentações':
        return <Movimentacoes toggleSidebar={toggleSidebar} />;
      case 'Histórico':
        return <Historico toggleSidebar={toggleSidebar} />;
      case 'Compras':
        return <Compras toggleSidebar={toggleSidebar} />;
      case 'Materiais':
        return <Materiais toggleSidebar={toggleSidebar} />;
      case 'Comparação de Preços':
        return <ComparacaoPrecos toggleSidebar={toggleSidebar} onNavigate={handleNavigate} />;
      case 'Fornecedores':
        return <FornecedoresAPI toggleSidebar={toggleSidebar} />;
      case 'Clientes':
        return <ClientesAPI toggleSidebar={toggleSidebar} />;
      case 'Projetos':
        return <ProjetosAPI 
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
      case 'Gestão de Obras':
        return <GerenciamentoObras toggleSidebar={toggleSidebar} />;
      case 'Financeiro':
        return <Financeiro toggleSidebar={toggleSidebar} />;
      case 'Vendas':
        return <Vendas toggleSidebar={toggleSidebar} />;
      case 'Emissão NF-e':
        return <EmissaoNFe toggleSidebar={toggleSidebar} />;
      case 'Serviços':
        return <ServicosAPI toggleSidebar={toggleSidebar} />;
      default:
        return <DashboardAPI toggleSidebar={toggleSidebar} onNavigate={handleNavigate} />;
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

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
