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
import FornecedoresModerno from './components/FornecedoresModerno';
import Clientes from './components/Clientes';
import ClientesAPI from './components/ClientesAPI';
import ClientesModerno from './components/ClientesModerno';
import Projetos from './components/Projetos';
import ProjetosAPI from './components/ProjetosAPI';
import ProjetosModerno from './components/ProjetosModerno';
import Obras from './components/Obras';
import Servicos from './components/Servicos';
import Financeiro from './components/Financeiro';
import EmissaoNFe from './components/EmissaoNFe';
import Configuracoes from './components/Configuracoes';
import ComparacaoPrecos from './components/ComparacaoPrecos';
import Vendas from './components/Vendas';
import ObrasKanban from './pages/ObrasKanban';
// import SettingsModal from './components/SettingsModal'; // DESCONTINUADO - Substituído por página Configuracoes.tsx
import GestaoObras from './components/GestaoObras';
import { type Project } from './types';

const MainApp: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  // const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // DESCONTINUADO
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
        return <Orcamentos toggleSidebar={toggleSidebar} />;
      case 'Catálogo':
        return <Catalogo toggleSidebar={toggleSidebar} />;
      case 'Movimentações':
        return <Movimentacoes toggleSidebar={toggleSidebar} />;
      case 'Histórico':
        return <Historico toggleSidebar={toggleSidebar} />;
      case 'Compras':
        return <Compras toggleSidebar={toggleSidebar} />;
      case 'Estoque':
      case 'Materiais':
        return <Materiais toggleSidebar={toggleSidebar} />;
      case 'Comparação de Preços':
        return <ComparacaoPrecos toggleSidebar={toggleSidebar} onNavigate={handleNavigate} />;
      case 'Fornecedores':
        return <FornecedoresModerno toggleSidebar={toggleSidebar} />;
      case 'Clientes':
        return <ClientesModerno toggleSidebar={toggleSidebar} />;
      case 'Projetos':
        return <ProjetosModerno 
                 toggleSidebar={toggleSidebar} 
                 onNavigate={handleNavigate}
                 onViewBudget={handleViewBudget}
               />;
      case 'Obras':
        return <ObrasKanban toggleSidebar={toggleSidebar} />;
      case 'Gestão de Obras':
        return <GestaoObras toggleSidebar={toggleSidebar} />;
      case 'Financeiro':
        return <Financeiro toggleSidebar={toggleSidebar} />;
      case 'Vendas':
        return <Vendas toggleSidebar={toggleSidebar} />;
      case 'Emissão NF-e':
        return <EmissaoNFe toggleSidebar={toggleSidebar} />;
      case 'Serviços':
        return <Servicos toggleSidebar={toggleSidebar} />;
      case 'Configurações':
        return <Configuracoes toggleSidebar={toggleSidebar} />;
      default:
        return <DashboardAPI toggleSidebar={toggleSidebar} onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-gray-50 dark:bg-dark-bg font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSettings={() => {}} // DESCONTINUADO - Agora usa onNavigate('Configurações')
      />
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg">
        {renderActiveView()}
      </main>
      {/* SettingsModal DESCONTINUADO - Substituído por página Configuracoes.tsx */}
      {/* <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      /> */}
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
