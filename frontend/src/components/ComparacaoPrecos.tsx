import React, { useState, useMemo } from 'react';
import { PriceComparisonItem, PriceComparisonStatus, PriceComparisonImport } from '../types';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { axiosApiService } from '../services/axiosApi';

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

    // Função para processar CSV (mock - será substituído por API)
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
            // Preparar FormData para upload
            const formData = new FormData();
            formData.append('csvFile', selectedFile);

            // Fazer upload e processar CSV
            const response = await axiosApiService.post('/api/comparacao-precos/upload-csv', formData);

            if (!response.success) {
                throw new Error(response.error || 'Erro ao processar CSV');
            }

            // Converter dados do backend para o formato do frontend
            const mockItems: PriceComparisonItem[] = response.data.items.map((item: any, index: number) => ({
                id: index.toString(),
                materialCode: item.codigo,
                materialName: item.nome,
                unit: item.unidade,
                quantity: item.quantidade,
                currentPrice: item.preco_atual || null,
                newPrice: item.preco_unitario,
                difference: item.diferenca_percentual || 0,
                differenceValue: item.preco_atual ? 
                    (item.preco_unitario - item.preco_atual) * item.quantidade : null,
                status: item.status === 'Lower' ? PriceComparisonStatus.Lower :
                       item.status === 'Higher' ? PriceComparisonStatus.Higher :
                       item.status === 'Equal' ? PriceComparisonStatus.Equal :
                       PriceComparisonStatus.NoHistory,
                supplierName: supplierName,
                lastPurchaseDate: '2024-10-01', // TODO: buscar data real do histórico
                stockQuantity: 0 // TODO: buscar estoque real
            }));

            const totalValue = mockItems.reduce((sum, item) => {
                return sum + ((item.newPrice || 0) * item.quantity);
            }, 0);

            const newImport: PriceComparisonImport = {
                id: `IMP-${Date.now()}`,
                fileName: selectedFile.name,
                uploadDate: new Date().toISOString(),
                supplierName: supplierName,
                itemsCount: result.data.summary.total_items,
                totalValue: totalValue,
                items: mockItems,
                status: 'pending'
            };

            setImports([newImport, ...imports]);
            setSelectedImport(newImport);
            setIsUploadModalOpen(false);
            setSupplierName('');
            setSelectedFile(null);

        } catch (error) {
            console.error('Erro ao processar CSV:', error);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setIsProcessing(false);
        }
    };

    // Filtrar itens
    const filteredItems = useMemo(() => {
        if (!selectedImport) return [];

        let items = selectedImport.items;

        // Filtrar por busca
        if (searchTerm) {
            items = items.filter(item =>
                item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.materialCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por status
        if (filterStatus !== 'all') {
            items = items.filter(item => item.status === filterStatus);
        }

        return items;
    }, [selectedImport, searchTerm, filterStatus]);

    // Calcular estatísticas
    const stats = useMemo(() => {
        if (!selectedImport) return {
            totalItems: 0,
            totalValue: 0,
            totalSavings: 0,
            totalIncrease: 0,
            itemsWithLowerPrice: 0,
            itemsWithHigherPrice: 0
        };

        const totalSavings = selectedImport.items
            .filter(item => item.status === PriceComparisonStatus.Lower)
            .reduce((sum, item) => sum + (Math.abs(item.differenceValue || 0) * item.quantity), 0);

        const totalIncrease = selectedImport.items
            .filter(item => item.status === PriceComparisonStatus.Higher)
            .reduce((sum, item) => sum + ((item.differenceValue || 0) * item.quantity), 0);

        return {
            totalItems: selectedImport.itemsCount,
            totalValue: selectedImport.totalValue,
            totalSavings,
            totalIncrease,
            itemsWithLowerPrice: selectedImport.items.filter(i => i.status === PriceComparisonStatus.Lower).length,
            itemsWithHigherPrice: selectedImport.items.filter(i => i.status === PriceComparisonStatus.Higher).length
        };
    }, [selectedImport]);

    // Criar orçamento com novos preços
    const handleCreateBudget = () => {
        if (!selectedImport) return;
        
        // Aqui você redirecionaria para a página de orçamentos com os dados pré-preenchidos
        if (onNavigate) {
            // Pode salvar os dados no localStorage ou state management
            localStorage.setItem('budgetDraft', JSON.stringify({
                supplier: selectedImport.supplierName,
                items: selectedImport.items,
                source: 'price-comparison'
            }));
            onNavigate('Orçamentos');
        }
    };

    // Renderizar status badge
    const renderStatusBadge = (status: PriceComparisonStatus) => {
        switch (status) {
            case PriceComparisonStatus.Lower:
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ⬇️ Menor
                    </span>
                );
            case PriceComparisonStatus.Higher:
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        ⬆️ Maior
                    </span>
                );
            case PriceComparisonStatus.Equal:
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        = Igual
                    </span>
                );
            case PriceComparisonStatus.NoHistory:
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        ⚠️ Novo
                    </span>
                );
        }
    };

    return (
        <div className="h-full flex flex-col bg-brand-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-brand-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={toggleSidebar} className="lg:hidden text-brand-gray-600 hover:text-brand-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-brand-gray-800 flex items-center gap-2">
                            <span className="text-3xl">📊</span>
                            Comparação de Preços
                        </h2>
                        <p className="text-sm text-brand-gray-600 mt-1">
                            Compare preços de fornecedores com seu histórico de compras
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-2.5 bg-brand-s3e text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                    <span className="text-xl">📤</span>
                    Importar CSV
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                {!selectedImport ? (
                    // Estado inicial - sem importação
                    <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-sm p-12">
                        <div className="text-8xl mb-6">📋</div>
                        <h3 className="text-2xl font-bold text-brand-gray-800 mb-3">
                            Nenhuma Importação Ativa
                        </h3>
                        <p className="text-brand-gray-600 text-center max-w-md mb-8">
                            Importe um arquivo CSV com os preços do fornecedor para começar a comparação com seu histórico de compras.
                        </p>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-8 py-3 bg-brand-s3e text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                        >
                            <span className="text-2xl">📤</span>
                            Importar Primeiro CSV
                        </button>

                        {/* Histórico de importações */}
                        {imports.length > 0 && (
                            <div className="mt-12 w-full max-w-2xl">
                                <h4 className="text-lg font-semibold text-brand-gray-800 mb-4">Importações Anteriores</h4>
                                <div className="space-y-3">
                                    {imports.map(imp => (
                                        <div
                                            key={imp.id}
                                            onClick={() => setSelectedImport(imp)}
                                            className="p-4 bg-brand-gray-50 rounded-lg border border-brand-gray-200 hover:border-brand-s3e cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-brand-gray-800">{imp.supplierName}</p>
                                                    <p className="text-sm text-brand-gray-600">{imp.fileName} • {imp.itemsCount} itens</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-brand-gray-800">
                                                        {imp.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </p>
                                                    <p className="text-xs text-brand-gray-500">
                                                        {new Date(imp.uploadDate).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Visualização da comparação
                    <div className="space-y-6">
                        {/* Cards de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-gray-200">
                                <p className="text-sm font-medium text-brand-gray-600 mb-2">Total de Itens</p>
                                <p className="text-3xl font-bold text-brand-gray-800">{stats.totalItems}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-gray-200">
                                <p className="text-sm font-medium text-brand-gray-600 mb-2">Valor Total</p>
                                <p className="text-3xl font-bold text-brand-gray-800">
                                    {stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200">
                                <p className="text-sm font-medium text-green-700 mb-2">💰 Economia Total</p>
                                <p className="text-3xl font-bold text-green-700">
                                    {stats.totalSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <p className="text-xs text-green-600 mt-1">{stats.itemsWithLowerPrice} itens com preço menor</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
                                <p className="text-sm font-medium text-red-700 mb-2">📈 Aumento Total</p>
                                <p className="text-3xl font-bold text-red-700">
                                    {stats.totalIncrease.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <p className="text-xs text-red-600 mt-1">{stats.itemsWithHigherPrice} itens com preço maior</p>
                            </div>
                        </div>

                        {/* Filtros e Busca */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-gray-200">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar por nome ou código do material..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-s3e focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="px-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-s3e focus:border-transparent"
                                >
                                    <option value="all">Todos os Status</option>
                                    <option value={PriceComparisonStatus.Lower}>Preço Menor</option>
                                    <option value={PriceComparisonStatus.Higher}>Preço Maior</option>
                                    <option value={PriceComparisonStatus.Equal}>Preço Igual</option>
                                    <option value={PriceComparisonStatus.NoHistory}>Sem Histórico</option>
                                </select>
                                <button
                                    onClick={() => setSelectedImport(null)}
                                    className="px-4 py-2 bg-brand-gray-200 text-brand-gray-700 rounded-lg font-semibold hover:bg-brand-gray-300 transition-colors"
                                >
                                    ← Voltar
                                </button>
                            </div>
                        </div>

                        {/* Tabela de Comparação */}
                        <div className="bg-white rounded-lg shadow-sm border border-brand-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-brand-gray-200">
                                    <thead className="bg-brand-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Material
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Qtd
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Estoque
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Preço Atual
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Novo Preço
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Diferença
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-brand-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-brand-gray-200">
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-brand-gray-500">
                                                    Nenhum item encontrado com os filtros aplicados
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-brand-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-brand-gray-800">{item.materialName}</p>
                                                            <p className="text-xs text-brand-gray-500">{item.materialCode} • {item.unit}</p>
                                                            {item.lastPurchaseDate && (
                                                                <p className="text-xs text-brand-gray-400 mt-1">
                                                                    Última compra: {new Date(item.lastPurchaseDate).toLocaleDateString('pt-BR')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm font-medium text-brand-gray-800">{item.quantity}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-sm font-medium ${
                                                            (item.stockQuantity || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {item.stockQuantity || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="text-sm font-medium text-brand-gray-800">
                                                            {item.currentPrice
                                                                ? item.currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                                : '-'
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="text-sm font-semibold text-brand-gray-800">
                                                            {item.newPrice
                                                                ? item.newPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                                : '-'
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.difference !== null ? (
                                                            <div>
                                                                <p className={`text-sm font-bold ${
                                                                    item.difference > 0 ? 'text-red-600' : item.difference < 0 ? 'text-green-600' : 'text-blue-600'
                                                                }`}>
                                                                    {item.difference > 0 ? '+' : ''}{item.difference.toFixed(2)}%
                                                                </p>
                                                                <p className={`text-xs ${
                                                                    item.difference > 0 ? 'text-red-500' : item.difference < 0 ? 'text-green-500' : 'text-blue-500'
                                                                }`}>
                                                                    {item.differenceValue && item.differenceValue > 0 ? '+' : ''}
                                                                    {item.differenceValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-brand-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="text-sm font-bold text-brand-gray-800">
                                                            {((item.newPrice || 0) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {renderStatusBadge(item.status)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-gray-200 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-brand-gray-600">
                                    Comparação realizada em {new Date(selectedImport.uploadDate).toLocaleString('pt-BR')}
                                </p>
                                <p className="text-xs text-brand-gray-500 mt-1">
                                    Fornecedor: {selectedImport.supplierName}
                                </p>
                            </div>
                            <button
                                onClick={handleCreateBudget}
                                className="px-8 py-3 bg-brand-s3e text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                            >
                                <span className="text-xl">📝</span>
                                Criar Orçamento com Estes Preços
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Upload */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-scaleIn">
                        <div className="bg-gradient-to-r from-brand-s3e to-[#0d2847] p-6 rounded-t-xl">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">📤</span>
                                Importar Arquivo CSV
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">
                                Envie o arquivo com os preços do fornecedor para comparação
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informações sobre o formato */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">📋 Formato do Arquivo CSV</h4>
                                <p className="text-sm text-blue-700 mb-2">O arquivo deve conter as seguintes colunas:</p>
                                <ul className="text-xs text-blue-600 space-y-1 ml-4 list-disc">
                                    <li><strong>codigo</strong>: Código do material (ex: MAT-001)</li>
                                    <li><strong>nome</strong>: Nome/descrição do material</li>
                                    <li><strong>unidade</strong>: Unidade de medida (ex: Unidade, Rolo, Barra)</li>
                                    <li><strong>quantidade</strong>: Quantidade solicitada</li>
                                    <li><strong>preco_unitario</strong>: Preço unitário (use ponto como separador decimal)</li>
                                </ul>
                            </div>

                            {/* Nome do Fornecedor */}
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-2">
                                    Nome do Fornecedor <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={supplierName}
                                    onChange={(e) => setSupplierName(e.target.value)}
                                    placeholder="Ex: Eletro Materiais Ltda"
                                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-s3e focus:border-transparent"
                                />
                            </div>

                            {/* Exibir erro se houver */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-red-700 font-medium">Erro ao processar CSV</span>
                                    </div>
                                    <p className="text-red-600 text-sm mt-1">{error}</p>
                                </div>
                            )}

                            {/* Upload do Arquivo */}
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-2">
                                    Arquivo CSV <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-brand-gray-300 rounded-lg p-8 text-center hover:border-brand-s3e transition-colors">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label htmlFor="csv-upload" className="cursor-pointer">
                                        <div className="text-6xl mb-4">📄</div>
                                        {selectedFile ? (
                                            <div>
                                                <p className="text-sm font-semibold text-brand-gray-800">{selectedFile.name}</p>
                                                <p className="text-xs text-brand-gray-500 mt-1">
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-semibold text-brand-gray-800 mb-1">
                                                    Clique para selecionar o arquivo
                                                </p>
                                                <p className="text-xs text-brand-gray-500">
                                                    Apenas arquivos .csv são aceitos
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-brand-gray-50 border-t flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    setSupplierName('');
                                    setSelectedFile(null);
                                }}
                                className="px-6 py-2 bg-white border border-brand-gray-300 rounded-lg font-semibold hover:bg-brand-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={processCSV}
                                disabled={!selectedFile || !supplierName.trim() || isProcessing}
                                className="px-6 py-2 bg-brand-s3e text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processando...
                                    </span>
                                ) : (
                                    'Processar e Comparar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparacaoPrecos;

