import { apiService } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(data: LoginData) {
    const response = await apiService.post<AuthResponse>('/api/auth/login', data);
    
    if (response.success && response.data) {
      apiService.setToken(response.data.token);
    }
    
    return response;
  }

  async register(data: RegisterData) {
    const response = await apiService.post<AuthResponse>('/api/auth/register', data);
    
    if (response.success && response.data) {
      apiService.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    apiService.clearToken();
  }

  async getProfile() {
    return apiService.get<User>('/api/auth/profile');
  }

  async updateProfile(data: Partial<User>) {
    return apiService.put<User>('/api/auth/profile', data);
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiService.put<{ message: string }>('/api/auth/change-password', data);
  }

  isAuthenticated(): boolean {
    return !!apiService['token'];
  }

  getToken(): string | null {
    return apiService['token'];
  }
}

export const authService = new AuthService();
