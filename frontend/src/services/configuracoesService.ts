import { axiosApiService } from './axiosApi';

export interface ConfiguracaoSistema {
  id: string;
  temaPreferido: string; // 'light' | 'dark' | 'system'
  logoUrl?: string;
  nomeEmpresa: string;
  emailContato?: string;
  telefoneContato?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConfiguracaoData {
  temaPreferido?: string;
  logoUrl?: string;
  nomeEmpresa?: string;
  emailContato?: string;
  telefoneContato?: string;
}

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioFiltros {
  search?: string;
  role?: string;
  active?: boolean;
}

class ConfiguracoesService {
  /**
   * Busca as configurações do sistema
   */
  async getConfiguracoes() {
    return axiosApiService.get<ConfiguracaoSistema>('/api/configuracoes');
  }

  /**
   * Salva/atualiza as configurações do sistema
   */
  async salvarConfiguracoes(data: UpdateConfiguracaoData) {
    return axiosApiService.put<ConfiguracaoSistema>('/api/configuracoes', data);
  }

  /**
   * Upload de logo da empresa
   */
  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    
    return axiosApiService.post<{ logoUrl: string; configuracoes: ConfiguracaoSistema }>('/api/configuracoes/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Lista todos os usuários
   */
  async listarUsuarios(filtros?: UsuarioFiltros) {
    return axiosApiService.get<Usuario[]>('/api/configuracoes/usuarios', filtros);
  }

  /**
   * Atualiza o role de um usuário
   */
  async atualizarUsuarioRole(userId: string, newRole: string) {
    return axiosApiService.put(`/api/configuracoes/usuarios/${userId}/role`, { role: newRole });
  }

  /**
   * Ativa/desativa um usuário
   */
  async toggleUsuarioStatus(userId: string, active: boolean) {
    return axiosApiService.put(`/api/configuracoes/usuarios/${userId}/status`, { active });
  }

  /**
   * Cria um novo usuário (Admin-only)
   */
  async criarUsuario(data: { email: string; password: string; name: string; role: string }) {
    return axiosApiService.post<Usuario>('/api/configuracoes/usuarios/criar', data);
  }
}

export const configuracoesService = new ConfiguracoesService();

