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
    const storedToken = localStorage.getItem('token');
    console.log('🔑 [AuthProvider] Inicializando token do localStorage:', storedToken ? storedToken.substring(0, 30) + '...' : 'null');
    return storedToken;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Se tem token no localStorage, assumir autenticado inicialmente
    const storedToken = localStorage.getItem('token');
    const hasToken = storedToken && storedToken !== 'null' && storedToken !== 'undefined' && storedToken.trim() !== '';
    console.log('🔐 [AuthProvider] Estado inicial autenticado:', hasToken);
    return hasToken;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);

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
    // Evitar chamadas múltiplas simultâneas
    if (isCheckingAuth) {
      console.log('⏭️ [AuthContext] checkAuth já em execução, pulando...');
      return;
    }
    
    setIsCheckingAuth(true);
    
    // Sempre buscar o token mais recente do localStorage
    const currentToken = localStorage.getItem('token');
    console.log('🔍 [AuthContext] checkAuth chamado, token:', currentToken ? currentToken.substring(0, 30) + '...' : 'null');
    
    if (!currentToken || currentToken === 'null' || currentToken === 'undefined' || currentToken.trim() === '') {
      console.log('❌ [AuthContext] Nenhum token válido encontrado');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsCheckingAuth(false);
      return;
    }

    // Atualizar o estado do token
    setToken(currentToken);
    console.log('✅ [AuthContext] Token encontrado e definido no estado');

    try {
      console.log('🔐 [AuthContext] Verificando token com /api/auth/me...');
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/me`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ [AuthContext] Usuário autenticado:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.warn('⚠️ [AuthContext] Resposta não OK (status:', response.status, ')');
        
        // Só limpar se for realmente 401 (não autorizado)
        if (response.status === 401) {
          console.error('❌ [AuthContext] Token inválido (401), limpando autenticação');
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Erro temporário, manter autenticação
          console.warn('⚠️ [AuthContext] Erro temporário (status ' + response.status + '), mantendo autenticação');
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('❌ [AuthContext] Erro ao verificar autenticação:', error);
      
      // NÃO limpar o token em caso de erro de rede
      // Assumir que está autenticado se tem token válido
      console.warn('⚠️ [AuthContext] Erro de rede detectado, mantendo token e autenticação');
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
      setIsCheckingAuth(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    console.log('🔐 [AuthContext] Iniciando login para:', email);
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
        console.error('❌ [AuthContext] Erro no login:', errorData);
        throw new Error(errorData.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      console.log('✅ [AuthContext] Login bem-sucedido. Token recebido:', data.token?.substring(0, 30) + '...');
      
      // Salvar token no localStorage ANTES de definir no estado
      localStorage.setItem('token', data.token);
      console.log('✅ [AuthContext] Token salvo no localStorage');
      
      // Definir token no estado
      setToken(data.token);
      
      // Usar dados do usuário que já vêm no response
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ [AuthContext] Usuário definido:', data.user.name);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ [AuthContext] Erro no login:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 [AuthContext] Fazendo logout...');
    console.trace('Stack trace de quem chamou logout:');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ [AuthContext] Logout concluído, token removido');
  };

  // Update user
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Check auth on mount and when localStorage changes
  useEffect(() => {
    console.log('🚀 [AuthProvider] useEffect inicial disparado');
    
    // Verificar se já tem token antes de chamar checkAuth
    const currentToken = localStorage.getItem('token');
    if (currentToken && currentToken !== 'null' && currentToken !== 'undefined') {
      console.log('✅ [AuthProvider] Token encontrado no mount, chamando checkAuth');
      checkAuth();
    } else {
      console.log('❌ [AuthProvider] Sem token no mount, marcando como não autenticado');
      setIsLoading(false);
      setIsAuthenticated(false);
    }
    
    // Listener para detectar mudanças no localStorage (ex: outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('🔄 [AuthProvider] Token mudou no localStorage, recarregando autenticação...');
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      console.log('🧹 [AuthProvider] Limpando event listener');
      window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

