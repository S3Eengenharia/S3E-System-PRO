import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';


// Routes
import authRoutes from './routes/auth.js';
import materiaisRoutes from './routes/materiais.js';
import comprasRoutes from './routes/compras.js';
import orcamentosRoutes from './routes/orcamentos.js';
import configFiscalRoutes from './routes/configFiscal.js';
import vendasRoutes from './routes/vendas.routes.js';
import contasPagarRoutes from './routes/contasPagar.routes.js';
import relatoriosRoutes from './routes/relatorios.routes.js';
import protectedRoutes from './routes/protected.routes.js';
import alocacaoRoutes from './routes/alocacao.routes.js';
import comparacaoPrecosRoutes from './routes/comparacaoPrecos.routes.js';
import equipesRoutes from './routes/equipes.routes.js';
import etapasAdminRoutes from './routes/etapasAdmin.routes.js';
import clientesRoutes from './routes/clientes.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import projetosRoutes from './routes/projetos.js';
import pessoasRoutes from './routes/pessoa.routes.js';
import servicosRoutes from './routes/servicos.js';
import movimentacoesRoutes from './routes/movimentacoes.js';
import historicoRoutes from './routes/historico.js';
import nfeRoutes from './routes/nfe.js';
import empresasRoutes from './routes/empresas.js';
import dashboardRoutes from './routes/dashboard.js';
import quadrosRoutes from './routes/quadros.routes.js';
import configuracaoRoutes from './routes/configuracao.routes.js';
import obraRoutes from './routes/obra.routes.js';
import pdfCustomizationRoutes from './routes/pdfCustomization.routes.js';
import funcionariosRoutes from './routes/funcionarios.routes.js';
import valesRoutes from './routes/vales.routes.js';
import veiculosRoutes from './routes/veiculos.routes.js';
import gastosVeiculoRoutes from './routes/gastosVeiculo.routes.js';
import planosRoutes from './routes/planos.routes.js';
import despesasFixasRoutes from './routes/despesasFixas.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));

// Servir arquivos estáticos (uploads) com CORS habilitado
// Determinar caminho correto baseado em onde o servidor está rodando
const cwd = process.cwd();
const isBackendFolder = cwd.endsWith('backend');
const uploadsPath = isBackendFolder 
  ? path.join(cwd, 'uploads')
  : path.join(cwd, 'backend', 'uploads');

console.log('📁 Servindo uploads de:', uploadsPath);

// Middleware para adicionar headers CORS aos arquivos estáticos
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use('/uploads', express.static(uploadsPath));

// EXCEÇÃO: Não aplicar body parsers em rotas com upload de arquivos (multer)
// Lista de rotas que usam multipart/form-data
const uploadRoutes = [
  '/api/comparacao-precos/upload-csv',
  '/api/comparacao-precos/validate-csv',
  '/api/configuracoes/upload-logo'
];

// Body parsers COM EXCEÇÃO para rotas de upload
app.use((req, res, next) => {
  // Debug: ver qual é o path/url da requisição
  if (req.url.includes('comparacao-precos') || req.url.includes('upload')) {
    console.log(`🔍 DEBUG Upload - URL: ${req.url}, Path: ${req.path}, Method: ${req.method}`);
  }
  
  // Se a rota está na lista de upload, pula os body parsers
  // Usar req.url em vez de req.path pois req.path pode não incluir o prefixo completo
  const isUploadRoute = uploadRoutes.some(route => req.url.includes(route.split('/api')[1]));
  
  if (isUploadRoute) {
    console.log(`⚠️  PULANDO body parsers para rota de upload: ${req.url}`);
    return next();
  }
  
  // Aplica body parsers normalmente
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({
    message: 'S3E System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      protected: '/api/protected',
      materiais: '/api/materiais',
      compras: '/api/compras',
      orcamentos: '/api/orcamentos',
      vendas: '/api/vendas',
      contasPagar: '/api/contas-pagar',
      relatorios: '/api/relatorios',
      configFiscal: '/api/configuracoes-fiscais',
      obras: '/api/obras',
      comparacaoPrecos: '/api/comparacao-precos',
      equipes: '/api/equipes',
      pdfCustomization: '/api/pdf-customization',
      clientes: '/api/clientes',
      fornecedores: '/api/fornecedores',
      projetos: '/api/projetos',
      servicos: '/api/servicos',
      movimentacoes: '/api/movimentacoes',
      historico: '/api/historico',
      nfe: '/api/nfe',
      empresas: '/api/empresas',
      dashboard: '/api/dashboard',
      quadros: '/api/quadros',
      configuracoes: '/api/configuracoes',
      funcionarios: '/api/funcionarios',
      vales: '/api/vales',
      veiculos: '/api/veiculos',
      gastosVeiculo: '/api/gastos-veiculo',
      planos: '/api/planos',
      despesasFixas: '/api/despesas-fixas'
    }
  });
});

// Registrar rotas
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/materiais', materiaisRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/contas-pagar', contasPagarRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/configuracoes-fiscais', configFiscalRoutes);
app.use('/api/obras', alocacaoRoutes);
app.use('/api/comparacao-precos', comparacaoPrecosRoutes);
app.use('/api/equipes', equipesRoutes);
app.use('/api/projetos/etapas-admin', etapasAdminRoutes);
app.use('/api/pessoas', pessoasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/projetos', projetosRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/nfe', nfeRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quadros', quadrosRoutes);
app.use('/api/configuracoes', configuracaoRoutes);
app.use('/api/obras', obraRoutes);
app.use('/api/pdf-customization', pdfCustomizationRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/vales', valesRoutes);
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/gastos-veiculo', gastosVeiculoRoutes);
app.use('/api/planos', planosRoutes);
app.use('/api/despesas-fixas', despesasFixasRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor Rodando na porta ${PORT} por favor acesse: http://localhost:${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
