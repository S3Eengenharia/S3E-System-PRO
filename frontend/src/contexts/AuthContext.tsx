import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Interceptor para adicionar token nas requisições
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    // Sempre buscar o token mais recente do localStorage
    const currentToken = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(typeof options.headers === 'object' && options.headers !== null && !(options.headers instanceof Headers)
        ? (options.headers as Record<string, string>)
        : {}),
    };

    // Verificar se temos um token válido
    if (currentToken && currentToken !== 'null' && currentToken !== 'undefined' && currentToken.trim() !== '') {
      headers['Authorization'] = `Bearer ${currentToken}`;
      console.log('🔐 AuthContext enviando token:', currentToken.substring(0, 20) + '...');
    } else {
      console.log('❌ AuthContext: Nenhum token válido encontrado. Token atual:', currentToken);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  // Check authentication status
  const checkAuth = async () => {
    // Sempre buscar o token mais recente do localStorage
    const currentToken = localStorage.getItem('token');
    console.log('🔍 checkAuth chamado, token do localStorage:', currentToken);
    
    if (!currentToken || currentToken === 'null' || currentToken === 'undefined' || currentToken.trim() === '') {
      console.log('❌ Nenhum token válido encontrado');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Atualizar o estado do token
    setToken(currentToken);

    try {
      console.log('🔐 Verificando token com /api/auth/me');
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/me`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Usuário autenticado:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Token inválido, limpando...');
        // Token inválido, limpar
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    console.log('🔐 Iniciando login para:', email);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Erro no login:', errorData);
        throw new Error(errorData.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      console.log('✅ Login bem-sucedido:', data);
      
      // Salvar token
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      // Usar dados do usuário que já vêm no response (evita race condition)
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ Usuário definido:', data.user);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log('❌ Erro no login:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

