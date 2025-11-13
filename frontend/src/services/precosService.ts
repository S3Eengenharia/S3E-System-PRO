import { axiosApiService } from './axiosApi';

export interface HistoricoPreco {
  id: string;
  precoAntigo: number | null;
  precoNovo: number;
  motivo: string | null;
  usuario: string | null;
  createdAt: string;
}

export interface Material {
  id: string;
  nome: string;
  sku: string;
  preco: number | null;
  ultimaAtualizacaoPreco: string | null;
}

export interface PreviewImportacao {
  sku: string;
  nome: string;
  unidade?: string;
  estoque?: number;
  precoAtual: number | null;
  precoNovo: number;
  diferenca?: number;
  fornecedor?: string;
  status: 'reducao' | 'aumento' | 'igual' | 'erro';
  mensagem: string;
}

export type StatusPreco = 'atualizado' | 'alerta' | 'critico';

class PrecosService {
  /**
   * Baixar template JSON de materiais
   */
  async downloadTemplateJSON(tipo: 'todos' | 'criticos' = 'todos'): Promise<Blob> {
    const response = await axiosApiService.get(
      `/api/materiais/template-importacao?tipo=${tipo}&formato=json`,
      { responseType: 'blob' }
    );
    return new Blob([response.data], { type: 'application/json' });
  }

  /**
   * Baixar template PDF de materiais
   */
  async downloadTemplatePDF(tipo: 'todos' | 'criticos' = 'todos'): Promise<Blob> {
    const response = await axiosApiService.get(
      `/api/materiais/template-importacao?tipo=${tipo}&formato=pdf`,
      { responseType: 'blob' }
    );
    return new Blob([response.data], { type: 'application/pdf' });
  }

  /**
   * Fazer preview de importação
   */
  async previewImportacao(arquivo: File): Promise<{
    totalItens: number;
    totalAlteracoes: number;
    totalErros: number;
    preview: PreviewImportacao[];
  }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    
    const response = await axiosApiService.post('/api/materiais/preview-importacao', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Erro ao processar preview');
  }

  /**
   * Importar e aplicar alterações de preços
   */
  async importarPrecos(arquivo: File): Promise<{
    atualizados: number;
    erros: number;
    total: number;
    detalhes: any[];
  }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    
    const response = await axiosApiService.post('/api/materiais/importar-precos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Erro ao importar preços');
  }

  /**
   * Buscar histórico de preços de um material
   */
  async getHistoricoPrecos(materialId: string): Promise<{
    material: Material;
    historico: HistoricoPreco[];
  }> {
    const response = await axiosApiService.get(`/api/materiais/${materialId}/historico-precos`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('Erro ao buscar histórico');
  }

  /**
   * Calcular dias desde última atualização
   */
  calcularDiasDesdeAtualizacao(ultimaAtualizacao: string | Date | null): number {
    if (!ultimaAtualizacao) return 999;
    
    const dataAtualizacao = new Date(ultimaAtualizacao);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - dataAtualizacao.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Obter status do preço (verde/amarelo/vermelho)
   */
  getStatusPreco(ultimaAtualizacao: string | Date | null): StatusPreco {
    const dias = this.calcularDiasDesdeAtualizacao(ultimaAtualizacao);
    
    if (dias <= 15) return 'atualizado';   // Verde
    if (dias <= 27) return 'alerta';       // Amarelo
    return 'critico';                       // Vermelho
  }

  /**
   * Verificar se preço está válido (dentro de 30 dias)
   */
  precoEstaValido(ultimaAtualizacao: string | Date | null): boolean {
    const dias = this.calcularDiasDesdeAtualizacao(ultimaAtualizacao);
    return dias <= 30;
  }

  /**
   * Obter cor da flag
   */
  getCorFlag(ultimaAtualizacao: string | Date | null): string {
    const status = this.getStatusPreco(ultimaAtualizacao);
    
    switch (status) {
      case 'atualizado':
        return '#10B981'; // Verde
      case 'alerta':
        return '#F59E0B'; // Amarelo
      case 'critico':
        return '#EF4444'; // Vermelho
    }
  }

  /**
   * Obter mensagem de status
   */
  getMensagemStatus(ultimaAtualizacao: string | Date | null): string {
    const dias = this.calcularDiasDesdeAtualizacao(ultimaAtualizacao);
    
    if (dias <= 15) {
      return 'Preço atualizado e dentro da validade';
    } else if (dias <= 27) {
      return `Atualizar em breve (${dias} dias desde última atualização)`;
    } else if (dias < 999) {
      return `URGENTE: Preço desatualizado (${dias} dias sem atualização)`;
    } else {
      return 'Preço nunca foi atualizado';
    }
  }

  /**
   * Validar material antes de adicionar ao orçamento
   * Retorna true se pode adicionar, false se não deve
   */
  validarPrecoParaOrcamento(
    material: { nome: string; ultimaAtualizacaoPreco: string | Date | null },
    mostrarAlerta: boolean = true
  ): boolean {
    const dias = this.calcularDiasDesdeAtualizacao(material.ultimaAtualizacaoPreco);
    
    if (dias > 27) {
      if (mostrarAlerta) {
        const confirmar = window.confirm(
          `⚠️ ATENÇÃO: Preço Desatualizado!\n\n` +
          `Material: ${material.nome}\n` +
          `Última atualização: há ${dias} dias\n\n` +
          `Recomenda-se atualizar o preço antes de usar no orçamento.\n\n` +
          `Deseja continuar mesmo assim?`
        );
        return confirmar;
      }
      return false;
    }
    
    return true; // Verde ou amarelo - OK para usar
  }

  /**
   * Obter estatísticas de preços
   */
  getEstatisticasPrecos(materiais: Array<{ ultimaAtualizacaoPreco: string | Date | null }>): {
    atualizados: number;
    alerta: number;
    criticos: number;
    total: number;
  } {
    const total = materiais.length;
    let atualizados = 0;
    let alerta = 0;
    let criticos = 0;

    materiais.forEach(material => {
      const status = this.getStatusPreco(material.ultimaAtualizacaoPreco);
      
      switch (status) {
        case 'atualizado':
          atualizados++;
          break;
        case 'alerta':
          alerta++;
          break;
        case 'critico':
          criticos++;
          break;
      }
    });

    return { atualizados, alerta, criticos, total };
  }

  /**
   * Formatar data de atualização para exibição
   */
  formatarDataAtualizacao(ultimaAtualizacao: string | Date | null): string {
    if (!ultimaAtualizacao) return 'Nunca atualizado';
    
    const data = new Date(ultimaAtualizacao);
    const dias = this.calcularDiasDesdeAtualizacao(ultimaAtualizacao);
    
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Ontem';
    if (dias <= 7) return `Há ${dias} dias`;
    if (dias <= 30) return `Há ${dias} dias`;
    if (dias <= 60) return `Há ${Math.floor(dias / 7)} semanas`;
    if (dias <= 365) return `Há ${Math.floor(dias / 30)} meses`;
    
    return `Há mais de 1 ano`;
  }
}

export const precosService = new PrecosService();

