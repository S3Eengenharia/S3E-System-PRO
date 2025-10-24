import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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
import pdfRoutes from './routes/pdf.routes.js';
import clientesRoutes from './routes/clientes.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import projetosRoutes from './routes/projetos.js';
import servicosRoutes from './routes/servicos.js';
import movimentacoesRoutes from './routes/movimentacoes.js';
import historicoRoutes from './routes/historico.js';
import nfeRoutes from './routes/nfe.js';
import empresasRoutes from './routes/empresas.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' })); // Aumentado para suportar XMLs grandes
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
      pdf: '/api/pdf',
      clientes: '/api/clientes',
      fornecedores: '/api/fornecedores',
      projetos: '/api/projetos',
      servicos: '/api/servicos',
      movimentacoes: '/api/movimentacoes',
      historico: '/api/historico',
      nfe: '/api/nfe',
      empresas: '/api/empresas',
      dashboard: '/api/dashboard'
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
app.use('/api/pdf', pdfRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/projetos', projetosRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/nfe', nfeRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
