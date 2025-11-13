import React, { useState, useMemo } from 'react';
import { PriceComparisonItem, PriceComparisonStatus, PriceComparisonImport } from '../types';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { axiosApiService } from '../services/axiosApi';
import PrecoValidadeFlag from './PrecoValidadeFlag';
import HistoricoPrecosModal from './HistoricoPrecosModal';
import PreviewAtualizacaoModal from './PreviewAtualizacaoModal';

// ==================== ICONS ====================
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const DocumentArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const ArrowTrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.511l-5.511-3.182" />
    </svg>
);
const ArrowTrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
);

interface AtualizacaoPrecosProps {
    toggleSidebar: () => void;
    onNavigate?: (view: string) => void;
}

const AtualizacaoPrecos: React.FC<AtualizacaoPrecosProps> = ({ toggleSidebar, onNavigate }) => {
    const [imports, setImports] = useState<PriceComparisonImport[]>([]);
    const [selectedImport, setSelectedImport] = useState<PriceComparisonImport | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<PriceComparisonStatus | 'all'>('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [supplierName, setSupplierName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [materiaisParaAtualizar, setMateriaisParaAtualizar] = useState<any[]>([]);
    const { token } = useContext(AuthContext)!;

    // Função para processar arquivo (JSON, CSV ou Excel)
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = [
                'application/json',
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            const validExtensions = ['.json', '.csv', '.xlsx', '.xls'];
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            
            if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
                setSelectedFile(file);
            } else {
                alert('Por favor, selecione um arquivo JSON, CSV ou Excel válido (.json, .csv, .xlsx, .xls)');
            }
        }
    };

    // Processar arquivo e criar preview
    const processCSV = async () => {
        if (!selectedFile) {
            alert('Selecione um arquivo');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('arquivo', selectedFile);
            
            // Fazer preview antes de importar
            const response = await axiosApiService.post('/api/materiais/preview-importacao', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.success && response.data) {
                const data = response.data;
                
                // Verificar se não há alterações
                if (data.totalAlteracoes === 0 && data.totalErros === 0) {
                    alert(
                        `ℹ️ Nenhuma Alteração Necessária\n\n` +
                        `Todos os ${data.totalItens || 0} materiais já estão com os preços corretos.\n\n` +
                        `Não há nada para atualizar.`
                    );
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                    setIsProcessing(false);
                    return;
                }
                
                // Se houver erros, mostrar aviso mas continuar
                if (data.totalErros > 0) {
                    console.warn(`⚠️ ${data.totalErros} erros encontrados, mas ${data.totalAlteracoes} itens estão válidos`);
                }
                
                // Converter preview para PriceComparisonItem[]
                const items: PriceComparisonItem[] = data.preview.map((item: any, index: number) => ({
                    id: `${index + 1}`,
                    materialCode: item.sku || '',
                    materialName: item.nome || '',
                    unit: item.unidade || 'UN',
                    quantity: 1,
                    currentPrice: item.precoAtual || 0,
                    newPrice: item.precoNovo || 0,
                    difference: item.diferenca || 0,
                    differenceValue: item.precoAtual && item.precoNovo 
                        ? (item.precoNovo - item.precoAtual) 
                        : 0,
                    status: item.status === 'reducao' ? PriceComparisonStatus.Lower :
                            (item.status === 'aumento' ? PriceComparisonStatus.Higher :
                            (item.status === 'igual' ? PriceComparisonStatus.Equal : 
                            PriceComparisonStatus.NoHistory)),
                    supplierName: item.fornecedor || 'N/A',
                    lastPurchaseDate: '',
                    stockQuantity: item.estoque || 0
                }));
                
                const totalValue = items.reduce((sum, item) => sum + item.newPrice, 0);
                
                const newImport: PriceComparisonImport = {
                    id: `IMP-${Date.now()}`,
                    fileName: selectedFile.name,
                    uploadDate: new Date().toISOString(),
                    supplierName: 'Importação de Template',
                    itemsCount: items.length,
                    totalValue: totalValue,
                    status: 'completed',
                    items: items
                };

                setImports([newImport, ...imports]);
                setSelectedImport(newImport);
                setIsUploadModalOpen(false);
                setSupplierName('');
                setSelectedFile(null);

                // Preparar dados para o modal de preview
                const materiaisPreview = items.map(item => ({
                    materialCode: item.materialCode,
                    materialName: item.materialName,
                    currentPrice: item.currentPrice,
                    newPrice: item.newPrice,
                    difference: ((item.newPrice - item.currentPrice) / item.currentPrice) * 100
                }));
                
                setMateriaisParaAtualizar(materiaisPreview);
                setPreviewModalOpen(true);
            } else {
                setError(response.error || 'Erro ao processar arquivo');
                alert(`❌ ${response.error || 'Erro ao processar arquivo'}`);
            }
        } catch (error: any) {
            console.error('❌ Erro ao processar arquivo:', error);
            
            // Tentar extrair mensagem de erro específica
            let errorMessage = 'Erro ao processar arquivo';
            
            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            alert(
                `❌ Erro ao Processar Arquivo\n\n` +
                `Detalhes: ${errorMessage}\n\n` +
                `Verifique se:\n` +
                `• O arquivo é um JSON válido\n` +
                `• O JSON tem o campo "materiais"\n` +
                `• Os campos "precoNovo" são números\n` +
                `• Você não alterou os campos "id" ou "sku"`
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredImports = useMemo(() => {
        let filtered = [...imports];
        
        if (searchTerm) {
            filtered = filtered.filter(imp =>
                imp.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                imp.fileName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    }, [imports, searchTerm]);

    const getStatusClass = (status: PriceComparisonStatus) => {
        switch (status) {
            case PriceComparisonStatus.Lower:
                return 'bg-green-100 text-green-800 ring-1 ring-green-200';
            case PriceComparisonStatus.Higher:
                return 'bg-red-100 text-red-800 ring-1 ring-red-200';
            case PriceComparisonStatus.Equal:
                return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
            case PriceComparisonStatus.NoHistory:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
        }
    };

    const getStatusIcon = (status: PriceComparisonStatus) => {
        switch (status) {
            case PriceComparisonStatus.Lower:
                return <ArrowTrendingDownIcon className="w-4 h-4" />;
            case PriceComparisonStatus.Higher:
                return <ArrowTrendingUpIcon className="w-4 h-4" />;
            case PriceComparisonStatus.Equal:
                return <span className="w-4 h-4 flex items-center justify-center">➖</span>;
            case PriceComparisonStatus.NoHistory:
                return <span className="w-4 h-4 flex items-center justify-center">❓</span>;
            default:
                return <span className="w-4 h-4 flex items-center justify-center">❓</span>;
        }
    };

    const getStatusText = (status: PriceComparisonStatus) => {
        switch (status) {
            case PriceComparisonStatus.Lower:
                return 'Menor';
            case PriceComparisonStatus.Higher:
                return 'Maior';
            case PriceComparisonStatus.Equal:
                return 'Igual';
            case PriceComparisonStatus.NoHistory:
                return 'Sem Histórico';
            default:
                return 'Desconhecido';
        }
    };

    const handleDownloadTemplate = async (formato: 'json' | 'pdf') => {
        try {
            setIsProcessing(true);
            
            if (formato === 'json') {
                // Buscar dados JSON (NÃO blob)
                const response = await axiosApiService.get('/api/materiais/template-importacao?tipo=todos&formato=json');
                
                console.log('📄 Resposta COMPLETA (tipo):', typeof response);
                console.log('📄 Resposta COMPLETA (keys):', Object.keys(response || {}));
                
                // ✨ CORREÇÃO: axiosApiService SEMPRE retorna { success, data }
                // Os dados reais estão em response.data
                const templateData = response.data;
                
                console.log('✅ Template extraído de response.data:', {
                    tipo: typeof templateData,
                    temVersao: !!templateData?.versao,
                    temMateriais: Array.isArray(templateData?.materiais),
                    totalMateriais: templateData?.materiais?.length || 0
                });
                
                // Verificar se tem dados válidos
                if (!templateData || !templateData.materiais || !Array.isArray(templateData.materiais)) {
                    alert(
                        '❌ Erro: Resposta inválida do servidor\n\n' +
                        'O JSON não contém campo "materiais" ou está vazio.\n\n' +
                        'Detalhes no console (F12)'
                    );
                    console.error('❌ Dados inválidos! Response completo:', response);
                    console.error('❌ TemplateData extraído:', templateData);
                    return;
                }
                
                console.log('✅ Dados extraídos com sucesso:', {
                    versao: templateData.versao,
                    empresa: templateData.empresa,
                    totalMateriais: templateData.materiais.length,
                    primeiroMaterial: templateData.materiais[0]?.sku || 'N/A'
                });
                
                // GARANTIR que não tem wrappers (success, data, etc)
                // Criar objeto limpo com apenas os campos necessários
                const dadosLimpos = {
                    versao: templateData.versao || '1.0',
                    geradoEm: templateData.geradoEm || new Date().toISOString(),
                    empresa: templateData.empresa || 'S3E Engenharia Elétrica',
                    instrucoes: templateData.instrucoes || 'Atualize apenas o campo precoNovo',
                    materiais: templateData.materiais
                };
                
                console.log('🧹 Dados limpos (sem wrappers):', {
                    temVersao: !!dadosLimpos.versao,
                    temMateriais: !!dadosLimpos.materiais,
                    totalMateriais: dadosLimpos.materiais?.length || 0
                });
                
                // Converter para string JSON formatado (com identação bonita)
                const jsonString = JSON.stringify(dadosLimpos, null, 2);
                
                console.log('📝 JSON string gerado (tamanho):', jsonString.length, 'caracteres');
                console.log('📝 JSON string (primeiros 200 chars):', jsonString.substring(0, 200));
                
                // Criar blob com string JSON
                const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `template-precos-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                alert(
                    `✅ Template JSON baixado com sucesso!\n\n` +
                    `📊 ${templateData.materiais.length} materiais incluídos\n\n` +
                    `📝 Edite o campo "precoNovo" de cada material e importe o arquivo de volta.`
                );
            } else {
                // Abrir PDF em HTML (como relatório financeiro)
                const response = await axiosApiService.get('/api/materiais/template-importacao?tipo=todos&formato=pdf');
                
                // Extrair dados (pode estar em response.data ou direto em response)
                let dados = response;
                if (response && typeof response === 'object' && 'data' in response) {
                    dados = response.data;
                }
                
                if (!dados || !dados.materiais) {
                    alert('❌ Erro ao carregar dados do template');
                    console.error('Dados inválidos:', dados);
                    return;
                }
                
                await abrirPDFEmNovaAba(dados.materiais);
            }
        } catch (error) {
            console.error('Erro ao baixar template:', error);
            alert('❌ Erro ao baixar template');
        } finally {
            setIsProcessing(false);
        }
    };

    // Função para abrir PDF em HTML (como relatório financeiro)
    const abrirPDFEmNovaAba = async (materiais: any[]) => {
        const pdfWindow = window.open('', '_blank');
        
        if (!pdfWindow) {
            alert('❌ Bloqueador de pop-ups ativado. Permita pop-ups para gerar o PDF.');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Template de Orçamento - S3E Engenharia</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        padding: 40px;
                        background: #fff;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #10B981;
                    }
                    .header h1 {
                        color: #1E40AF;
                        font-size: 32px;
                        margin-bottom: 10px;
                    }
                    .header p {
                        color: #666;
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    .instrucoes {
                        background: #FFF3E0;
                        border: 2px solid #F57C00;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                    }
                    .instrucoes h3 {
                        color: #F57C00;
                        margin-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    table th, table td {
                        padding: 12px;
                        text-align: left;
                        border: 1px solid #E5E7EB;
                    }
                    table th {
                        background: #10B981;
                        color: white;
                        font-weight: 600;
                    }
                    table tr:nth-child(even) {
                        background: #F9FAFB;
                    }
                    table tr.critico {
                        background: #FFF3E0;
                    }
                    table tr.zerado {
                        background: #FFEBEE;
                    }
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #E5E7EB;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                    .preco {
                        text-align: right;
                        font-weight: 600;
                    }
                    .linha-preco {
                        min-width: 150px;
                        border-bottom: 1px solid #999;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>S3E ENGENHARIA ELÉTRICA</h1>
                    <p><strong>SOLICITAÇÃO DE ORÇAMENTO</strong></p>
                    <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                </div>

                <div class="instrucoes">
                    <h3>⚠️ INSTRUÇÕES IMPORTANTES:</h3>
                    <ul>
                        <li>Preencha a coluna "NOVO PREÇO" com os valores atualizados</li>
                        <li>Use este documento como referência ou imprima e preencha manualmente</li>
                        <li>Para atualização no sistema, edite o arquivo JSON correspondente</li>
                        <li>Orçamento válido por 30 dias</li>
                    </ul>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 100px;">SKU</th>
                            <th>Material</th>
                            <th style="width: 60px;">Un</th>
                            <th style="width: 80px;">Estoque</th>
                            <th style="width: 120px;">Preço Atual</th>
                            <th style="width: 150px;">NOVO PREÇO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${materiais.map(m => `
                            <tr class="${m.estoque === 0 ? 'zerado' : (m.estoque <= m.estoqueMinimo ? 'critico' : '')}">
                                <td><strong>${m.sku}</strong></td>
                                <td>${m.nome}</td>
                                <td>${m.unidadeMedida}</td>
                                <td style="text-align: center;">${m.estoque}</td>
                                <td class="preco">R$ ${(m.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td class="linha-preco">_______________________</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p><strong>S3E Engenharia Elétrica</strong> - Sistema de Gestão</p>
                    <p>Total de ${materiais.length} materiais | Orçamento válido por 30 dias</p>
                    <p class="no-print" style="margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 12px 24px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; margin-right: 10px;">
                            🖨️ Imprimir / Salvar como PDF
                        </button>
                        <button onclick="window.close()" style="padding: 12px 24px; background: #6B7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            ✖️ Fechar
                        </button>
                    </p>
                </div>
            </body>
            </html>
        `;
        
        pdfWindow.document.write(html);
        pdfWindow.document.close();
        
        alert('✅ Template aberto em nova aba!\n\n📄 Você pode imprimir ou salvar como PDF.');
    };

    const handleAtualizarPrecos = async () => {
        if (!materiaisParaAtualizar || materiaisParaAtualizar.length === 0) {
            alert('❌ Nenhum material para atualizar');
            return;
        }

        try {
            setIsProcessing(true);
            
            console.log('📤 Enviando materiais para atualização:', materiaisParaAtualizar);
            
            // Criar estrutura JSON no formato que o backend espera
            const templateData = {
                versao: '1.0',
                geradoEm: new Date().toISOString(),
                empresa: 'S3E Engenharia Elétrica',
                materiais: materiaisParaAtualizar.map(m => ({
                    sku: m.materialCode,
                    nome: m.materialName,
                    precoAtual: m.currentPrice,
                    precoNovo: m.newPrice
                }))
            };
            
            console.log('📦 Template JSON criado:', templateData);
            
            // Converter para JSON string
            const jsonString = JSON.stringify(templateData);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const file = new File([blob], 'importacao-atualizacao.json', { type: 'application/json' });
            
            console.log('📄 Arquivo criado:', file.name, 'Tamanho:', file.size);
            
            // Criar FormData
            const formData = new FormData();
            formData.append('arquivo', file);
            
            console.log('📡 Enviando para /api/materiais/importar-precos...');
            
            const response = await axiosApiService.post('/api/materiais/importar-precos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            console.log('✅ Resposta recebida:', response);
            
            if (response.success && response.data) {
                setPreviewModalOpen(false);
                setSelectedImport(null);
                setMateriaisParaAtualizar([]);
                
                alert(`✅ Preços atualizados com sucesso! ${response.data.atualizados || materiaisParaAtualizar.length} itens foram atualizados.`);
            } else {
                alert(`❌ ${response.error || 'Erro ao atualizar preços'}`);
            }
        } catch (error: any) {
            console.error('❌ Erro ao atualizar preços:', error);
            
            let errorMessage = 'Erro ao atualizar preços';
            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            alert(`❌ ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 rounded-xl hover:bg-white hover:shadow-soft">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Atualização de Preços</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Atualize preços em massa com arquivos JSON</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleDownloadTemplate('json')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        📄 JSON
                    </button>
                    <button
                        onClick={() => handleDownloadTemplate('pdf')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-medium font-semibold disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        📑 PDF
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-medium font-semibold disabled:opacity-50"
                    >
                        <DocumentArrowUpIcon className="w-5 h-5" />
                        Importar JSON
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
                    <p className="text-red-800 font-medium">⚠️ {error}</p>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por fornecedor ou arquivo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex items-center justify-end">
                        <p className="text-sm text-gray-600">
                            <span className="font-bold text-gray-900">{filteredImports.length}</span> comparações encontradas
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de Importações */}
            {filteredImports.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📊</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma comparação encontrada</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece importando um arquivo CSV para comparar preços'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-medium font-semibold"
                        >
                            <DocumentArrowUpIcon className="w-5 h-5 inline mr-2" />
                            Importar Primeira Comparação
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredImports.map((importItem) => (
                        <div key={importItem.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-indigo-300 transition-all duration-200">
                            {/* Header do Card */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-gray-900 mb-1">{importItem.supplierName}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200">
                                            📊 Comparação
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            📁 {importItem.fileName}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-indigo-700">
                                            R$ {importItem.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-sm text-gray-600">{importItem.itemsCount} itens</p>
                                    </div>
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📅</span>
                                    <span>Importado em: {new Date(importItem.uploadDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📦</span>
                                    <span>{importItem.itemsCount} itens analisados</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>✅</span>
                                    <span>Status: Processado</span>
                                </div>
                            </div>

                            {/* Resumo de Análise */}
                            {importItem.items && importItem.items.length > 0 && (
                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Resumo da Análise</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                                <ArrowTrendingDownIcon className="w-4 h-4" />
                                                <span className="font-bold">
                                                    {importItem.items.filter(item => item.status === PriceComparisonStatus.Lower).length}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">Preços Menores</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                                                <ArrowTrendingUpIcon className="w-4 h-4" />
                                                <span className="font-bold">
                                                    {importItem.items.filter(item => item.status === PriceComparisonStatus.Higher).length}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">Preços Maiores</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                                <span>➖</span>
                                                <span className="font-bold">
                                                    {importItem.items.filter(item => item.status === PriceComparisonStatus.Equal).length}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">Preços Iguais</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                                <span>❓</span>
                                                <span className="font-bold">
                                                    {importItem.items.filter(item => item.status === PriceComparisonStatus.NoHistory).length}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">Sem Histórico</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botões de Ação */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setSelectedImport(importItem)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-medium font-semibold"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE UPLOAD CSV */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-strong max-w-2xl w-full animate-slide-in-up">
                        {/* Header */}
                        <div className="relative p-6 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-medium ring-2 ring-indigo-100">
                                    <DocumentArrowUpIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Importar Comparação de Preços</h2>
                                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Faça upload de um arquivo CSV para comparar preços</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-700 p-5 rounded-xl">
                                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2 text-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    💡 Como usar esta funcionalidade
                                </h4>
                                <ol className="text-blue-800 dark:text-blue-300 text-sm space-y-2.5 ml-4 list-decimal">
                                    <li>
                                        <strong>Download do Template:</strong>
                                        <ul className="ml-4 mt-1 space-y-1 list-disc">
                                            <li><strong>📄 JSON</strong>: Para edição técnica (recomendado para importação)</li>
                                            <li><strong>📑 PDF</strong>: Para enviar ao fornecedor (visualização/impressão)</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <strong>Edição do JSON:</strong> Abra o arquivo .json em qualquer editor de texto e altere apenas o campo <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">"precoNovo"</code>
                                    </li>
                                    <li><strong>Salvar:</strong> Salve o arquivo JSON modificado</li>
                                    <li><strong>Importar:</strong> Clique em "Importar JSON" e selecione o arquivo</li>
                                    <li><strong>Revisar:</strong> O sistema mostrará preview de todas as alterações</li>
                                    <li><strong>Confirmar:</strong> Após revisar, confirme para aplicar as alterações</li>
                                </ol>
                                
                                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                                    <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Importante: Não altere os campos ID e SKU do JSON!
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                    Arquivo de Atualização *
                                </label>
                                <input
                                    type="file"
                                    accept=".json,.csv,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="input-field"
                                />
                                <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
                                    Formatos aceitos: .json (recomendado), .xlsx, .xls, .csv
                                </p>
                            </div>

                            {selectedFile && (
                                <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 p-4 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-green-800 dark:text-green-300 font-medium">
                                                Arquivo selecionado:
                                            </p>
                                            <p className="text-green-700 dark:text-green-400 font-bold text-lg mt-1">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                                                Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-dark-border">
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={processCSV}
                                    disabled={!selectedFile || isProcessing}
                                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Processando...' : '📊 Processar e Visualizar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE HISTÓRICO DE PREÇOS */}
            <HistoricoPrecosModal 
                materialId={selectedMaterialId || ''}
                isOpen={historicoModalOpen}
                onClose={() => {
                    setHistoricoModalOpen(false);
                    setSelectedMaterialId(null);
                }}
            />

            {/* MODAL DE DETALHES */}
            {selectedImport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-strong max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Detalhes da Comparação</h2>
                                <p className="text-sm text-gray-600 mt-1">{selectedImport.supplierName} - {selectedImport.fileName}</p>
                            </div>
                            <button onClick={() => setSelectedImport(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-indigo-600">{selectedImport.itemsCount}</p>
                                        <p className="text-sm text-gray-600">Total de Itens</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            R$ {selectedImport.totalValue.toLocaleString('pt-BR')}
                                        </p>
                                        <p className="text-sm text-gray-600">Valor Total</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {selectedImport.items ? selectedImport.items.filter(i => i.status === PriceComparisonStatus.Lower).length : 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Preços Menores</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">
                                            {selectedImport.items ? selectedImport.items.filter(i => i.status === PriceComparisonStatus.Higher).length : 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Preços Maiores</p>
                                    </div>
                                </div>
                            </div>

                            {selectedImport.items && selectedImport.items.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Itens Analisados</h3>
                                    {selectedImport.items.map((item) => (
                                        <div key={item.id} className="bg-white border border-gray-200 p-4 rounded-xl">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{item.materialName}</h4>
                                                    <p className="text-sm text-gray-600">{item.materialCode} • {item.quantity} {item.unit}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {item.currentPrice && (
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">Preço Atual</p>
                                                            <p className="font-bold text-gray-900">
                                                                R$ {item.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Novo Preço</p>
                                                        <p className="font-bold text-indigo-700">
                                                            R$ {(item.newPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 ${getStatusClass(item.status)}`}>
                                                        {getStatusIcon(item.status)}
                                                        {getStatusText(item.status)}
                                                    </span>
                                                </div>
                                            </div>
                                            {item.difference !== 0 && (
                                                <div className="mt-2 flex items-center gap-2 text-sm">
                                                    <span className="text-gray-600">Diferença:</span>
                                                    <span className={`font-bold ${item.difference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}%
                                                    </span>
                                                    {item.differenceValue && (
                                                        <span className={`font-bold ${item.differenceValue < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            (R$ {Math.abs(item.differenceValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Nenhum item para exibir</p>
                                </div>
                            )}
                            
                            {/* Botão Atualizar Preços */}
                            {selectedImport.items && selectedImport.items.length > 0 && (
                                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setSelectedImport(null)}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                    >
                                        Fechar
                                    </button>
                                    <button
                                        onClick={handleAtualizarPrecos}
                                        disabled={isProcessing}
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? 'Processando...' : '💰 Atualizar Preços Menores'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Preview de Atualização */}
            <PreviewAtualizacaoModal
                isOpen={previewModalOpen}
                onClose={() => {
                    setPreviewModalOpen(false);
                    setMateriaisParaAtualizar([]);
                }}
                materiais={materiaisParaAtualizar}
                onConfirmar={handleAtualizarPrecos}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default AtualizacaoPrecos;