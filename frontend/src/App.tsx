import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Editor WYSIWYG Jodit
import 'jodit/es2021/jodit.min.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/DashboardModerno';
import DashboardAPI from './components/DashboardAPI';
import Orcamentos from './components/Orcamentos';
import Catalogo from './components/Catalogo';
import Movimentacoes from './components/Movimentacoes';
import Logs from './components/Logs';
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
import AtualizacaoPrecos from './components/AtualizacaoPrecos';
import Vendas from './components/Vendas';
import Cotacoes from './components/Cotacoes';
import ObrasKanban from './pages/ObrasKanban';
import NovaCompraPage from './pages/NovaCompraPage';
import DetalhesObra from './pages/DetalhesObra';
// import SettingsModal from './components/SettingsModal'; // DESCONTINUADO - Substituído por página Configuracoes.tsx
import GestaoObras from './components/GestaoObras';
import TarefasObra from './components/TarefasObra';
import GerenciamentoEmpresarial from './components/GerenciamentoEmpresarial';
import { type Project } from './types';
import { Toaster } from './components/ui/sonner';
import MobileMenuButton from './components/MobileMenuButton';

const MainApp: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  // const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // DESCONTINUADO
  const [initialBudgetId, setInitialBudgetId] = useState<string | null>(null);
  const [initialProjectId, setInitialProjectId] = useState<string | null>(null);
  const [initialObraId, setInitialObraId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleNavigate = (view: string, ...args: any[]) => {
    setActiveView(view);
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
    // Se for DetalhesObra e tiver argumentos, usar o primeiro como obraId
    if (view === 'DetalhesObra' && args[0]) {
      setInitialObraId(args[0]);
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

  const handleViewObra = (obraId: string) => {
    setInitialObraId(obraId);
    handleNavigate('DetalhesObra');
  };

  const handleViewSale = (saleId: string) => {
    // Navegar para vendas - o componente pode abrir o modal automaticamente se necessário
    handleNavigate('Vendas');
    // TODO: Implementar abertura automática do modal de visualização de venda
  };

  const handleViewClient = (clientId: string) => {
    // Navegar para clientes - o componente pode abrir o modal automaticamente se necessário
    handleNavigate('Clientes');
    // TODO: Implementar abertura automática do modal de visualização de cliente
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
      case 'Logs':
      case 'Histórico': // Compatibilidade
        return <Logs toggleSidebar={toggleSidebar} />;
      case 'Compras':
        return <Compras toggleSidebar={toggleSidebar} />;
      case 'Estoque':
      case 'Materiais':
        return <Materiais toggleSidebar={toggleSidebar} />;
      case 'Atualização de Preços':
        return <AtualizacaoPrecos toggleSidebar={toggleSidebar} onNavigate={handleNavigate} />;
      case 'Fornecedores':
        return <FornecedoresModerno toggleSidebar={toggleSidebar} />;
      case 'Clientes':
        return <ClientesModerno toggleSidebar={toggleSidebar} />;
      case 'Projetos':
        return <ProjetosModerno 
                 toggleSidebar={toggleSidebar} 
                 onNavigate={handleNavigate}
                 onViewBudget={handleViewBudget}
                 onViewSale={handleViewSale}
                 onViewClient={handleViewClient}
                 onViewObra={handleViewObra}
               />;
      case 'Obras':
        return <ObrasKanban toggleSidebar={toggleSidebar} onNavigate={(view, ...args) => {
          if (view === 'DetalhesObra' && args[0]) {
            handleViewObra(args[0]);
          } else {
            handleNavigate(view);
          }
        }} />;
      case 'DetalhesObra':
        return initialObraId ? (
          <DetalhesObra toggleSidebar={toggleSidebar} obraId={initialObraId} onNavigate={handleNavigate} />
        ) : (
          <ObrasKanban toggleSidebar={toggleSidebar} onNavigate={handleNavigate} />
        );
      case 'Tarefas da Obra':
        return <TarefasObra toggleSidebar={toggleSidebar} />;
      case 'Gestão de Obras':
        return <GestaoObras toggleSidebar={toggleSidebar} />;
      case 'Financeiro':
        return <Financeiro toggleSidebar={toggleSidebar} />;
      case 'Vendas':
        return <Vendas toggleSidebar={toggleSidebar} />;
      case 'Cotações':
        return <Cotacoes toggleSidebar={toggleSidebar} />;
      case 'Emissão NF-e':
        return <EmissaoNFe toggleSidebar={toggleSidebar} />;
      case 'Serviços':
        return <Servicos toggleSidebar={toggleSidebar} />;
      case 'Configurações':
        return <Configuracoes toggleSidebar={toggleSidebar} />;
      case 'Gerenciamento Empresarial':
        return <GerenciamentoEmpresarial toggleSidebar={toggleSidebar} />;
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
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg relative">
        {/* Botão Hambúrguer para Mobile - aparece apenas quando sidebar está fechada em mobile */}
        {!isSidebarOpen && <MobileMenuButton onClick={toggleSidebar} isOpen={isSidebarOpen} />}
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

// Componente wrapper para páginas standalone com Sidebar
const StandalonePageWrapper: React.FC<{ children: React.ReactNode; activeView?: string }> = ({ children, activeView = 'Compras' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (view: string) => {
    // Mapear views para rotas
    const routeMap: Record<string, string> = {
      'Dashboard': '/',
      'Orçamentos': '/',
      'Catálogo': '/',
      'Movimentações': '/',
      'Logs': '/',
      'Compras': '/compras',
      'Materiais': '/',
      'Estoque': '/',
      'Atualização de Preços': '/',
      'Fornecedores': '/',
      'Clientes': '/',
      'Projetos': '/',
      'Obras': '/',
      'Tarefas da Obra': '/',
      'Gestão de Obras': '/',
      'Financeiro': '/',
      'Vendas': '/',
      'Emissão NF-e': '/',
      'Serviços': '/',
      'Configurações': '/',
      'Gerenciamento Empresarial': '/'
    };

    const route = routeMap[view] || '/';
    window.location.href = route;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-gray-50 dark:bg-dark-bg font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSettings={() => handleNavigate('Configurações')}
      />
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-bg relative">
        {/* Botão Hambúrguer para Mobile - aparece apenas quando sidebar está fechada em mobile */}
        {!isSidebarOpen && <MobileMenuButton onClick={toggleSidebar} isOpen={isSidebarOpen} />}
        {React.cloneElement(children as React.ReactElement, { toggleSidebar })}
      </main>
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/compras" element={
              <ProtectedRoute>
                <StandalonePageWrapper>
                  <Compras toggleSidebar={() => {}} />
                </StandalonePageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/compras/nova" element={
              <ProtectedRoute>
                <StandalonePageWrapper>
                  <NovaCompraPage toggleSidebar={() => {}} />
                </StandalonePageWrapper>
              </ProtectedRoute>
            } />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" expand={false} richColors closeButton />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
