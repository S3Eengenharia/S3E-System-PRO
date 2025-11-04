import { axiosApiService } from './axiosApi';

/**
 * Interfaces
 */
export interface EmissaoNFeRequest {
  pedidoId: string;
  empresaId: string;
}

export interface CancelamentoNFeRequest {
  chaveAcesso: string;
  justificativa: string;
  empresaId: string;
}

export interface CorrecaoNFeRequest {
  chaveAcesso: string;
  textoCorrecao: string;
  sequencia?: number;
  empresaId: string;
}

export interface ConfigFiscalRequest {
  certificadoPFX: string; // Base64
  senhaCertificado: string;
  ambienteFiscal: '1' | '2'; // 1=Produção, 2=Homologação
}

export interface NFeResponse {
  chaveAcesso: string;
  protocolo: string;
  dataAutorizacao: string;
  mensagem: string;
  xml?: string;
}

export interface ConsultaNFeResponse {
  chaveAcesso: string;
  situacao: string;
  protocolo: string;
  dataAutorizacao: string;
  codigoStatus: string;
  mensagem: string;
}

/**
 * Service para operações fiscais de NF-e
 */
class NFeFiscalService {
  /**
   * Emitir NF-e a partir de um pedido
   */
  async emitirNFe(data: EmissaoNFeRequest) {
    console.log('📤 Emitindo NF-e:', data);
    return axiosApiService.post<NFeResponse>('/api/nfe/emitir', data);
  }

  /**
   * Cancelar NF-e autorizada
   */
  async cancelarNFe(data: CancelamentoNFeRequest) {
    console.log('🚫 Cancelando NF-e:', data);
    return axiosApiService.post<any>('/api/nfe/cancelar', data);
  }

  /**
   * Enviar Carta de Correção (CC-e)
   */
  async corrigirNFe(data: CorrecaoNFeRequest) {
    console.log('📝 Enviando CC-e:', data);
    return axiosApiService.post<any>('/api/nfe/corrigir', data);
  }

  /**
   * Salvar configurações fiscais (certificado e ambiente)
   */
  async salvarConfigFiscal(data: ConfigFiscalRequest) {
    console.log('🔧 Salvando configurações fiscais');
    return axiosApiService.post<any>('/api/nfe/config', data);
  }

  /**
   * Consultar status de NF-e na SEFAZ
   */
  async consultarNFe(chaveAcesso: string) {
    console.log('🔍 Consultando NF-e:', chaveAcesso);
    return axiosApiService.get<ConsultaNFeResponse>(`/api/nfe/consultar/${chaveAcesso}`);
  }

  /**
   * Converter arquivo PFX para Base64
   */
  async converterPFXParaBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo "data:..." se existir
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const nfeFiscalService = new NFeFiscalService();

