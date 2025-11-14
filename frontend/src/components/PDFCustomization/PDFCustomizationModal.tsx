import React, { useState } from 'react';
import { toast } from 'sonner';
import { usePDFCustomization } from '../../hooks/usePDFCustomization';
import { pdfCustomizationService } from '../../services/pdfCustomizationService';
import { OrcamentoPDFData, CORNER_DESIGNS } from '../../types/pdfCustomization';

// Icons
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
);

interface PDFCustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    orcamentoId: string;
    orcamentoData: OrcamentoPDFData;
    onGeneratePDF?: () => void;
}

const PDFCustomizationModal: React.FC<PDFCustomizationModalProps> = ({
    isOpen,
    onClose,
    orcamentoId,
    orcamentoData,
    onGeneratePDF
}) => {
    const {
        customization,
        handleCornerDesignChange,
        handleContentChange,
        resetToDefault,
        hasUnsavedChanges
    } = usePDFCustomization();

    const [activeTab, setActiveTab] = useState<'design' | 'content' | 'preview'>('design');
    const [generating, setGenerating] = useState(false);
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [previewHTML, setPreviewHTML] = useState<string>('');
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Gerar preview HTML
    const gerarPreviewHTML = React.useCallback(async () => {
        if (!orcamentoId) {
            console.error('ID do orçamento não fornecido');
            return;
        }

        try {
            setLoadingPreview(true);
            console.log('🔄 Gerando preview para orçamento:', orcamentoId);
            
            const response = await pdfCustomizationService.generatePreview(orcamentoId, customization);
            
            if (response.success && response.data) {
                console.log('✅ Preview gerado com sucesso');
                setPreviewHTML(response.data.html || response.data);
            } else {
                console.error('❌ Erro ao gerar preview:', response.error);
                toast.error('Erro ao gerar preview', {
                    description: response.error || 'Erro desconhecido'
                });
            }
        } catch (error: any) {
            console.error('❌ Exceção ao gerar preview:', error);
            toast.error('Erro ao gerar preview', {
                description: error.message || 'Erro ao carregar preview'
            });
        } finally {
            setLoadingPreview(false);
        }
    }, [orcamentoId, customization]);

    // Gerar preview automaticamente quando abrir o modal na aba de preview
    React.useEffect(() => {
        if (isOpen && activeTab === 'preview' && !previewHTML && customization) {
            gerarPreviewHTML();
        }
    }, [isOpen, activeTab, customization, previewHTML, gerarPreviewHTML]);

    if (!isOpen) return null;

    // Validar props necessárias
    if (!orcamentoId) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md">
                    <h3 className="text-xl font-bold text-red-600 mb-4">Erro</h3>
                    <p className="text-gray-700 dark:text-dark-text mb-4">
                        ID do orçamento não fornecido. Por favor, feche e tente novamente.
                    </p>
                    <button onClick={onClose} className="btn-primary w-full">
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    // Validar se customization foi carregado
    if (!customization) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md">
                    <div className="flex items-center justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                    <p className="text-center text-gray-700 dark:text-dark-text">
                        Carregando configurações...
                    </p>
                </div>
            </div>
        );
    }

    // Gerar PDF personalizado
    const handleGeneratePDF = async () => {
        setGenerating(true);
        
        const promise = (async () => {
            try {
                const result = await pdfCustomizationService.generatePersonalizedPDF(orcamentoId, customization);
                
                if (result.success) {
                    if (onGeneratePDF) onGeneratePDF();
                    setTimeout(() => onClose(), 1000);
                    return result.fileName || 'Orçamento.pdf';
                } else {
                    throw new Error(result.error || 'Erro ao gerar PDF');
                }
            } finally {
                setGenerating(false);
            }
        })();

        toast.promise(promise, {
            loading: 'Gerando PDF personalizado...',
            success: (fileName) => ({
                title: 'PDF gerado com sucesso!',
                description: `Arquivo: ${fileName} - Download iniciado automaticamente`
            }),
            error: (err) => ({
                title: 'Erro ao gerar PDF',
                description: err.message
            })
        });
    };

    // Salvar template
    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            toast.error('Nome obrigatório', {
                description: 'Digite um nome para o template'
            });
            return;
        }

        const promise = (async () => {
            const response = await pdfCustomizationService.saveTemplate(templateName, customization);
            if (response.success) {
                setShowSaveTemplate(false);
                setTemplateName('');
                return templateName;
            } else {
                throw new Error(response.error || 'Erro ao salvar template');
            }
        })();

        toast.promise(promise, {
            loading: 'Salvando template...',
            success: (name) => ({
                title: 'Template salvo!',
                description: `"${name}" está disponível para reutilização`,
                icon: '💾'
            }),
            error: (err) => err.message || 'Erro ao salvar template'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-[#0a1a2f] dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">🎨 Personalizar PDF</h2>
                            <p className="text-sm text-white/80 mt-1">Customize o design e conteúdo do seu orçamento</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6">
                        {[
                            { id: 'design', label: '🎨 Design', icon: '🎨' },
                            { id: 'content', label: '📄 Conteúdo', icon: '📄' },
                            { id: 'preview', label: '👁️ Pré-visualização', icon: '👁️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-purple-700'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Painel de Controles */}
                    <div className="w-2/5 p-6 overflow-y-auto border-r border-gray-200 dark:border-dark-border">
                        {/* TAB: Design */}
                        {activeTab === 'design' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">🎨 Design</h3>
                                    
                                    {/* Upload de Folha Timbrada Personalizada */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-3">
                                            📄 Folha Timbrada Personalizada
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-3">
                                            Faça upload de uma imagem de fundo personalizada para usar como folha timbrada (PNG ou JPG)
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        handleCornerDesignChange({ 
                                                            enabled: true,
                                                            design: 'custom',
                                                            image: reader.result as string 
                                                        });
                                                        toast.success('Folha timbrada carregada!');
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {customization.design.corners.enabled && customization.design.corners.design === 'custom' && customization.design.corners.image && (
                                            <div className="mt-2 p-2 bg-green-50 text-green-700 rounded flex items-center gap-2">
                                                <span>✓</span> Folha timbrada carregada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: Conteúdo */}
                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">📄 Conteúdo do PDF</h3>
                                
                                <div className="space-y-3">
                                    {[
                                        { key: 'showCompanyHeader', label: 'Cabeçalho da Empresa', icon: '🏢' },
                                        { key: 'showTechnicalDescriptions', label: 'Descrições Técnicas', icon: '📋' },
                                        { key: 'showImages', label: 'Imagens dos Itens', icon: '🖼️' },
                                        { key: 'showItemCodes', label: 'Códigos dos Itens', icon: '#️⃣' },
                                        { key: 'includeSafetyWarnings', label: 'Avisos de Segurança', icon: '⚠️' },
                                        { key: 'showSignatures', label: 'Espaço para Assinaturas', icon: '✍️' },
                                        { key: 'showTermsAndConditions', label: 'Termos e Condições', icon: '📜' },
                                        { key: 'showPaymentInfo', label: 'Informações de Pagamento', icon: '💳' },
                                        { key: 'showCompanyFooter', label: 'Rodapé da Empresa', icon: '📍' }
                                    ].map(({ key, label, icon }) => (
                                        <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={customization.content[key as keyof typeof customization.content]}
                                                onChange={(e) => handleContentChange({ [key]: e.target.checked })}
                                                className="w-5 h-5 text-purple-600 rounded"
                                            />
                                            <span className="text-xl">{icon}</span>
                                            <span className="text-sm font-medium text-gray-700 dark:text-dark-text flex-1">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: Preview */}
                        {activeTab === 'preview' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">👁️ Pré-visualização</h3>
                                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                    Preview em tempo real do PDF que será gerado. Ajuste as configurações nas outras abas e clique em "Atualizar Preview".
                                </p>
                                
                                {/* Botões de Ação */}
                                <div className="space-y-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={gerarPreviewHTML}
                                        disabled={loadingPreview}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        {loadingPreview ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Atualizando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Atualizar Preview
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowSaveTemplate(true)}
                                        className="btn-secondary w-full flex items-center justify-center gap-2"
                                    >
                                        <SaveIcon className="w-5 h-5" />
                                        Salvar como Template
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetToDefault}
                                        className="btn-ghost w-full"
                                    >
                                        Restaurar Padrão
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Área de Preview */}
                    <div className="flex-1 p-6 bg-gray-100 dark:bg-slate-900 overflow-y-auto">
                        {loadingPreview ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Gerando preview...</p>
                                </div>
                            </div>
                        ) : previewHTML ? (
                            <div className="max-w-[210mm] mx-auto shadow-2xl">
                                <iframe
                                    srcDoc={previewHTML}
                                    className="w-full bg-white border-0"
                                    style={{ 
                                        height: '297mm',
                                        minHeight: '800px',
                                        border: 'none'
                                    }}
                                    sandbox="allow-same-origin allow-scripts"
                                    title="Preview do PDF"
                                />
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-8 min-h-[600px] relative overflow-hidden"
                                    style={{
                                        aspectRatio: '210/297', // A4
                                        border: `2px solid ${customization.design.colors.primary}`
                                    }}
                                >
                                {/* Marca d'Água Preview */}
                                {customization.watermark.type !== 'none' && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        style={{
                                            opacity: customization.watermark.opacity,
                                            transform: `rotate(${customization.watermark.rotation}deg)`
                                        }}
                                    >
                                        {customization.watermark.type === 'text' && (
                                            <div
                                                className="text-6xl font-bold"
                                                style={{
                                                    color: customization.watermark.color,
                                                    fontSize: customization.watermark.size === 'small' ? '3rem' : customization.watermark.size === 'large' ? '6rem' : '4.5rem'
                                                }}
                                            >
                                                {customization.watermark.content || 'MARCA D\'ÁGUA'}
                                            </div>
                                        )}
                                        {customization.watermark.type === 'logo' && customization.watermark.content && (
                                            <img
                                                src={customization.watermark.content}
                                                alt="Watermark"
                                                className="max-w-md"
                                                style={{
                                                    maxHeight: customization.watermark.size === 'small' ? '150px' : customization.watermark.size === 'large' ? '400px' : '250px'
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Designs nos Cantos */}
                                {customization.design.corners.enabled && customization.design.corners.design !== 'none' && customization.design.corners.design !== 'custom' && CORNER_DESIGNS[customization.design.corners.design] && (
                                    <>
                                        {/* Canto Superior Esquerdo */}
                                        <div
                                            className="absolute top-0 left-0"
                                            style={{ opacity: customization.design.corners.opacity, color: customization.design.colors.primary }}
                                            dangerouslySetInnerHTML={{ __html: CORNER_DESIGNS[customization.design.corners.design].svg }}
                                        />
                                        {/* Canto Superior Direito */}
                                        <div
                                            className="absolute top-0 right-0 transform scale-x-[-1]"
                                            style={{ opacity: customization.design.corners.opacity, color: customization.design.colors.primary }}
                                            dangerouslySetInnerHTML={{ __html: CORNER_DESIGNS[customization.design.corners.design].svg }}
                                        />
                                        {/* Canto Inferior Esquerdo */}
                                        <div
                                            className="absolute bottom-0 left-0 transform scale-y-[-1]"
                                            style={{ opacity: customization.design.corners.opacity, color: customization.design.colors.primary }}
                                            dangerouslySetInnerHTML={{ __html: CORNER_DESIGNS[customization.design.corners.design].svg }}
                                        />
                                        {/* Canto Inferior Direito */}
                                        <div
                                            className="absolute bottom-0 right-0 transform scale-[-1]"
                                            style={{ opacity: customization.design.corners.opacity, color: customization.design.colors.primary }}
                                            dangerouslySetInnerHTML={{ __html: CORNER_DESIGNS[customization.design.corners.design].svg }}
                                        />
                                    </>
                                )}

                                {/* Folha Timbrada Custom (quando design === 'custom') */}
                                {customization.design.corners.enabled && customization.design.corners.design === 'custom' && customization.design.corners.image && (
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            opacity: customization.design.corners.opacity,
                                            backgroundImage: `url(${customization.design.corners.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                )}

                                {/* Conteúdo de Exemplo */}
                                <div className="relative z-10">
                                    {/* Header */}
                                    {customization.content.showCompanyHeader && (
                                        <div className="mb-6 pb-4 border-b-2" style={{ borderColor: customization.design.colors.primary }}>
                                            <h1 className="text-2xl font-bold" style={{ color: customization.design.colors.primary }}>
                                                S3E Engenharia
                                            </h1>
                                            <p className="text-sm" style={{ color: customization.design.colors.secondary }}>
                                                Soluções em Engenharia Elétrica
                                            </p>
                                        </div>
                                    )}

                                    {/* Título do Orçamento */}
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold" style={{ color: customization.design.colors.primary }}>
                                            {orcamentoData.projeto.titulo || 'Título do Orçamento'}
                                        </h2>
                                        <p className="text-sm" style={{ color: customization.design.colors.text }}>
                                            Nº: {orcamentoData.numero} | Validade: {orcamentoData.validade}
                                        </p>
                                    </div>

                                    {/* Cliente */}
                                    <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded">
                                        <p className="text-sm font-semibold" style={{ color: customization.design.colors.secondary }}>Cliente:</p>
                                        <p className="text-sm" style={{ color: customization.design.colors.text }}>{orcamentoData.cliente.nome}</p>
                                    </div>

                                    {/* Itens de Exemplo */}
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold mb-2" style={{ color: customization.design.colors.secondary }}>
                                            Itens do Orçamento
                                        </h3>
                                        <div className="space-y-2">
                                            {orcamentoData.items.slice(0, 3).map((item, i) => (
                                                <div key={i} className="text-xs p-2 bg-gray-50 dark:bg-slate-800 rounded">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{customization.content.showItemCodes && item.codigo ? `${item.codigo} - ` : ''}{item.nome}</span>
                                                        <span className="font-bold" style={{ color: customization.design.colors.accent }}>
                                                            R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${customization.design.colors.accent}20` }}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">VALOR TOTAL</span>
                                            <span className="text-2xl font-bold" style={{ color: customization.design.colors.accent }}>
                                                R$ {orcamentoData.financeiro.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    {customization.content.showCompanyFooter && (
                                        <div className="mt-6 pt-4 border-t text-xs text-center" style={{ borderColor: customization.design.colors.secondary, color: customization.design.colors.text }}>
                                            <p>S3E Engenharia | contato@s3e.com.br | (48) 0000-0000</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-dark-border flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        {hasUnsavedChanges && <span className="text-orange-600 dark:text-orange-400">⚠️ Alterações não salvas</span>}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleGeneratePDF}
                            disabled={generating}
                            className="btn-primary disabled:opacity-50 flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Gerando PDF...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Gerar PDF Personalizado
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Salvar Template */}
            {showSaveTemplate && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
                    <div className="modal-content max-w-md w-full">
                        <div className="modal-header">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">Salvar Template</h3>
                        </div>
                        <div className="modal-body">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Nome do Template</label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="input-field"
                                placeholder="Ex: Orçamento Padrão S3E"
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSaveTemplate(false);
                                    setTemplateName('');
                                }}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveTemplate}
                                className="btn-primary"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDFCustomizationModal;

