// Configuração da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

/**
 * Constrói a URL completa para um arquivo de upload (logo, imagem, etc.)
 * Se a URL já começar com http/https, retorna ela mesma.
 * Caso contrário, concatena com a BASE_URL da API.
 */
export const getUploadUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Remove a barra inicial se existir, pois vamos adicionar
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_CONFIG.BASE_URL}${cleanUrl}`;
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
  MATERIAIS: '/api/materiais',
  KITS: '/api/kits',
  CATALOGO: {
    // Usando materiais como base para o catálogo
    ITENS: '/api/materiais',
    SERVICOS: '/api/servicos',
    KITS: '/api/kits',
  },
  DASHBOARD: {
    ESTATISTICAS: '/api/dashboard/estatisticas',
    GRAFICOS: '/api/dashboard/graficos',
    ALERTAS: '/api/dashboard/alertas',
  },
  OBRAS: {
    EQUIPES: '/api/obras/equipes',
    ALOCACOES: '/api/obras/alocacoes',
    CALENDARIO: '/api/obras/alocacoes/calendario',
  },
  ORCAMENTOS: '/api/orcamentos',
  RELATORIOS: {
    FINANCEIRO: '/api/relatorios/financeiro',
    FINANCEIRO_RESUMO: '/api/relatorios/financeiro/resumo',
  },
  COMPARACAO_PRECOS: '/api/comparacao-precos',
};
