import React, { useState, useMemo } from 'react';
import { PriceComparisonItem, PriceComparisonStatus, PriceComparisonImport } from '../types';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { axiosApiService } from '../services/axiosApi';
import { comparacaoPrecosService, type ProcessedCSVResult, type ProcessedItem } from '../services/comparacaoPrecosService';

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

interface ComparacaoPrecosProps {
    toggleSidebar: () => void;
    onNavigate?: (view: string) => void;
}

const ComparacaoPrecos: React.FC<ComparacaoPrecosProps> = ({ toggleSidebar, onNavigate }) => {
    const [imports, setImports] = useState<PriceComparisonImport[]>([]);
    const [selectedImport, setSelectedImport] = useState<PriceComparisonImport | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<PriceComparisonStatus | 'all'>('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [supplierName, setSupplierName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useContext(AuthContext)!;

    // Função para processar CSV
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
        } else {
            alert('Por favor, selecione um arquivo CSV válido');
        }
    };

    // Processar CSV e criar comparação
    const processCSV = async () => {
        if (!selectedFile || !supplierName.trim()) {
            alert('Preencha todos os campos');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await comparacaoPrecosService.uploadCSV(selectedFile, supplierName);
            
            if (response.success && response.data) {
                const data = response.data;
                
                // Converter ProcessedItem[] para PriceComparisonItem[]
                const items: PriceComparisonItem[] = data.items.map((item: ProcessedItem, index: number) => ({
                    id: `${index + 1}`,
                    materialCode: item.codigo,
                    materialName: item.nome,
                    unit: item.unidade,
                    quantity: item.quantidade,
                    currentPrice: item.preco_atual || 0,
                    newPrice: item.preco_unitario,
                    difference: item.diferenca_percentual || 0,
                    differenceValue: item.preco_atual 
                        ? (item.preco_unitario - item.preco_atual) * item.quantidade 
                        : 0,
                    status: item.status as PriceComparisonStatus,
                    supplierName: supplierName,
                    lastPurchaseDate: '',
                    stockQuantity: 0
                }));
                
                const totalValue = items.reduce((sum, item) => sum + (item.newPrice * item.quantity), 0);
                
                const newImport: PriceComparisonImport = {
                    id: `IMP-${Date.now()}`,
                    fileName: selectedFile.name,
                    uploadDate: new Date().toISOString(),
                    supplierName: supplierName,
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

                alert('✅ CSV processado com sucesso!');
            } else {
                setError(response.error || 'Erro ao processar CSV');
                alert(`❌ ${response.error || 'Erro ao processar CSV'}`);
            }
        } catch (error) {
            console.error('Erro ao processar CSV:', error);
            setError('Erro ao processar arquivo CSV');
            alert('❌ Erro ao processar arquivo CSV. Verifique o console para mais detalhes.');
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

    const handleAtualizarPrecos = async () => {
        if (!selectedImport || !selectedImport.items) return;
        
        if (!window.confirm('Deseja atualizar os preços dos materiais com base nesta comparação? Apenas itens com preços menores serão atualizados.')) {
            return;
        }

        try {
            setIsProcessing(true);
            
            // Converter items para ProcessedItem[]
            const processedItems: ProcessedItem[] = selectedImport.items.map(item => ({
                codigo: item.materialCode,
                nome: item.materialName,
                unidade: item.unit,
                quantidade: item.quantity,
                preco_unitario: item.newPrice,
                preco_atual: item.currentPrice,
                diferenca_percentual: item.difference,
                status: item.status as 'Lower' | 'Higher' | 'Equal' | 'NoHistory'
            }));
            
            const response = await comparacaoPrecosService.atualizarPrecos(processedItems);
            
            if (response.success) {
                alert(`✅ Preços atualizados com sucesso! ${response.data?.updated || 0} itens foram atualizados.`);
                setSelectedImport(null);
            } else {
                alert(`❌ ${response.error || 'Erro ao atualizar preços'}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar preços:', error);
            alert('❌ Erro ao atualizar preços. Verifique o console para mais detalhes.');
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
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Comparação de Preços</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Compare preços de fornecedores e analise oportunidades</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-medium font-semibold"
                >
                    <DocumentArrowUpIcon className="w-5 h-5" />
                    Importar CSV
                </button>
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
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                    Nome do Fornecedor *
                                </label>
                                <input
                                    type="text"
                                    value={supplierName}
                                    onChange={(e) => setSupplierName(e.target.value)}
                                    className="input-field"
                                    placeholder="Nome da empresa fornecedora"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                    Arquivo CSV *
                                </label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="input-field"
                                />
                                <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
                                    Formato esperado: código, nome, unidade, quantidade, preço_unitário
                                </p>
                            </div>

                            {selectedFile && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl">
                                    <p className="text-indigo-800 dark:text-indigo-300 font-medium">
                                        📁 Arquivo selecionado: {selectedFile.name}
                                    </p>
                                    <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1">
                                        Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📋 Instruções</h4>
                                <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                                    <li>• O arquivo deve estar em formato CSV</li>
                                    <li>• Deve conter as colunas: código, nome, unidade, quantidade, preço_unitário</li>
                                    <li>• Os preços serão comparados com o histórico de compras</li>
                                    <li>• Itens sem histórico serão marcados como "Sem Histórico"</li>
                                </ul>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-dark-border">
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={processCSV}
                                    disabled={!selectedFile || !supplierName.trim() || isProcessing}
                                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Processando...' : 'Processar CSV'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default ComparacaoPrecos;