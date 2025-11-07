/**
 * EXEMPLO DE INTEGRAÇÃO DO SISTEMA DE PDF CUSTOMIZATION
 * 
 * Este arquivo mostra como integrar o sistema de customização de PDF
 * em qualquer página que precise gerar orçamentos em PDF.
 */

import React, { useState } from 'react';
import PDFCustomizationModal from './src/components/PDFCustomization/PDFCustomizationModal';
import { OrcamentoPDFData } from './src/types/pdfCustomization';

// Exemplo 1: Integração na Página de Listagem de Orçamentos
export const OrcamentosListagemExample = () => {
    const [showPDFCustomization, setShowPDFCustomization] = useState(false);
    const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<any>(null);

    const handlePersonalizarPDF = (orcamento: any) => {
        setOrcamentoSelecionado(orcamento);
        setShowPDFCustomization(true);
    };

    // Preparar dados para o PDF
    const prepararDadosOrcamento = (orcamento: any): OrcamentoPDFData => {
        return {
            numero: orcamento.id.substring(0, 8).toUpperCase(),
            data: new Date(orcamento.createdAt).toLocaleDateString('pt-BR'),
            validade: new Date(orcamento.validade).toLocaleDateString('pt-BR'),
            cliente: {
                nome: orcamento.cliente.nome,
                cpfCnpj: orcamento.cliente.cpfCnpj,
                endereco: orcamento.cliente.endereco,
                telefone: orcamento.cliente.telefone,
                email: orcamento.cliente.email
            },
            projeto: {
                titulo: orcamento.titulo,
                descricao: orcamento.descricao,
                enderecoObra: orcamento.enderecoObra,
                cidade: orcamento.cidade,
                bairro: orcamento.bairro,
                cep: orcamento.cep
            },
            items: orcamento.items.map((item: any) => ({
                codigo: item.materialId || item.kitId,
                nome: item.nome,
                descricao: item.descricao,
                unidade: item.unidadeMedida,
                quantidade: item.quantidade,
                valorUnitario: item.precoUnit,
                valorTotal: item.subtotal
            })),
            financeiro: {
                subtotal: orcamento.custoTotal,
                bdi: orcamento.bdi,
                valorComBDI: orcamento.custoTotal * (1 + orcamento.bdi / 100),
                desconto: orcamento.descontoValor || 0,
                impostos: orcamento.impostoPercentual || 0,
                valorTotal: orcamento.precoVenda,
                condicaoPagamento: orcamento.condicaoPagamento || 'À Vista'
            },
            observacoes: orcamento.observacoes,
            empresa: {
                nome: 'S3E Engenharia',
                cnpj: '00.000.000/0000-00'
            }
        };
    };

    return (
        <div>
            {/* Lista de orçamentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Cada card de orçamento */}
                <div className="card-primary p-6">
                    <h3 className="text-lg font-bold mb-2">Orçamento #001</h3>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                        Cliente: João Silva
                    </p>
                    
                    {/* Botões de ação */}
                    <div className="flex gap-2">
                        <button className="btn-secondary">
                            Visualizar
                        </button>
                        <button className="btn-primary">
                            Editar
                        </button>
                        {/* BOTÃO NOVO: Personalizar PDF */}
                        <button
                            onClick={() => handlePersonalizarPDF(orcamento)}
                            className="btn-info flex items-center gap-2"
                            title="Personalizar e gerar PDF"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Customização de PDF */}
            {showPDFCustomization && orcamentoSelecionado && (
                <PDFCustomizationModal
                    isOpen={showPDFCustomization}
                    onClose={() => {
                        setShowPDFCustomization(false);
                        setOrcamentoSelecionado(null);
                    }}
                    orcamentoData={prepararDadosOrcamento(orcamentoSelecionado)}
                    onGeneratePDF={() => {
                        console.log('PDF gerado com sucesso!');
                        // Opcional: Fechar modal após gerar
                        // setShowPDFCustomization(false);
                    }}
                />
            )}
        </div>
    );
};

