import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";

interface PrecoValidadeFlagProps {
  ultimaAtualizacao: string | Date | null;
  precoAtual: number;
  materialNome: string;
}

const PrecoValidadeFlag: React.FC<PrecoValidadeFlagProps> = ({ 
  ultimaAtualizacao, 
  precoAtual,
  materialNome 
}) => {
  const calcularDiasDesdeAtualizacao = (): number => {
    if (!ultimaAtualizacao) return 999; // Nunca atualizado
    
    const dataAtualizacao = new Date(ultimaAtualizacao);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - dataAtualizacao.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const dias = calcularDiasDesdeAtualizacao();

  const getStatusPreco = () => {
    if (dias <= 15) {
      return {
        cor: 'bg-green-500',
        texto: 'Preço Atualizado',
        icone: '✅',
        descricao: 'O preço deste material foi atualizado recentemente e está dentro da validade.',
        borderColor: 'border-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50'
      };
    } else if (dias <= 27) {
      return {
        cor: 'bg-yellow-500',
        texto: 'Atualizar em Breve',
        icone: '⚠️',
        descricao: 'O preço está próximo da data de atualização. Considere verificar com fornecedores.',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50'
      };
    } else {
      return {
        cor: 'bg-red-500',
        texto: 'Preço Desatualizado',
        icone: '❌',
        descricao: 'O preço está desatualizado. É necessário atualizar o valor com o mercado.',
        borderColor: 'border-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50'
      };
    }
  };

  const status = getStatusPreco();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-help inline-flex items-center">
          <div className={`w-3 h-3 rounded-full ${status.cor} animate-pulse`}></div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className={`flex items-center gap-2 p-2 rounded-lg ${status.bgColor} border ${status.borderColor}`}>
            <span className="text-2xl">{status.icone}</span>
            <div className="flex-1">
              <h4 className={`font-bold ${status.textColor}`}>{status.texto}</h4>
              <p className="text-xs text-gray-600 mt-1">{status.descricao}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Material:</span>
              <span className="text-gray-900 font-semibold">{materialNome}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Preço Atual:</span>
              <span className="text-gray-900 font-bold">
                R$ {precoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Última Atualização:</span>
              <span className="text-gray-900">
                {ultimaAtualizacao 
                  ? new Date(ultimaAtualizacao).toLocaleDateString('pt-BR')
                  : 'Nunca atualizado'
                }
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Dias desde atualização:</span>
              <span className={`font-bold ${status.textColor}`}>
                {dias > 365 ? 'Nunca' : `${dias} dias`}
              </span>
            </div>
          </div>

          <div className={`mt-3 p-3 rounded-lg border-2 ${status.borderColor} ${status.bgColor}`}>
            <p className="text-xs font-semibold text-gray-700 mb-1">💡 Recomendação:</p>
            <p className="text-xs text-gray-600">
              {dias <= 15 && 'Preço dentro da validade de 30 dias.'}
              {dias > 15 && dias <= 27 && 'Verifique preços com fornecedores em breve.'}
              {dias > 27 && 'Atualize o preço imediatamente via "Atualização de Preços".'}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default PrecoValidadeFlag;

