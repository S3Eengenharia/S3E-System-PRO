import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AxiosApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken && currentToken !== 'null' && currentToken !== 'undefined' && currentToken.trim() !== '') {
          config.headers.Authorization = `Bearer ${currentToken}`;
          console.log('🔐 Enviando token:', currentToken.substring(0, 20) + '...');
        } else {
          console.log('❌ Nenhum token válido encontrado para enviar. Token atual:', currentToken);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratamento de respostas
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        console.error('API Error:', error);
        
        if (error.response) {
          // Erro de resposta do servidor
          const status = error.response.status;
          const data = error.response.data as any;
          
          if (status === 401) {
            // Token expirado ou inválido
            this.clearToken();
            window.location.href = '/login';
            return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
          }
          
          return Promise.reject(new Error(data?.message || `HTTP error! status: ${status}`));
        } else if (error.request) {
          // Erro de rede
          return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'));
        } else {
          // Outros erros
          return Promise.reject(new Error(error.message || 'Erro desconhecido'));
        }
      }
    );

    this.token = localStorage.getItem('token');
  }

  // Método para atualizar o token quando necessário
  updateToken() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get(endpoint, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post(endpoint, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put(endpoint, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Upload de arquivos
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const axiosApiService = new AxiosApiService(API_CONFIG.BASE_URL);
