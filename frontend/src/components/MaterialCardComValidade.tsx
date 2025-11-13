import React, { useState } from 'react';
import PrecoValidadeFlag from './PrecoValidadeFlag';
import HistoricoPrecosModal from './HistoricoPrecosModal';

interface Material {
  id: string;
  nome: string;
  sku: string;
  preco: number;
  estoque: number;
  unidadeMedida: string;
  ultimaAtualizacaoPreco?: string | null;
}

interface MaterialCardComValidadeProps {
  material: Material;
  onSelect?: (material: Material) => void;
  showHistorico?: boolean;
}

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * COMPONENTE DE EXEMPLO: Material Card com Flag de Validade de Preço
 * 
 * Este componente demonstra como integrar:
 * - Flag de validade de preço (verde/amarelo/vermelho)
 * - HoverCard com informações detalhadas
 * - Botão para visualizar histórico completo
 * 
 * COMO USAR EM ORÇAMENTOS:
 * 1. Importe PrecoValidadeFlag e HistoricoPrecosModal
 * 2. Adicione estado para o modal: const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
 * 3. Adicione estado para material selecionado: const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
 * 4. Ao listar materiais, adicione a flag e botão de histórico conforme exemplo abaixo
 */
const MaterialCardComValidade: React.FC<MaterialCardComValidadeProps> = ({ 
  material, 
  onSelect,
  showHistorico = true 
}) => {
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white">{material.nome}</h3>
              {/* FLAG DE VALIDADE - Mostra status do preço */}
              <PrecoValidadeFlag 
                ultimaAtualizacao={material.ultimaAtualizacaoPreco}
                precoAtual={material.preco}
                materialNome={material.nome}
              />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {material.sku}
              </span>
              <span>Estoque: {material.estoque} {material.unidadeMedida}</span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Preço Unitário</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {material.ultimaAtualizacaoPreco && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>Atualizado em:</p>
                  <p className="font-semibold">
                    {new Date(material.ultimaAtualizacaoPreco).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {showHistorico && (
              <button
                onClick={() => setHistoricoModalOpen(true)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-semibold"
                title="Ver histórico de preços"
              >
                <ClockIcon className="w-4 h-4" />
                Histórico
              </button>
            )}

            {onSelect && (
              <button
                onClick={() => onSelect(material)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all font-semibold"
              >
                Adicionar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Histórico */}
      <HistoricoPrecosModal 
        materialId={material.id}
        isOpen={historicoModalOpen}
        onClose={() => setHistoricoModalOpen(false)}
      />
    </>
  );
};

export default MaterialCardComValidade;

