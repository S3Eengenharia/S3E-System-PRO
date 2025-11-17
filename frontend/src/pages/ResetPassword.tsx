import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { axiosApiService } from '../services/axiosApi';
import { DEFAULT_LOGO_URL, COMPANY_NAME, SYSTEM_NAME } from '../config/constants';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Validar token ao carregar a página
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        setTokenValid(false);
        toast.error('Token de recuperação não encontrado');
        return;
      }

      try {
        const response = await axiosApiService.get(`/api/auth/validate-reset-token?token=${token}`);
        if (response.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          toast.error('Token inválido ou expirado');
        }
      } catch (error) {
        setTokenValid(false);
        toast.error('Erro ao validar token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosApiService.post('/api/auth/reset-password', {
        token,
        password
      });

      if (response.success) {
        toast.success('Senha redefinida com sucesso!', {
          description: 'Você já pode fazer login com sua nova senha.'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.error || 'Erro ao redefinir senha');
      }
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast.error(error?.response?.data?.error || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1a2f] via-[#0d2847] to-[#0a1a2f] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-blue-200">Validando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1a2f] via-[#0d2847] to-[#0a1a2f] px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Token Inválido</h2>
            <p className="text-gray-600 text-sm mb-6">
              O link de recuperação é inválido ou expirou. Por favor, solicite um novo link.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full bg-gradient-to-r from-[#0a1a2f] to-[#0d2847] text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Solicitar Novo Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1a2f] via-[#0d2847] to-[#0a1a2f] px-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-[2px]">
            <img 
              src={DEFAULT_LOGO_URL}
              alt={COMPANY_NAME}
              className="h-40 w-auto object-contain drop-shadow-2xl"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('3001')) {
                  target.src = 'http://localhost:3001/uploads/logos/logo-branca.png';
                } else {
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'text-white text-5xl font-bold tracking-wider drop-shadow-lg';
                  fallback.textContent = 'S3E ENGENHARIA';
                  target.parentElement!.appendChild(fallback);
                }
              }}
            />
          </div>
          <p className="text-blue-200 text-lg font-medium tracking-wide">{SYSTEM_NAME}</p>
        </div>

        {/* Card de Redefinição */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Redefinir Senha</h2>
          <p className="text-gray-600 text-sm mb-6 text-center">
            Digite sua nova senha abaixo
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a1a2f] focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a1a2f] focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            {/* Botão de Redefinir */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0a1a2f] to-[#0d2847] text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redefinindo...
                </span>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </form>

          {/* Link para voltar ao login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#0a1a2f] hover:underline">
              ← Voltar para o login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm space-y-2">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
          <p className="text-blue-300">
            Desenvolvido com carinho por:{' '}
            <a 
              href="https://antonio-jdev.github.io/portfolio-01/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold hover:text-white hover:underline transition-colors duration-200"
            >
              Dev Antonio Junio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

