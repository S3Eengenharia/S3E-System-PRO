import { axiosApiService } from './axiosApi';
import {
    PDFCustomization,
    SavedPDFTemplate,
    GeneratePDFRequest,
    GeneratePDFResponse,
    OrcamentoPDFData
} from '../types/pdfCustomization';

class PDFCustomizationService {
    /**
     * Gera PDF personalizado
     */
    async generateCustomPDF(orcamentoData: OrcamentoPDFData, customization: PDFCustomization): Promise<GeneratePDFResponse> {
        try {
            console.log('📄 Gerando PDF personalizado...');
            
            const request: GeneratePDFRequest = {
                orcamentoData,
                customization
            };

            const response = await axiosApiService.post<GeneratePDFResponse>(
                '/api/pdf-customization/generate-custom',
                request,
                {
                    responseType: 'blob' // Para download direto
                }
            );

            if (response.success && response.data) {
                // Criar URL para download
                const blob = new Blob([response.data as any], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const fileName = `Orcamento_${orcamentoData.numero}_${Date.now()}.pdf`;

                // Fazer download
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                return {
                    success: true,
                    fileName
                };
            }

            return {
                success: false,
                error: response.error || 'Erro ao gerar PDF',
                fileName: ''
            };
        } catch (error: any) {
            console.error('Erro ao gerar PDF:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao gerar PDF personalizado',
                fileName: ''
            };
        }
    }

    /**
     * Salva template de personalização
     */
    async saveTemplate(templateName: string, customization: PDFCustomization, description?: string) {
        try {
            const response = await axiosApiService.post<SavedPDFTemplate>('/api/pdf-customization/templates', {
                templateName,
                customization,
                description
            });

            return response;
        } catch (error: any) {
            console.error('Erro ao salvar template:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao salvar template'
            };
        }
    }

    /**
     * Lista todos os templates do usuário
     */
    async listTemplates() {
        try {
            const response = await axiosApiService.get<SavedPDFTemplate[]>('/api/pdf-customization/templates');
            return response;
        } catch (error: any) {
            console.error('Erro ao listar templates:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao carregar templates',
                data: []
            };
        }
    }

    /**
     * Carrega um template específico
     */
    async loadTemplate(templateId: string) {
        try {
            const response = await axiosApiService.get<SavedPDFTemplate>(`/api/pdf-customization/templates/${templateId}`);
            return response;
        } catch (error: any) {
            console.error('Erro ao carregar template:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao carregar template'
            };
        }
    }

    /**
     * Atualiza um template existente
     */
    async updateTemplate(templateId: string, templateName: string, customization: PDFCustomization, description?: string) {
        try {
            const response = await axiosApiService.put<SavedPDFTemplate>(`/api/pdf-customization/templates/${templateId}`, {
                templateName,
                customization,
                description
            });

            return response;
        } catch (error: any) {
            console.error('Erro ao atualizar template:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao atualizar template'
            };
        }
    }

    /**
     * Deleta um template
     */
    async deleteTemplate(templateId: string) {
        try {
            const response = await axiosApiService.delete(`/api/pdf-customization/templates/${templateId}`);
            return response;
        } catch (error: any) {
            console.error('Erro ao deletar template:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao deletar template'
            };
        }
    }

    /**
     * Upload de imagem para marca d'água
     */
    async uploadWatermark(imageFile: File) {
        try {
            const formData = new FormData();
            formData.append('watermark', imageFile);

            const response = await axiosApiService.post<{ url: string; success: boolean }>(
                '/api/pdf-customization/upload-watermark',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response;
        } catch (error: any) {
            console.error('Erro ao fazer upload da marca d\'água:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao fazer upload da imagem'
            };
        }
    }

    /**
     * Upload de design de canto customizado
     */
    async uploadCornerDesign(imageFile: File) {
        try {
            const formData = new FormData();
            formData.append('cornerDesign', imageFile);

            const response = await axiosApiService.post<{ url: string; success: boolean }>(
                '/api/pdf-customization/upload-corner-design',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response;
        } catch (error: any) {
            console.error('Erro ao fazer upload do design de canto:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao fazer upload do design'
            };
        }
    }

    /**
     * Gera preview do PDF (retorna base64 ou URL)
     */
    async generatePreview(orcamentoData: OrcamentoPDFData, customization: PDFCustomization) {
        try {
            const response = await axiosApiService.post<{ previewUrl: string; success: boolean }>(
                '/api/pdf-customization/generate-preview',
                {
                    orcamentoData,
                    customization
                }
            );

            return response;
        } catch (error: any) {
            console.error('Erro ao gerar preview:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao gerar preview'
            };
        }
    }
}

export const pdfCustomizationService = new PDFCustomizationService();
export default pdfCustomizationService;

