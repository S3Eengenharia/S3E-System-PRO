// Credenciais de teste para desenvolvimento
export const TEST_CREDENTIALS = {
  email: 'admin@s3eengenharia.com.br',
  password: '123456A',
  name: 'Admin S3E',
  role: 'admin'
};

// Configuração de API para desenvolvimento
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Endpoints de teste
export const TEST_ENDPOINTS = {
  HEALTH: '/health',
  API_INFO: '/api',
  LOGIN: '/api/auth/login',
  CLIENTES: '/api/clientes',
  SERVICOS: '/api/servicos',
  DASHBOARD: '/api/dashboard/estatisticas',
};
