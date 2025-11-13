import React, { useEffect, useState } from 'react';
import { axiosApiService } from '../services/axiosApi';

interface HistoricoPreco {
  id: string;
  precoAntigo: number | null;
  precoNovo: number;
  motivo: string | null;
  usuario: string | null;
  createdAt: string;
}

interface Material {
  nome: string;
  sku: string;
  preco: number | null;
  ultimaAtualizacaoPreco: string | null;
}

interface HistoricoPrecosModalProps {
  materialId: string;
  isOpen: boolean;
  onClose: () => void;
}

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowTrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const ArrowTrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
  </svg>
);

const HistoricoPrecosModal: React.FC<HistoricoPrecosModalProps> = ({ materialId, isOpen, onClose }) => {
  const [historico, setHistorico] = useState<HistoricoPreco[]>([]);
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && materialId) {
      loadHistorico();
    }
  }, [isOpen, materialId]);

  const loadHistorico = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosApiService.get(`/api/materiais/${materialId}/historico-precos`);
      
      if (response.success && response.data) {
        setMaterial(response.data.material);
        setHistorico(response.data.historico || []);
      } else {
        setError('Erro ao carregar histórico');
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico de preços');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-medium">
              <ClockIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Histórico de Preços</h2>
              {material && (
                <div className="mt-1">
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    <span className="font-semibold">{material.nome}</span> • SKU: {material.sku}
                  </p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    Preço Atual: R$ {(material.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-300 font-medium">⚠️ {error}</p>
            </div>
          )}

          {!loading && !error && historico.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-2">Nenhum histórico encontrado</h3>
              <p className="text-gray-500 dark:text-dark-text-secondary">
                Este material ainda não teve alterações de preço registradas.
              </p>
            </div>
          )}

          {!loading && !error && historico.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                  📊 {historico.length} alterações registradas
                </h3>
              </div>

              {historico.map((item, index) => {
                const diferenca = item.precoAntigo 
                  ? ((item.precoNovo - item.precoAntigo) / item.precoAntigo) * 100 
                  : 0;
                const isAumento = item.precoNovo > (item.precoAntigo || 0);
                const isReducao = item.precoNovo < (item.precoAntigo || 0);

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-dark-border rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            #{historico.length - index}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')} às {new Date(item.createdAt).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preço Anterior</p>
                            <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
                              {item.precoAntigo ? `R$ ${item.precoAntigo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preço Novo</p>
                            <p className={`text-lg font-bold ${isAumento ? 'text-red-600' : isReducao ? 'text-green-600' : 'text-blue-600'}`}>
                              R$ {item.precoNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          {item.precoAntigo && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Variação</p>
                              <div className="flex items-center gap-1">
                                {isAumento && <ArrowTrendingUpIcon className="w-5 h-5 text-red-600" />}
                                {isReducao && <ArrowTrendingDownIcon className="w-5 h-5 text-green-600" />}
                                <p className={`text-lg font-bold ${isAumento ? 'text-red-600' : isReducao ? 'text-green-600' : 'text-blue-600'}`}>
                                  {diferenca > 0 ? '+' : ''}{diferenca.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {item.motivo && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                            <span className="font-medium">Motivo:</span>
                            <span>{item.motivo}</span>
                          </div>
                        )}

                        {item.usuario && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                            <span className="font-medium">Usuário:</span>
                            <span>{item.usuario}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        {isAumento && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg">
                            ↑ AUMENTO
                          </span>
                        )}
                        {isReducao && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg">
                            ↓ REDUÇÃO
                          </span>
                        )}
                        {!isAumento && !isReducao && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
                            = IGUAL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-medium font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoricoPrecosModal;

