import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';

interface Material {
  materialCode: string;
  materialName: string;
  currentPrice: number;
  newPrice: number;
  difference: number;
}

interface PreviewAtualizacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiais: Material[];
  onConfirmar: () => void;
  isProcessing?: boolean;
}

const PreviewAtualizacaoModal: React.FC<PreviewAtualizacaoModalProps> = ({
  isOpen,
  onClose,
  materiais,
  onConfirmar,
  isProcessing = false,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const totalMateriais = materiais.length;
  const valorAnteriorTotal = materiais.reduce((sum, m) => sum + m.currentPrice, 0);
  const valorNovoTotal = materiais.reduce((sum, m) => sum + m.newPrice, 0);
  const diferencaTotal = valorNovoTotal - valorAnteriorTotal;
  const percentualTotal = valorAnteriorTotal > 0 ? ((diferencaTotal / valorAnteriorTotal) * 100) : 0;

  const handleConfirmarClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmarFinal = () => {
    setShowConfirmDialog(false);
    onConfirmar();
  };

  return (
    <>
      {/* Modal de Preview */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              📋 Preview de Atualização de Preços
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Revise as alterações antes de confirmar a atualização
            </DialogDescription>
          </DialogHeader>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-semibold">Total de Itens</div>
              <div className="text-2xl font-bold text-blue-900">{totalMateriais}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 font-semibold">Valor Anterior</div>
              <div className="text-2xl font-bold text-gray-900">
                R$ {valorAnteriorTotal.toFixed(2)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 font-semibold">Valor Novo</div>
              <div className="text-2xl font-bold text-green-900">
                R$ {valorNovoTotal.toFixed(2)}
              </div>
            </div>
            <div className={`rounded-lg p-4 border ${
              diferencaTotal > 0 
                ? 'bg-red-50 border-red-200' 
                : diferencaTotal < 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`text-sm font-semibold ${
                diferencaTotal > 0 ? 'text-red-600' : diferencaTotal < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                Diferença
              </div>
              <div className={`text-2xl font-bold ${
                diferencaTotal > 0 ? 'text-red-900' : diferencaTotal < 0 ? 'text-green-900' : 'text-gray-900'
              }`}>
                {diferencaTotal > 0 ? '+' : ''}{percentualTotal.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Tabela de Materiais */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700">SKU</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Material</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Preço Anterior</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Preço Novo</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Diferença</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materiais.map((material, index) => {
                    const diferenca = material.newPrice - material.currentPrice;
                    const percentual = material.currentPrice > 0 
                      ? ((diferenca / material.currentPrice) * 100) 
                      : 0;
                    const isAumento = diferenca > 0;
                    const isDiminuicao = diferenca < 0;

                    return (
                      <tr 
                        key={material.materialCode} 
                        className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="p-3 font-mono text-xs text-gray-600">
                          {material.materialCode}
                        </td>
                        <td className="p-3 text-gray-900 max-w-xs truncate" title={material.materialName}>
                          {material.materialName}
                        </td>
                        <td className="p-3 text-right font-medium text-gray-700">
                          R$ {material.currentPrice.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-medium text-gray-900">
                          R$ {material.newPrice.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`font-semibold ${
                              isAumento ? 'text-red-600' : isDiminuicao ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {diferenca > 0 ? '+' : ''}{diferenca.toFixed(2)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isAumento 
                                ? 'bg-red-100 text-red-700' 
                                : isDiminuicao 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {diferenca > 0 ? '↑' : diferenca < 0 ? '↓' : '='} {Math.abs(percentual).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              ❌ Cancelar
            </Button>
            <Button
              onClick={handleConfirmarClick}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? '⏳ Processando...' : '✅ Confirmar Atualização'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="text-xl flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Confirmar Atualização de Preços?
              </div>
            </AlertDialogTitle>
            <div className="space-y-3 text-base text-gray-600">
              <div className="font-semibold text-gray-900">
                Você está prestes a atualizar os preços de <span className="text-blue-600">{totalMateriais} materiais</span>.
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <div className="font-semibold mb-1">⚠️ Atenção:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Esta ação não pode ser desfeita automaticamente</li>
                  <li>Os preços antigos ficarão salvos no histórico</li>
                  <li>Orçamentos futuros usarão os novos preços</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-600">Valor Total Anterior:</div>
                  <div className="font-bold text-gray-900">R$ {valorAnteriorTotal.toFixed(2)}</div>
                </div>
                <div className="bg-blue-50 rounded p-2">
                  <div className="text-blue-600">Valor Total Novo:</div>
                  <div className="font-bold text-blue-900">R$ {valorNovoTotal.toFixed(2)}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mt-3">
                Deseja realmente continuar?
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              ❌ Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarFinal}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? '⏳ Atualizando...' : '✅ Sim, Atualizar Preços'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PreviewAtualizacaoModal;

