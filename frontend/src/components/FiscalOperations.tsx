import React, { useState, useEffect } from 'react';
import { nfeFiscalService } from '../services/nfeFiscalService';
import { empresaFiscalService, type EmpresaFiscal } from '../services/empresaFiscalService';

// Icons
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const DocumentPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

interface FiscalOperationsProps {
    toggleSidebar: () => void;
}

const FiscalOperations: React.FC<FiscalOperationsProps> = ({ toggleSidebar }) => {
    // Estados de Emissão
    const [pedidoId, setPedidoId] = useState('');
    const [empresaEmissaoId, setEmpresaEmissaoId] = useState('');
    const [emitindo, setEmitindo] = useState(false);
    const [resultadoEmissao, setResultadoEmissao] = useState<any>(null);

    // Estados de Cancelamento
    const [chaveAcessoCancelamento, setChaveAcessoCancelamento] = useState('');
    const [justificativaCancelamento, setJustificativaCancelamento] = useState('');
    const [empresaCancelamentoId, setEmpresaCancelamentoId] = useState('');
    const [cancelando, setCancelando] = useState(false);
    const [resultadoCancelamento, setResultadoCancelamento] = useState<any>(null);

    // Estados de Correção
    const [chaveAcessoCorrecao, setChaveAcessoCorrecao] = useState('');
    const [textoCorrecao, setTextoCorrecao] = useState('');
    const [empresaCorrecaoId, setEmpresaCorrecaoId] = useState('');
    const [corrigindo, setCorrigindo] = useState(false);
    const [resultadoCorrecao, setResultadoCorrecao] = useState<any>(null);

    // Lista de empresas
    const [empresas, setEmpresas] = useState<EmpresaFiscal[]>([]);
    const [loadingEmpresas, setLoadingEmpresas] = useState(false);

    useEffect(() => {
        loadEmpresas();
    }, []);

    const loadEmpresas = async () => {
        try {
            setLoadingEmpresas(true);
            const response = await empresaFiscalService.listar();
            if (response.success && response.data) {
                setEmpresas(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
        } finally {
            setLoadingEmpresas(false);
        }
    };

    const handleEmitirNFe = async () => {
        try {
            if (!pedidoId || !empresaEmissaoId) {
                alert('❌ Preencha todos os campos');
                return;
            }

            setEmitindo(true);
            setResultadoEmissao(null);

            const response = await nfeFiscalService.emitirNFe({
                pedidoId,
                empresaId: empresaEmissaoId
            });

            if (response.success) {
                setResultadoEmissao(response.data);
                alert('✅ NF-e emitida com sucesso!');
            } else {
                alert(`❌ ${response.error || 'Erro ao emitir NF-e'}`);
            }
        } catch (error: any) {
            console.error('Erro ao emitir NF-e:', error);
            alert(`❌ Erro: ${error.response?.data?.message || error.message}`);
        } finally {
            setEmitindo(false);
        }
    };

    const handleCancelarNFe = async () => {
        try {
            if (!chaveAcessoCancelamento || !justificativaCancelamento || !empresaCancelamentoId) {
                alert('❌ Preencha todos os campos');
                return;
            }

            if (justificativaCancelamento.length < 15) {
                alert('❌ Justificativa deve ter no mínimo 15 caracteres');
                return;
            }

            setCancelando(true);
            setResultadoCancelamento(null);

            const response = await nfeFiscalService.cancelarNFe({
                chaveAcesso: chaveAcessoCancelamento,
                justificativa: justificativaCancelamento,
                empresaId: empresaCancelamentoId
            });

            if (response.success) {
                setResultadoCancelamento(response.data);
                alert('✅ NF-e cancelada com sucesso!');
            } else {
                alert(`❌ ${response.error || 'Erro ao cancelar NF-e'}`);
            }
        } catch (error: any) {
            console.error('Erro ao cancelar NF-e:', error);
            alert(`❌ Erro: ${error.response?.data?.message || error.message}`);
        } finally {
            setCancelando(false);
        }
    };

    const handleCorrigirNFe = async () => {
        try {
            if (!chaveAcessoCorrecao || !textoCorrecao || !empresaCorrecaoId) {
                alert('❌ Preencha todos os campos');
                return;
            }

            if (textoCorrecao.length < 15) {
                alert('❌ Texto da correção deve ter no mínimo 15 caracteres');
                return;
            }

            setCorrigindo(true);
            setResultadoCorrecao(null);

            const response = await nfeFiscalService.corrigirNFe({
                chaveAcesso: chaveAcessoCorrecao,
                textoCorrecao,
                empresaId: empresaCorrecaoId
            });

            if (response.success) {
                setResultadoCorrecao(response.data);
                alert('✅ Carta de Correção registrada com sucesso!');
            } else {
                alert(`❌ ${response.error || 'Erro ao enviar CC-e'}`);
            }
        } catch (error: any) {
            console.error('Erro ao enviar CC-e:', error);
            alert(`❌ Erro: ${error.response?.data?.message || error.message}`);
        } finally {
            setCorrigindo(false);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-dark-bg">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 dark:text-dark-text-secondary rounded-xl hover:bg-white dark:hover:bg-dark-card hover:shadow-md transition-all">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-dark-text tracking-tight">Operações Fiscais</h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-dark-text-secondary mt-1">Emissão, cancelamento e correção de NF-e</p>
                    </div>
                </div>
            </header>

            {/* Grid de Operações */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* CARD 1: EMISSÃO DE NF-E */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border-2 border-green-200 dark:border-green-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center gap-3">
                        <DocumentPlusIcon className="w-8 h-8 text-white" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Emissão de NF-e</h2>
                            <p className="text-sm text-white/80">Gerar e enviar NF-e para SEFAZ</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Selecionar Empresa */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                Empresa Emitente *
                            </label>
                            <select
                                value={empresaEmissaoId}
                                onChange={(e) => setEmpresaEmissaoId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                            >
                                <option value="">Selecione a empresa...</option>
                                {empresas.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.razaoSocial} ({emp.cnpj})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ID do Pedido */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                ID do Pedido de Venda *
                            </label>
                            <input
                                type="text"
                                value={pedidoId}
                                onChange={(e) => setPedidoId(e.target.value)}
                                placeholder="Ex: 12345"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                            />
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                                ID do pedido/projeto que será faturado
                            </p>
                        </div>

                        {/* Botão Emitir */}
                        <button
                            onClick={handleEmitirNFe}
                            disabled={emitindo}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {emitindo ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Emitindo...
                                </>
                            ) : (
                                <>
                                    <DocumentPlusIcon className="w-5 h-5 inline mr-2" />
                                    Emitir NF-e
                                </>
                            )}
                        </button>

                        {/* Resultado */}
                        {resultadoEmissao && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                <h4 className="font-bold text-green-800 dark:text-green-400 mb-2">✅ NF-e Autorizada</h4>
                                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                    <p><strong>Chave:</strong> {resultadoEmissao.chaveAcesso}</p>
                                    <p><strong>Protocolo:</strong> {resultadoEmissao.protocolo}</p>
                                    <p><strong>Mensagem:</strong> {resultadoEmissao.mensagem}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 2: CANCELAMENTO DE NF-E */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border-2 border-red-200 dark:border-red-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 flex items-center gap-3">
                        <XCircleIcon className="w-8 h-8 text-white" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Cancelamento de NF-e</h2>
                            <p className="text-sm text-white/80">Cancelar NF-e autorizada na SEFAZ</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Selecionar Empresa */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                Empresa *
                            </label>
                            <select
                                value={empresaCancelamentoId}
                                onChange={(e) => setEmpresaCancelamentoId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-red-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                            >
                                <option value="">Selecione a empresa...</option>
                                {empresas.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.razaoSocial} ({emp.cnpj})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Chave de Acesso */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                Chave de Acesso da NF-e *
                            </label>
                            <input
                                type="text"
                                value={chaveAcessoCancelamento}
                                onChange={(e) => setChaveAcessoCancelamento(e.target.value)}
                                placeholder="44 dígitos"
                                maxLength={44}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-red-500 font-mono bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                            />
                        </div>

                        {/* Justificativa */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                Justificativa do Cancelamento *
                            </label>
                            <textarea
                                value={justificativaCancelamento}
                                onChange={(e) => setJustificativaCancelamento(e.target.value)}
                                placeholder="Mínimo de 15 caracteres..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-red-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                            />
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                                {justificativaCancelamento.length}/15 caracteres mínimos
                            </p>
                        </div>

                        {/* Botão Cancelar */}
                        <button
                            onClick={handleCancelarNFe}
                            disabled={cancelando}
                            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelando ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Cancelando...
                                </>
                            ) : (
                                <>
                                    <XCircleIcon className="w-5 h-5 inline mr-2" />
                                    Cancelar NF-e
                                </>
                            )}
                        </button>

                        {/* Resultado */}
                        {resultadoCancelamento && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <h4 className="font-bold text-red-800 dark:text-red-400 mb-2">✅ NF-e Cancelada</h4>
                                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                    <p><strong>Protocolo:</strong> {resultadoCancelamento.protocolo}</p>
                                    <p><strong>Mensagem:</strong> {resultadoCancelamento.mensagem}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 3: CARTA DE CORREÇÃO (CC-E) */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border-2 border-blue-200 dark:border-blue-800 overflow-hidden xl:col-span-2">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center gap-3">
                        <PencilSquareIcon className="w-8 h-8 text-white" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Carta de Correção (CC-e)</h2>
                            <p className="text-sm text-white/80">Corrigir informações de NF-e já autorizada</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {/* Selecionar Empresa */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                        Empresa *
                                    </label>
                                    <select
                                        value={empresaCorrecaoId}
                                        onChange={(e) => setEmpresaCorrecaoId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                                    >
                                        <option value="">Selecione a empresa...</option>
                                        {empresas.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.razaoSocial} ({emp.cnpj})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Chave de Acesso */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                        Chave de Acesso da NF-e *
                                    </label>
                                    <input
                                        type="text"
                                        value={chaveAcessoCorrecao}
                                        onChange={(e) => setChaveAcessoCorrecao(e.target.value)}
                                        placeholder="44 dígitos"
                                        maxLength={44}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 font-mono bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Texto da Correção */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-dark-text mb-2">
                                        Texto da Correção *
                                    </label>
                                    <textarea
                                        value={textoCorrecao}
                                        onChange={(e) => setTextoCorrecao(e.target.value)}
                                        placeholder="Descreva a correção necessária (mínimo 15 caracteres)..."
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                                        {textoCorrecao.length}/15 caracteres mínimos
                                    </p>
                                </div>

                                {/* Botão Corrigir */}
                                <button
                                    onClick={handleCorrigirNFe}
                                    disabled={corrigindo}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {corrigindo ? (
                                        <>
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Enviando CC-e...
                                        </>
                                    ) : (
                                        <>
                                            <PencilSquareIcon className="w-5 h-5 inline mr-2" />
                                            Enviar Carta de Correção
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Resultado */}
                        {resultadoCorrecao && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">✅ CC-e Registrada</h4>
                                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <p><strong>Protocolo:</strong> {resultadoCorrecao.protocolo}</p>
                                    <p><strong>Sequência:</strong> {resultadoCorrecao.sequencia}</p>
                                    <p><strong>Mensagem:</strong> {resultadoCorrecao.mensagem}</p>
                                </div>
                            </div>
                        )}

                        {/* Informações sobre CC-e */}
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-xs text-yellow-800 dark:text-yellow-400">
                                <strong>⚠️ Importante:</strong> A CC-e NÃO pode corrigir: valores de impostos, preços, quantidades, dados cadastrais do destinatário ou data de emissão.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-6 bg-white dark:bg-dark-card rounded-2xl shadow-md border border-gray-200 dark:border-dark-border p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">📋 Informações Importantes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">Emissão</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                            Gera XML, assina digitalmente e envia para SEFAZ. Aguarde a autorização antes de transmitir a mercadoria.
                        </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <h4 className="font-bold text-red-800 dark:text-red-400 mb-2">Cancelamento</h4>
                        <p className="text-red-700 dark:text-red-300">
                            Prazo de até 24h após autorização. Justificativa mínima de 15 caracteres é obrigatória.
                        </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2">Carta de Correção</h4>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Para corrigir erros que não alterem valores fiscais. Pode ser enviada múltiplas vezes (sequência).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiscalOperations;

