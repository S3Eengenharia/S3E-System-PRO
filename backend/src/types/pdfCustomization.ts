/**
 * Types compartilhados entre Frontend e Backend para Customização de PDF
 */

export type WatermarkType = 'logo' | 'text' | 'design' | 'none';
export type WatermarkPosition = 'center' | 'corners' | 'full-page' | 'header' | 'footer' | 'diagonal';
export type WatermarkSize = 'small' | 'medium' | 'large';
export type TemplateType = 'modern' | 'classic' | 'technical' | 'minimal';
export type CornerDesignType = 'geometric' | 'curves' | 'lines' | 'custom' | 'none';

export interface WatermarkConfig {
    type: WatermarkType;
    content: string;
    position: WatermarkPosition;
    opacity: number;
    size: WatermarkSize;
    rotation: number;
    color?: string;
}

export interface CornerDesignConfig {
    enabled: boolean;
    design: CornerDesignType;
    image?: string;
    opacity: number;
    size: number;
}

export interface DesignColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export interface DesignConfig {
    template: TemplateType;
    colors: DesignColors;
    corners: CornerDesignConfig;
    typography: {
        fontFamily: string;
        fontSize: string;
    };
    orientation: 'portrait' | 'landscape';
    pageSize: 'A4' | 'Letter';
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface ContentConfig {
    showTechnicalDescriptions: boolean;
    showImages: boolean;
    includeSafetyWarnings: boolean;
    showCompanyHeader: boolean;
    showCompanyFooter: boolean;
    showSignatures: boolean;
    showTermsAndConditions: boolean;
    showPaymentInfo: boolean;
    showItemCodes: boolean;
    showItemImages: boolean;
}

export interface PDFCustomization {
    watermark: WatermarkConfig;
    design: DesignConfig;
    content: ContentConfig;
    metadata: {
        templateName: string;
        isDefault: boolean;
        createdAt: Date;
    };
}

export interface OrcamentoPDFData {
    numero: string;
    data: string;
    validade: string;
    cliente: {
        nome: string;
        cpfCnpj: string;
        endereco?: string;
        telefone?: string;
        email?: string;
    };
    projeto: {
        titulo: string;
        descricao?: string;
        enderecoObra?: string;
        cidade?: string;
        bairro?: string;
        cep?: string;
    };
    items: {
        codigo?: string;
        nome: string;
        descricao?: string;
        unidade: string;
        quantidade: number;
        valorUnitario: number;
        valorTotal: number;
    }[];
    financeiro: {
        subtotal: number;
        bdi: number;
        valorComBDI: number;
        desconto: number;
        impostos: number;
        valorTotal: number;
        condicaoPagamento: string;
    };
    observacoes?: string;
    empresa?: {
        nome: string;
        cnpj: string;
        logo?: string;
    };
}

