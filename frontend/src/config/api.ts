// Configuração da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

// Headers padrão
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Configuração de endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    LOGOUT: '/api/auth/logout',
  },
  CLIENTES: '/api/clientes',
  FORNECEDORES: '/api/fornecedores',
  PROJETOS: '/api/projetos',
  SERVICOS: '/api/servicos',
  MOVIMENTACOES: '/api/movimentacoes',
  HISTORICO: '/api/historico',
  NFE: '/api/nfe',
  EMPRESAS: '/api/empresas',
  DASHBOARD: {
    ESTATISTICAS: '/api/dashboard/estatisticas',
    GRAFICOS: '/api/dashboard/graficos',
    ALERTAS: '/api/dashboard/alertas',
  },
};
