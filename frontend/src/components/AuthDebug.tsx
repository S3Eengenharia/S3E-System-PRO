import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { axiosApiService } from '../services/axiosApi';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    const results: any = {};

    try {
      // Teste 1: Verificar localStorage
      const localToken = localStorage.getItem('token');
      results.localStorage = {
        token: localToken,
        isValid: localToken && localToken !== 'null' && localToken !== 'undefined'
      };

      // Teste 2: Verificar estado do hook
      results.hookState = {
        user,
        isAuthenticated,
        isLoading,
        token
      };

      // Teste 3: Testar API diretamente
      if (localToken && localToken !== 'null') {
        try {
          const response = await axiosApiService.get('/api/auth/me');
          results.apiTest = {
            success: response.success,
            data: response.data,
            error: response.error
          };
        } catch (error) {
          results.apiTest = {
            success: false,
            error: error.message
          };
        }
      } else {
        results.apiTest = {
          success: false,
          error: 'No token available'
        };
      }

      // Teste 4: Testar fetch manual
      if (localToken && localToken !== 'null') {
        try {
          const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          results.manualFetch = {
            status: response.status,
            ok: response.ok,
            data
          };
        } catch (error) {
          results.manualFetch = {
            error: error.message
          };
        }
      }

    } catch (error) {
      results.error = error.message;
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Debug de Autenticação</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Estado Atual</h3>
          <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sim' : '❌ Não'}</p>
          <p><strong>Carregando:</strong> {isLoading ? '⏳ Sim' : '✅ Não'}</p>
          <p><strong>Usuário:</strong> {user ? user.name : 'Nenhum'}</p>
          <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Nenhum'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Ações</h3>
          <div className="space-y-2">
            <button
              onClick={runTests}
              disabled={isTesting}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isTesting ? '🔄 Testando...' : '🧪 Executar Testes'}
            </button>
            <button
              onClick={clearAuth}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🗑️ Limpar Autenticação
            </button>
          </div>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">📊 Resultados dos Testes</h3>
          
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="border rounded p-4 mb-4">
              <h4 className="font-medium mb-2 capitalize">{test}</h4>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">🔧 Informações de Debug</h4>
        <p className="text-sm text-yellow-700">
          Este componente ajuda a identificar problemas de autenticação. 
          Verifique os resultados dos testes para entender onde está o problema.
        </p>
      </div>
    </div>
  );
};

export default AuthDebug;