// Exemplo 2: Integração na Página de Criação de Orçamento
export const NovoOrcamentoPageExample = () => {
    const [showPDFCustomization, setShowPDFCustomization] = useState(false);
    const [formData, setFormData] = useState<any>({
        // ... dados do formulário
    });

    const handleSubmitAndGeneratePDF = () => {
        // Primeiro, mostrar modal de customização
        setShowPDFCustomization(true);
    };

    const prepararDadosDoFormulario = (): OrcamentoPDFData => {
        return {
            numero: 'NOVO',
            data: new Date().toLocaleDateString('pt-BR'),
            validade: formData.validade,
            cliente: {
                nome: formData.clienteNome || 'Cliente',
                cpfCnpj: formData.clienteCpfCnpj || '',
                // ...
            },
            projeto: {
                titulo: formData.titulo,
                descricao: formData.descricao,
                // ...
            },
            items: formData.items || [],
            financeiro: {
                subtotal: formData.subtotal || 0,
                bdi: formData.bdi || 0,
                valorComBDI: formData.valorComBDI || 0,
                desconto: formData.desconto || 0,
                impostos: formData.impostos || 0,
                valorTotal: formData.valorTotal || 0,
                condicaoPagamento: formData.condicaoPagamento || 'À Vista'
            },
            empresa: {
                nome: 'S3E Engenharia',
                cnpj: '00.000.000/0000-00'
            }
        };
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Novo Orçamento</h1>
            
            {/* Formulário de orçamento aqui */}
            <form>
                {/* ... campos do formulário ... */}
            </form>

            {/* Botões de ação no rodapé */}
            <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn-secondary">
                    Cancelar
                </button>
                <button type="button" className="btn-primary">
                    Salvar Orçamento
                </button>
                {/* NOVO: Botão para Personalizar PDF antes de salvar */}
                <button
                    type="button"
                    onClick={handleSubmitAndGeneratePDF}
                    className="btn-info flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Gerar PDF Personalizado
                </button>
            </div>

            {/* Modal de Customização */}
            {showPDFCustomization && (
                <PDFCustomizationModal
                    isOpen={showPDFCustomization}
                    onClose={() => setShowPDFCustomization(false)}
                    orcamentoData={prepararDadosDoFormulario()}
                    onGeneratePDF={() => {
                        console.log('PDF gerado!');
                    }}
                />
            )}
        </div>
    );
};

// Exemplo 3: Integração com Botão na Toolbar
export const ToolbarWithPDFButton = ({ orcamento }: { orcamento: any }) => {
    const [showPDFModal, setShowPDFModal] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <button className="btn-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar
                </button>

                <button className="btn-danger">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Excluir
                </button>

                {/* Botão PDF Customizado */}
                <button
                    onClick={() => setShowPDFModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-semibold shadow-md"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    🎨 Gerar PDF Personalizado
                </button>
            </div>

            {showPDFModal && (
                <PDFCustomizationModal
                    isOpen={showPDFModal}
                    onClose={() => setShowPDFModal(false)}
                    orcamentoData={/* preparar dados */}
                />
            )}
        </>
    );
};

// Exemplo 4: Integração em Modal de Detalhes
export const ModalDetalhesOrcamento = ({ orcamento, onClose }: any) => {
    const [showPDFCustomization, setShowPDFCustomization] = useState(false);

    return (
        <>
            <div className="modal-content max-w-4xl">
                <div className="modal-header">
                    <h2 className="text-xl font-bold">Detalhes do Orçamento</h2>
                </div>

                <div className="modal-body">
                    {/* Detalhes do orçamento aqui */}
                    <p>Cliente: {orcamento.cliente.nome}</p>
                    <p>Valor Total: R$ {orcamento.precoVenda}</p>
                    {/* ... */}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">
                        Fechar
                    </button>
                    {/* Botão para Personalizar PDF */}
                    <button
                        onClick={() => setShowPDFCustomization(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        🎨 Personalizar PDF
                    </button>
                </div>
            </div>

            {/* Modal de Customização sobreposto */}
            {showPDFCustomization && (
                <PDFCustomizationModal
                    isOpen={showPDFCustomization}
                    onClose={() => setShowPDFCustomization(false)}
                    orcamentoData={/* preparar dados */}
                />
            )}
        </>
    );
};

/**
 * DICAS DE IMPLEMENTAÇÃO:
 * 
 * 1. ONDE ADICIONAR O BOTÃO:
 *    - Listagem de orçamentos (em cada card)
 *    - Página de detalhes do orçamento
 *    - Toolbar de ações
 *    - Rodapé do formulário de criação/edição
 * 
 * 2. PREPARAR DADOS:
 *    - Sempre use a interface OrcamentoPDFData
 *    - Converta datas para formato pt-BR
 *    - Garanta que todos os campos obrigatórios estejam preenchidos
 * 
 * 3. FEEDBACK VISUAL:
 *    - Use ícones para indicar ação de PDF
 *    - Adicione loading durante geração
 *    - Mostre toast/alert de sucesso
 * 
 * 4. UX:
 *    - Permita fechar o modal sem perder customizações
 *    - Salve último template usado
 *    - Forneça templates padrão da empresa
 * 
 * 5. PERFORMANCE:
 *    - Geração de PDF pode demorar 5-15 segundos
 *    - Mostre indicador de progresso
 *    - Evite múltiplas gerações simultâneas
 */

export default {
    OrcamentosListagemExample,
    NovoOrcamentoPageExample,
    ToolbarWithPDFButton,
    ModalDetalhesOrcamento
};

