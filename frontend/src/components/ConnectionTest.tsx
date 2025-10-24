import React, { useState } from 'react';
import { TEST_CREDENTIALS, API_CONFIG, TEST_ENDPOINTS } from '../config/test-credentials';

const ConnectionTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const newResults: Record<string, any> = {};

    try {
      // Teste 1: Health Check
      const healthResponse = await fetch(`${API_CONFIG.BASE_URL}${TEST_ENDPOINTS.HEALTH}`);
      newResults.health = {
        status: healthResponse.ok ? '✅ OK' : '❌ Error',
        statusCode: healthResponse.status,
        data: await healthResponse.json()
      };
    } catch (error) {
      newResults.health = { status: '❌ Failed', error: error.message };
    }

    try {
      // Teste 2: API Info
      const apiResponse = await fetch(`${API_CONFIG.BASE_URL}${TEST_ENDPOINTS.API_INFO}`);
      newResults.api = {
        status: apiResponse.ok ? '✅ OK' : '❌ Error',
        statusCode: apiResponse.status,
        data: await apiResponse.json()
      };
    } catch (error) {
      newResults.api = { status: '❌ Failed', error: error.message };
    }

    try {
      // Teste 3: Login
      const loginResponse = await fetch(`${API_CONFIG.BASE_URL}${TEST_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_CREDENTIALS.email,
          password: TEST_CREDENTIALS.password
        })
      });
      
      const loginData = await loginResponse.json();
      newResults.login = {
        status: loginResponse.ok ? '✅ OK' : '❌ Error',
        statusCode: loginResponse.status,
        data: loginData
      };
    } catch (error) {
      newResults.login = { status: '❌ Failed', error: error.message };
    }

    try {
      // Teste 4: Clientes (com token se login funcionou)
      if (results.login?.data?.token) {
        const clientesResponse = await fetch(`${API_CONFIG.BASE_URL}${TEST_ENDPOINTS.CLIENTES}`, {
          headers: {
            'Authorization': `Bearer ${results.login.data.token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const clientesData = await clientesResponse.json();
        newResults.clientes = {
          status: clientesResponse.ok ? '✅ OK' : '❌ Error',
          statusCode: clientesResponse.status,
          data: clientesData
        };
      } else {
        newResults.clientes = { status: '⏭️ Skipped', reason: 'No token available' };
      }
    } catch (error) {
      newResults.clientes = { status: '❌ Failed', error: error.message };
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">🔧 Teste de Conectividade</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Backend:</strong> {API_CONFIG.BASE_URL}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Credenciais de Teste:</strong> {TEST_CREDENTIALS.email} / {TEST_CREDENTIALS.password}
        </p>
      </div>

      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '🔄 Testando...' : '🧪 Executar Testes'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">📊 Resultados dos Testes:</h3>
          
          {Object.entries(results).map(([test, result]) => (
            <div key={test} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{test}</h4>
                <span className="text-sm">{result.status}</span>
              </div>
              
              {result.statusCode && (
                <p className="text-xs text-gray-500">Status Code: {result.statusCode}</p>
              )}
              
              {result.error && (
                <p className="text-xs text-red-500">Erro: {result.error}</p>
              )}
              
              {result.data && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-500 cursor-pointer">Ver dados</summary>
                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;
