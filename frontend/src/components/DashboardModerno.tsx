import React, { useState, useEffect, useContext } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  Package, AlertTriangle, Building2, Zap, 
  ArrowUpRight, Calendar, Download, FileText,
  Activity, Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { dashboardService, type DashboardCompleto } from '../services/dashboardService';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

interface DashboardModernoProps {
  toggleSidebar: () => void;
  onNavigate: (view: string) => void;
}

// Tipos para os dados
interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

const DashboardModerno: React.FC<DashboardModernoProps> = ({ toggleSidebar, onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<DashboardCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'semester' | 'annual'>('monthly');
  const [selectedQuadrosPeriod, setSelectedQuadrosPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [obrasData, setObrasData] = useState<any[]>([]);
  const [quadrosData, setQuadrosData] = useState<any[]>([]);
  const [atividadesData, setAtividadesData] = useState<any[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<any>(null);
  const [exportando, setExportando] = useState(false);
  
  // Detectar tema para ajustar cores dos gráficos
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark' || 
    (themeContext?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Pegar usuário logado
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'Usuário';

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados principais
      const result = await dashboardService.getDashboardCompleto();
      
      if (result.success && result.data) {
        setDashboardData(result.data);
      }
      
      setLastUpdate(new Date().toLocaleString('pt-BR', { 
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar evolução de obras
  const loadObrasData = async (periodo: 'monthly' | 'semester' | 'annual') => {
    try {
      const result = await dashboardService.getEvolucaoObras(periodo);
      if (result.success && result.data) {
        setObrasData(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar evolução de obras:', err);
    }
  };

  // Carregar produção de quadros
  const loadQuadrosData = async (periodo: 'daily' | 'weekly' | 'monthly') => {
    try {
      const result = await dashboardService.getProducaoQuadros(periodo);
      if (result.success && result.data) {
        setQuadrosData(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar produção de quadros:', err);
    }
  };

  // Carregar atividades do sistema
  const loadAtividadesData = async () => {
    try {
      const result = await dashboardService.getAtividades('daily');
      if (result.success && result.data) {
        setAtividadesData(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    }
  };

  // Carregar resumo financeiro
  const loadResumoFinanceiro = async () => {
    try {
      const result = await dashboardService.getResumoFinanceiro();
      if (result.success && result.data) {
        setResumoFinanceiro(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar resumo financeiro:', err);
    }
  };

  // Exportar dados
  const handleExportarDados = async () => {
    try {
      setExportando(true);
      
      // Criar dados para exportação usando dados já carregados
      const dadosParaExportar = {
        timestamp: new Date().toISOString(),
        dataGeracao: new Date().toLocaleString('pt-BR'),
        geradoPor: user?.name || 'Usuário',
        
        // Estatísticas
        estatisticas: {
          obrasAtivas: dashboardData?.estatisticas?.projetos?.ativos || 0,
          equipesAtivas: dashboardData?.estatisticas?.equipes?.ativas || 0,
          quadrosProduzidos: quadrosData.reduce((sum, item) => sum + (item.producao || 0), 0),
          clientesAtivos: dashboardData?.estatisticas?.clientes?.ativos || 0,
          fornecedores: dashboardData?.estatisticas?.fornecedores?.ativos || 0,
          vendasMes: dashboardData?.estatisticas?.vendas?.mesAtual || 0,
          materiaisBaixo: dashboardData?.estatisticas?.estoque?.materiaisBaixo || 0,
        },
        
        // Evolução de obras
        evolucaoObras: {
          periodo: selectedPeriod,
          dados: obrasData
        },
        
        // Produção de quadros
        producaoQuadros: {
          periodo: selectedQuadrosPeriod,
          dados: quadrosData
        },
        
        // Materiais
        materiais: dashboardData?.materiais || [],
        
        // Projetos
        projetos: dashboardData?.projetos || [],
        
        // Sistema
        sistema: {
          versao: '1.0.0',
          empresa: 'S3E Engenharia',
          tipo: 'Dashboard Executivo'
        }
      };
      
      // Criar arquivo JSON para download
      const dataStr = JSON.stringify(dadosParaExportar, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-s3e-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('✅ Dados exportados com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('❌ Erro ao exportar dados. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

  // Criar relatório em PDF
  const handleCriarRelatorio = () => {
    try {
      // Criar relatório em HTML para impressão
      const relatorioWindow = window.open('', '_blank');
      
      if (!relatorioWindow) {
        alert('❌ Bloqueador de pop-ups ativado. Permita pop-ups para gerar o relatório.');
        return;
      }
      
      const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Relatório Dashboard - S3E Engenharia</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              padding: 40px;
              background: #fff;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #3B82F6;
            }
            .header h1 {
              color: #3B82F6;
              font-size: 32px;
              margin-bottom: 10px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #1E293B;
              font-size: 20px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #E5E7EB;
            }
            .metrics {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .metric-card {
              padding: 20px;
              border: 2px solid #E5E7EB;
              border-radius: 8px;
              text-align: center;
            }
            .metric-card .value {
              font-size: 36px;
              font-weight: bold;
              color: #3B82F6;
              margin-bottom: 8px;
            }
            .metric-card .label {
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            table th, table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #E5E7EB;
            }
            table th {
              background: #F3F4F6;
              font-weight: 600;
              color: #374151;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚡ S3E Engenharia</h1>
            <p>Relatório do Dashboard Executivo</p>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            <p>Por: ${user?.name || 'Usuário'}</p>
          </div>

          <div class="section">
            <h2>📊 Métricas Principais</h2>
            <div class="metrics">
              <div class="metric-card">
                <div class="value">${dashboardData?.estatisticas?.projetos?.ativos || 0}</div>
                <div class="label">Obras Ativas</div>
              </div>
              <div class="metric-card">
                <div class="value">${dashboardData?.estatisticas?.equipes?.ativas || 0}</div>
                <div class="label">Equipes Ativas</div>
              </div>
              <div class="metric-card">
                <div class="value">${quadrosData.reduce((sum, item) => sum + (item.producao || 0), 0)}</div>
                <div class="label">Quadros Produzidos</div>
              </div>
              <div class="metric-card">
                <div class="value">${dashboardData?.estatisticas?.clientes?.ativos || 0}</div>
                <div class="label">Clientes Ativos</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🏗️ Evolução de Obras (${selectedPeriod === 'monthly' ? 'Mensal' : selectedPeriod === 'semester' ? 'Semestral' : 'Anual'})</h2>
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Concluídas</th>
                  <th>Em Andamento</th>
                  <th>Planejadas</th>
                  <th>Receita</th>
                </tr>
              </thead>
              <tbody>
                ${obrasData.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.concluidas}</td>
                    <td>${item.emAndamento}</td>
                    <td>${item.planejadas}</td>
                    <td>R$ ${(item.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>🔧 Produção de Quadros (${selectedQuadrosPeriod === 'daily' ? 'Diário' : selectedQuadrosPeriod === 'weekly' ? 'Semanal' : 'Mensal'})</h2>
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Quantidade Produzida</th>
                </tr>
              </thead>
              <tbody>
                ${quadrosData.map(item => `
                  <tr>
                    <td>${item.hora}</td>
                    <td>${item.producao}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>📦 Resumo do Sistema</h2>
            <table>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fornecedores Ativos</td>
                  <td>${dashboardData?.estatisticas?.fornecedores?.ativos || 0}</td>
                </tr>
                <tr>
                  <td>Vendas no Mês</td>
                  <td>${dashboardData?.estatisticas?.vendas?.mesAtual || 0}</td>
                </tr>
                <tr>
                  <td>Materiais com Estoque Baixo</td>
                  <td>${dashboardData?.estatisticas?.estoque?.materiaisBaixo || 0}</td>
                </tr>
                <tr>
                  <td>Total de Projetos</td>
                  <td>${dashboardData?.projetos?.length || 0}</td>
                </tr>
                <tr>
                  <td>Total de Materiais</td>
                  <td>${dashboardData?.materiais?.length || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p><strong>S3E Engenharia</strong> - Sistema de Gestão Profissional</p>
            <p>Relatório gerado automaticamente pelo sistema</p>
            <p class="no-print" style="margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                🖨️ Imprimir / Salvar PDF
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px;">
                ✖️ Fechar
              </button>
            </p>
          </div>
        </body>
        </html>
      `;
      
      relatorioWindow.document.write(html);
      relatorioWindow.document.close();
      
    } catch (err) {
      console.error('Erro ao criar relatório:', err);
      alert('❌ Erro ao criar relatório. Tente novamente.');
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadAtividadesData();
    loadResumoFinanceiro();
    
    const interval = setInterval(() => {
      loadDashboardData();
      loadAtividadesData();
      loadResumoFinanceiro();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar dados de obras quando período mudar
  useEffect(() => {
    loadObrasData(selectedPeriod);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  // Carregar dados de quadros quando período mudar
  useEffect(() => {
    loadQuadrosData(selectedQuadrosPeriod);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuadrosPeriod]);

  // Usar dados reais da API ou fallback para dados mockados
  const getObrasData = () => {
    if (obrasData && obrasData.length > 0) {
      return obrasData;
    }
    
    // Fallback para dados mockados caso API não retorne dados
    if (selectedPeriod === 'monthly') {
      return [
        { name: 'Jan', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Fev', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Mar', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Abr', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Mai', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Jun', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Jul', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Ago', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Set', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Out', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Nov', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: 'Dez', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
      ];
    } else if (selectedPeriod === 'semester') {
      return [
        { name: '1º Sem 2023', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: '2º Sem 2023', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: '1º Sem 2024', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: '2º Sem 2024', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
      ];
    } else {
      return [
        { name: '2020', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: '2021', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: '2022', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: '2023', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
        { name: '2024', concluidas: 0, emAndamento: 0, planejadas: 0, receita: 0 },
      ];
    }
  };

  // Usar dados reais de quadros ou fallback
  const getQuadrosData = () => {
    if (quadrosData && quadrosData.length > 0) {
      return quadrosData;
    }
    
    // Fallback para dados mockados
    return [
      { hora: '8h', producao: 0 },
      { hora: '10h', producao: 0 },
      { hora: '12h', producao: 0 },
      { hora: '14h', producao: 0 },
      { hora: '16h', producao: 0 },
      { hora: '18h', producao: 0 },
    ];
  };

  // Usar dados reais de atividades ou fallback
  const getAtividadesData = () => {
    if (atividadesData && atividadesData.length > 0) {
      return atividadesData;
    }
    
    // Fallback para dados mockados
    return [
      { hora: '8h', sessoes: 0 },
      { hora: '10h', sessoes: 0 },
      { hora: '12h', sessoes: 0 },
      { hora: '14h', sessoes: 0 },
      { hora: '16h', sessoes: 0 },
      { hora: '18h', sessoes: 0 },
    ];
  };

  // Métricas principais usando dados reais da API
  const metricsData: MetricCard[] = [
    {
      title: 'Obras Ativas',
      value: dashboardData?.estatisticas?.projetos?.ativos?.toString() || '0',
      change: 28.4,
      icon: <Building2 className="w-5 h-5" />,
      trend: 'up'
    },
    {
      title: 'Equipes Ativas',
      value: dashboardData?.estatisticas?.equipes?.ativas?.toString() || '0',
      change: -12.6,
      icon: <Users className="w-5 h-5" />,
      trend: 'down'
    },
    {
      title: 'Quadros Produzidos',
      value: (quadrosData.reduce((sum, item) => sum + (item.producao || 0), 0)).toString(),
      change: 3.1,
      icon: <Zap className="w-5 h-5" />,
      trend: 'up'
    },
    {
      title: 'Clientes Ativos',
      value: dashboardData?.estatisticas?.clientes?.ativos?.toString() || '0',
      change: 11.3,
      icon: <Star className="w-5 h-5" />,
      trend: 'up'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text mb-2">
              Bem-vindo de volta, {userName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Acompanhe o desempenho e evolução da S3E Engenharia
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExportarDados}
              disabled={exportando}
            >
              <Download className="w-4 h-4" />
              {exportando ? 'Exportando...' : 'Exportar dados'}
            </Button>
            <Button className="gap-2" onClick={handleCriarRelatorio}>
              <FileText className="w-4 h-4" />
              Criar relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {metricsData.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                  {metric.icon}
                </div>
                <Badge 
                  variant={metric.trend === 'up' ? 'success' : 'destructive'}
                  className="gap-1"
                >
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text mb-1">
                {metric.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                {metric.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Evolução de Obras */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  Evolução de Obras
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    24.6%
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  Acompanhamento de obras concluídas, em andamento e planejadas
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="semester">Semestral</SelectItem>
                    <SelectItem value="annual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={getObrasData()}>
                <defs>
                  <linearGradient id="colorConcluidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAndamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? '#334155' : '#E5E7EB'} 
                />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#CBD5E1' : '#6B7280'}
                />
                <YAxis 
                  stroke={isDark ? '#CBD5E1' : '#6B7280'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: isDark ? '#F8FAFC' : '#374151'
                  }}
                  itemStyle={{ color: isDark ? '#F8FAFC' : '#374151' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="concluidas" 
                  name="Concluídas"
                  stroke="#8B5CF6" 
                  fill="url(#colorConcluidas)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="emAndamento" 
                  name="Em Andamento"
                  stroke="#3B82F6" 
                  fill="url(#colorAndamento)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="planejadas" 
                  name="Planejadas"
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produção de Quadros Elétricos */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Produção de Quadros
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    28.5%
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  {selectedQuadrosPeriod === 'daily' && 'Últimas 12 horas'}
                  {selectedQuadrosPeriod === 'weekly' && 'Últimos 7 dias'}
                  {selectedQuadrosPeriod === 'monthly' && 'Último mês'}
                </CardDescription>
              </div>
              <Select value={selectedQuadrosPeriod} onValueChange={(v: any) => setSelectedQuadrosPeriod(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getQuadrosData()}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? '#334155' : '#E5E7EB'} 
                />
                <XAxis 
                  dataKey="hora" 
                  stroke={isDark ? '#CBD5E1' : '#6B7280'} 
                />
                <YAxis 
                  stroke={isDark ? '#CBD5E1' : '#6B7280'} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: isDark ? '#F8FAFC' : '#374151'
                  }}
                />
                <Bar 
                  dataKey="producao" 
                  fill="#8B5CF6" 
                  radius={[8, 8, 0, 0]}
                  name="Quadros Produzidos"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-dark-text-secondary">
                Hoje: <strong className="text-gray-900 dark:text-dark-text">135 quadros</strong>
              </span>
              <Button variant="link" className="h-auto p-0">
                Ver relatório →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividades do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Atividades do Sistema
              <Badge variant="success" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                16.8%
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2">
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <Activity className="w-4 h-4" />
                Live: 10k visitantes
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getAtividadesData()}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? '#334155' : '#E5E7EB'} 
                />
                <XAxis 
                  dataKey="hora" 
                  stroke={isDark ? '#CBD5E1' : '#6B7280'} 
                />
                <YAxis 
                  stroke={isDark ? '#CBD5E1' : '#6B7280'} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: isDark ? '#F8FAFC' : '#374151'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sessoes" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#8B5CF6' }}
                  name="Sessões"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-dark-text-secondary">
                Total: <strong className="text-gray-900 dark:text-dark-text">
                  {atividadesData.reduce((sum, item) => sum + (item.sessoes || 0), 0)} atividades
                </strong>
              </span>
              <Button variant="link" className="h-auto p-0">
                Ver relatório →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção inferior - Cards adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Receita do período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                    Receita Total
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    R$ {(resumoFinanceiro?.receitaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">Obras Concluídas</p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100 mt-1">
                    R$ {((resumoFinanceiro?.obrasConcluidas || 0) / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">Em Andamento</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
                    R$ {((resumoFinanceiro?.obrasAndamento || 0) / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alertas
            </CardTitle>
            <CardDescription>Status do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                    Estoque
                  </span>
                </div>
                <Badge variant="success">Normal</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                    Materiais
                  </span>
                </div>
                <Badge variant="warning">{dashboardData?.estatisticas?.estoque?.materiaisBaixo || 3} Baixo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                    Equipes
                  </span>
                </div>
                <Badge variant="success">Todas Ativas</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-blue" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>Acesso rápido às funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => onNavigate('estoque')}
              >
                Gerenciar Estoque
                <ArrowUpRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => onNavigate('obras')}
              >
                Nova Obra
                <ArrowUpRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => onNavigate('orcamentos')}
              >
                Criar Orçamento
                <ArrowUpRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => onNavigate('projetos')}
              >
                Ver Projetos
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer info */}
      <div className="mt-8 flex items-center justify-between text-sm text-gray-500 dark:text-dark-text-secondary">
        <p>Última atualização: {lastUpdate}</p>
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Sistema Online
        </p>
      </div>
    </div>
  );
};

export default DashboardModerno;

