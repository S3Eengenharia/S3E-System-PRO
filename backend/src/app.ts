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
import relatoriosRoutes from './routes/relatorios.routes.js';
import protectedRoutes from './routes/protected.routes.js';

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
      relatorios: '/api/relatorios',
      configFiscal: '/api/configuracoes-fiscais'
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
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/configuracoes-fiscais', configFiscalRoutes);

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
