// 🔔 COMPONENTE DE DEMONSTRAÇÃO DO SONNER
// Este componente é OPCIONAL e serve apenas para testar as notificações
// Você pode removê-lo depois de testar

import React from 'react';
import { toast } from 'sonner';

const SonnerDemo: React.FC = () => {
  // Exemplos básicos
  const showSuccess = () => {
    toast.success('Operação concluída com sucesso!', {
      description: 'Orçamento #1234 foi criado'
    });
  };

  const showError = () => {
    toast.error('Erro ao processar solicitação', {
      description: 'Verifique os dados e tente novamente'
    });
  };

  const showWarning = () => {
    toast.warning('Atenção: BDI muito baixo', {
      description: 'O BDI está abaixo do recomendado (15%)'
    });
  };

  const showInfo = () => {
    toast.info('Nova atualização disponível', {
      description: 'Versão 2.0 com novas funcionalidades'
    });
  };

  const showLoading = () => {
    toast.loading('Processando...', {
      description: 'Isso pode levar alguns segundos'
    });
  };

  // Exemplo com promise
  const showPromise = () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve({ numero: '1234' }), 2000);
    });

    toast.promise(promise, {
      loading: 'Criando orçamento...',
      success: (data: any) => `Orçamento #${data.numero} criado!`,
      error: 'Erro ao criar orçamento'
    });
  };

  // Exemplo com ação
  const showWithAction = () => {
    toast('Item removido do orçamento', {
      description: 'Disjuntor 32A Schneider',
      action: {
        label: 'Desfazer',
        onClick: () => toast.success('Item restaurado!')
      }
    });
  };

  // Exemplo de confirmação (substitui window.confirm)
  const showConfirmation = () => {
    toast('Confirmar exclusão do orçamento?', {
      description: 'Esta ação não pode ser desfeita. O orçamento será permanentemente excluído.',
      duration: 10000,
      action: {
        label: 'Confirmar',
        onClick: () => {
          const deletePromise = new Promise((resolve) => {
            setTimeout(() => resolve(true), 1500);
          });

          toast.promise(deletePromise, {
            loading: 'Excluindo orçamento...',
            success: 'Orçamento excluído com sucesso!',
            error: 'Erro ao excluir orçamento'
          });
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => toast.info('Exclusão cancelada')
      }
    });
  };

  // Exemplo customizado
  const showCustom = () => {
    toast('Novo orçamento pendente', {
      description: 'Cliente: João Silva - Valor: R$ 15.000,00',
      icon: '📋',
      duration: 5000,
      closeButton: true
    });
  };

  // Exemplo com ID (para atualizar depois)
  const showWithUpdate = () => {
    const toastId = toast.loading('Gerando PDF personalizado...', {
      description: 'Aplicando marca d\'água e configurações'
    });

    setTimeout(() => {
      toast.success('PDF gerado com sucesso!', {
        id: toastId,
        description: 'O download começará automaticamente'
      });
    }, 3000);
  };

  // Exemplo de múltiplos toasts (batch)
  const showBatch = () => {
    toast.success('Item 1 adicionado');
    setTimeout(() => toast.success('Item 2 adicionado'), 500);
    setTimeout(() => toast.success('Item 3 adicionado'), 1000);
    setTimeout(() => toast.info('3 itens adicionados ao orçamento'), 1500);
  };

  // Exemplo com ícone customizado
  const showWithIcon = () => {
    toast.success('PDF gerado!', {
      description: 'Orçamento_S3E_2024.pdf',
      icon: '📄'
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔔 Demonstração do Sonner Toast
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Teste todas as funcionalidades de notificação implementadas no sistema S3E
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tipos Básicos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Tipos Básicos
          </h3>
          <div className="space-y-2">
            <button
              onClick={showSuccess}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              ✅ Sucesso
            </button>
            <button
              onClick={showError}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              ❌ Erro
            </button>
            <button
              onClick={showWarning}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
            >
              ⚠️ Aviso
            </button>
            <button
              onClick={showInfo}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              ℹ️ Informação
            </button>
            <button
              onClick={showLoading}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              🔄 Loading
            </button>
          </div>
        </div>

        {/* Avançados */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Avançados
          </h3>
          <div className="space-y-2">
            <button
              onClick={showPromise}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              🎯 Com Promise
            </button>
            <button
              onClick={showWithAction}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              🔄 Com Ação (Desfazer)
            </button>
            <button
              onClick={showConfirmation}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
            >
              🗑️ Confirmação
            </button>
            <button
              onClick={showCustom}
              className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
            >
              ✨ Customizado
            </button>
            <button
              onClick={showWithUpdate}
              className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
            >
              🔄 Com Update
            </button>
          </div>
        </div>

        {/* Casos de Uso Real */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Casos de Uso
          </h3>
          <div className="space-y-2">
            <button
              onClick={showBatch}
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
            >
              📦 Múltiplos Itens
            </button>
            <button
              onClick={showWithIcon}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
            >
              📄 Gerar PDF
            </button>
            <button
              onClick={() => {
                toast.success('Item adicionado!', {
                  description: 'Disjuntor 32A - Qtd: 10 UN',
                  icon: '✏️'
                });
              }}
              className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors"
            >
              ✏️ Item Manual
            </button>
            <button
              onClick={() => {
                toast.error('Cliente obrigatório', {
                  description: 'Selecione um cliente para continuar'
                });
              }}
              className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors"
            >
              ⚠️ Validação
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              ❌ Fechar Todos
            </button>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
          📚 Documentação Completa
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Para ver todos os exemplos e aprender a usar o Sonner em seus componentes, consulte:
        </p>
        <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
          <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">GUIA_SONNER_TOAST.md</code> - Guia completo</li>
          <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">EXEMPLO_IMPLEMENTACAO_SONNER.tsx</code> - Exemplos práticos</li>
          <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">SONNER_IMPLEMENTADO.md</code> - Status da implementação</li>
        </ul>
      </div>

      {/* Aviso */}
      <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          ⚠️ <strong>Nota:</strong> Este componente é apenas para demonstração. 
          Você pode removê-lo após testar as funcionalidades.
        </p>
      </div>
    </div>
  );
};

export default SonnerDemo;

