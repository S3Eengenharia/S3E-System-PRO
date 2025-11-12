// Configurações do Sistema S3E

// URL da API - Em produção, ajustar para o domínio real
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// URL padrão da logo da empresa
export const DEFAULT_LOGO_URL = `${API_BASE_URL}/uploads/logos/logo-branca.png`;

// Nome da empresa
export const COMPANY_NAME = 'S3E Engenharia Elétrica';
export const COMPANY_SHORT_NAME = 'S3E';

// Informações do sistema
export const SYSTEM_NAME = 'Sistema de Gestão Empresarial Elétrica';
export const SYSTEM_VERSION = '2.0.0';
export const COPYRIGHT_YEAR = new Date().getFullYear();

// Configurações de Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_UPLOAD = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

