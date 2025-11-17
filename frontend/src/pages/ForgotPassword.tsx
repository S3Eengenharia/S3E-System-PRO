import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { axiosApiService } from '../services/axiosApi';
import { DEFAULT_LOGO_URL, COMPANY_NAME, SYSTEM_NAME } from '../config/constants';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, informe seu email');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, informe um email válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosApiService.post('/api/auth/forgot-password', { email });
      
      if (response.success) {
        setEmailSent(true);
        toast.success('Email enviado com sucesso!', {
          description: 'Verifique sua caixa de entrada para redefinir sua senha.'
        });
      } else {
        toast.error(response.error || 'Erro ao enviar email de recuperação');
      }
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      toast.error(error?.response?.data?.error || 'Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Card de Recuperação */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!emailSent ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Esqueceu sua senha?</h2>
              <p className="text-gray-600 text-sm mb-6 text-center">
                Não se preocupe! Digite seu email e enviaremos instruções para redefinir sua senha.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a1a2f] focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Botão de Enviar */}
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
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Instruções'
                  )}
                </button>
              </form>

              {/* Link para voltar ao login */}
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-[#0a1a2f] hover:underline">
                  ← Voltar para o login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Email enviado!</h2>
              <p className="text-gray-600 text-sm mb-6">
                Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
                <br />
                <br />
                Verifique sua caixa de entrada e siga as instruções. O link expira em 1 hora.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-[#0a1a2f] to-[#0d2847] text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Voltar para o login
                </button>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full text-[#0a1a2f] py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all"
                >
                  Enviar novamente
                </button>
              </div>
            </div>
          )}
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

export default ForgotPassword;

