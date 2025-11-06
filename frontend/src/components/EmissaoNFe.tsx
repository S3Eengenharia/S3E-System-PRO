import React, { useState, useEffect } from 'react';
import { empresaFiscalService, type EmpresaFiscal } from '../services/empresaFiscalService';
import { nfeFiscalService } from '../services/nfeFiscalService';

// Icons
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
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

interface EmissaoNFeProps {
    toggleSidebar: () => void;
}

type SectionType = 'emitir' | 'operacoes' | 'configurar';

const EmissaoNFe: React.FC<EmissaoNFeProps> = ({ toggleSidebar }) => {
    const [activeSection, setActiveSection] = useState<SectionType>('emitir');
    
    // Estados para Emissão
    const [step, setStep] = useState(1);
    const [projetoSelecionado, setProjetoSelecionado] = useState('');
    const [tipoNF, setTipoNF] = useState<'PRODUTO' | 'SERVICO'>('PRODUTO');
    const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de produção do estabelecimento');
    const [cfop, setCfop] = useState('5101');
    const [serie, setSerie] = useState('1');
    
    // Estados para Configuração de Empresas
    const [empresas, setEmpresas] = useState<EmpresaFiscal[]>([]);
    const [loadingEmpresas, setLoadingEmpresas] = useState(false);
    const [isModalEmpresaOpen, setIsModalEmpresaOpen] = useState(false);
    const [editandoEmpresaId, setEditandoEmpresaId] = useState<string | null>(null);
    const [empresaForm, setEmpresaForm] = useState({
        cnpj: '',
        inscricaoEstadual: '',
        razaoSocial: '',
        nomeFantasia: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        regimeTributario: 'SimplesNacional'
    });
    const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
    const [certificadoSenha, setCertificadoSenha] = useState('');
    const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
    const [usarCertificadoExistente, setUsarCertificadoExistente] = useState(false);
    const [empresaCertificadoId, setEmpresaCertificadoId] = useState('');

    // Estados para Operações Fiscais (Cancelamento e Correção)
    const [chaveAcessoCancelamento, setChaveAcessoCancelamento] = useState('');
    const [justificativaCancelamento, setJustificativaCancelamento] = useState('');
    const [empresaCancelamentoId, setEmpresaCancelamentoId] = useState('');
    const [cancelando, setCancelando] = useState(false);
    const [resultadoCancelamento, setResultadoCancelamento] = useState<any>(null);

    const [chaveAcessoCorrecao, setChaveAcessoCorrecao] = useState('');
    const [textoCorrecao, setTextoCorrecao] = useState('');
    const [empresaCorrecaoId, setEmpresaCorrecaoId] = useState('');
    const [corrigindo, setCorrigindo] = useState(false);
    const [resultadoCorrecao, setResultadoCorrecao] = useState<any>(null);

    // Carregar empresas ao montar componente ou trocar de seção
    useEffect(() => {
        if (activeSection === 'configurar' || activeSection === 'operacoes') {
            loadEmpresas();
        }
    }, [activeSection]);

    const loadEmpresas = async () => {
        try {
            setLoadingEmpresas(true);
            const response = await empresaFiscalService.listar();
            if (response.success && response.data) {
                setEmpresas(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            alert('❌ Erro ao carregar empresas fiscais');
        } finally {
            setLoadingEmpresas(false);
        }
    };
    
    // Mock de projetos aprovados
    const projetosAprovados = [
        { id: '1', titulo: 'Subestação 150kVA - Empresa A', cliente: 'Empresa A', valor: 85000 },
        { id: '2', titulo: 'Quadro de Medição - Empresa B', cliente: 'Empresa B', valor: 12500 }
    ];

    // Handlers para Configuração de Empresas
    const handleOpenModalEmpresa = () => {
        setEmpresaForm({
            cnpj: '',
            inscricaoEstadual: '',
            razaoSocial: '',
            nomeFantasia: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
            telefone: '',
            email: '',
            regimeTributario: 'SimplesNacional'
        });
        setCertificadoFile(null);
        setCertificadoSenha('');
        setUsarCertificadoExistente(false);
        setEmpresaCertificadoId('');
        setIsModalEmpresaOpen(true);
    };

    const handleCloseModalEmpresa = () => {
        setIsModalEmpresaOpen(false);
        setEditandoEmpresaId(null);
        setCertificadoFile(null);
        setCertificadoSenha('');
        setUsarCertificadoExistente(false);
        setEmpresaCertificadoId('');
    };

    const handleEditarEmpresa = (empresa: EmpresaFiscal) => {
        setEmpresaForm({
            cnpj: empresa.cnpj,
            inscricaoEstadual: empresa.inscricaoEstadual,
            razaoSocial: empresa.razaoSocial,
            nomeFantasia: empresa.nomeFantasia || '',
            endereco: empresa.endereco,
            numero: empresa.numero,
            complemento: empresa.complemento || '',
            bairro: empresa.bairro,
            cidade: empresa.cidade,
            estado: empresa.estado,
            cep: empresa.cep,
            telefone: empresa.telefone || '',
            email: empresa.email || '',
            regimeTributario: empresa.regimeTributario
        });
        setEditandoEmpresaId(empresa.id);
        setCertificadoFile(null);
        setCertificadoSenha('');
        setUsarCertificadoExistente(false);
        setEmpresaCertificadoId('');
        setIsModalEmpresaOpen(true);
    };

    const handleSalvarEmpresa = async () => {
        try {
            // Validações
            if (!empresaForm.cnpj || !empresaForm.razaoSocial || !empresaForm.inscricaoEstadual) {
                alert('❌ Preencha todos os campos obrigatórios');
                return;
            }

            setSalvandoEmpresa(true);

            // Converter certificado para Base64 se fornecido
            let certificadoBase64 = undefined;
            let certificadoSenhaFinal = undefined;
            
            if (usarCertificadoExistente && empresaCertificadoId) {
                // Usar certificado de outra empresa
                const empresaOrigem = empresas.find(e => e.id === empresaCertificadoId);
                if (empresaOrigem) {
                    // Nota: Backend deve copiar certificado da empresa origem
                    console.log('📋 Usando certificado da empresa:', empresaOrigem.razaoSocial);
                }
            } else if (certificadoFile && certificadoSenha) {
                // Upload de novo certificado
                certificadoBase64 = await empresaFiscalService.converterCertificadoParaBase64(certificadoFile);
                certificadoSenhaFinal = certificadoSenha;
            }

            const dataToSave = {
                ...empresaForm,
                certificadoBase64,
                certificadoSenha: certificadoSenhaFinal,
                copiarCertificadoDeEmpresaId: usarCertificadoExistente ? empresaCertificadoId : undefined
            };

            if (editandoEmpresaId) {
                // Atualizar empresa existente
                const response = await empresaFiscalService.atualizar(editandoEmpresaId, dataToSave);
                if (response.success) {
                    alert('✅ Empresa atualizada com sucesso!');
                    await loadEmpresas();
                    handleCloseModalEmpresa();
                } else {
                    alert(`❌ ${response.error || 'Erro ao atualizar empresa'}`);
                }
            } else {
                // Criar nova empresa
                const response = await empresaFiscalService.criar(dataToSave);
                if (response.success) {
                    alert('✅ Empresa configurada com sucesso!');
                    await loadEmpresas();
                    handleCloseModalEmpresa();
                } else {
                    alert(`❌ ${response.error || 'Erro ao criar empresa'}`);
                }
            }
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
            alert('❌ Erro ao salvar empresa fiscal');
        } finally {
            setSalvandoEmpresa(false);
        }
    };

    const handleDeleteEmpresa = async (id: string) => {
        if (confirm('Deseja realmente excluir esta configuração fiscal?')) {
            try {
                const response = await empresaFiscalService.deletar(id);
                if (response.success) {
                    alert('✅ Empresa excluída com sucesso!');
                    await loadEmpresas();
                } else {
                    alert(`❌ ${response.error || 'Erro ao excluir empresa'}`);
                }
            } catch (error) {
                console.error('Erro ao excluir empresa:', error);
                alert('❌ Erro ao excluir empresa fiscal');
            }
        }
    };

    const handleCertificadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertificadoFile(e.target.files[0]);
        }
    };

    // Handlers para Operações Fiscais
    const handleCancelarNFe = async () => {
        try {
            if (!chaveAcessoCancelamento || !justificativaCancelamento || !empresaCancelamentoId) {
                alert('❌ Preencha todos os campos');
                return;
            }

            if (justificativaCancelamento.length < 15) {
                alert('❌ A justificativa deve ter pelo menos 15 caracteres');
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
                setChaveAcessoCancelamento('');
                setJustificativaCancelamento('');
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
                alert('❌ O texto da correção deve ter pelo menos 15 caracteres');
                return;
            }

            setCorrigindo(true);
            setResultadoCorrecao(null);

            const response = await nfeFiscalService.corrigirNFe({
                chaveAcesso: chaveAcessoCorrecao,
                correcao: textoCorrecao,
                empresaId: empresaCorrecaoId
            });

            if (response.success) {
                setResultadoCorrecao(response.data);
                alert('✅ Carta de Correção enviada com sucesso!');
                setChaveAcessoCorrecao('');
                setTextoCorrecao('');
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
        <div className="p-4 sm:p-8">
            {/* Header Principal */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Nota Fiscal Eletrônica</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de NF-e e configurações fiscais</p>
                    </div>
                </div>
            </header>

            {/* Navegação entre seções */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-2 mb-6">
                <nav className="flex gap-2">
                    <button
                        onClick={() => setActiveSection('emitir')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeSection === 'emitir'
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Emitir NF-e
                    </button>
                    <button
                        onClick={() => setActiveSection('operacoes')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeSection === 'operacoes'
                                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                                : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        Operações (Cancelar/Corrigir)
                    </button>
                    <button
                        onClick={() => setActiveSection('configurar')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeSection === 'configurar'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Configurar Empresas
                    </button>
                </nav>
            </div>

            {/* SEÇÃO: Emitir NF-e */}
            {activeSection === 'emitir' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-5xl mx-auto">
                    {/* Progress Steps */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                        step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {s}
                                    </div>
                                    {s < 3 && (
                                        <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs font-medium text-gray-600">Selecionar Projeto</span>
                            <span className="text-xs font-medium text-gray-600">Dados Fiscais</span>
                            <span className="text-xs font-medium text-gray-600">Revisão</span>
                        </div>
                    </div>

                <div className="p-6">
                    {/* Step 1: Selecionar Projeto */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800">Selecione o Projeto para Faturamento</h2>
                            <div className="space-y-3">
                                {projetosAprovados.map(projeto => (
                                    <div
                                        key={projeto.id}
                                        onClick={() => setProjetoSelecionado(projeto.id)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                            projetoSelecionado === projeto.id
                                                ? 'border-brand-blue bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{projeto.titulo}</h3>
                                                <p className="text-sm text-gray-600">Cliente: {projeto.cliente}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-green-600">
                                                    R$ {projeto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!projetoSelecionado}
                                    className="px-8 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próximo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Dados Fiscais */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800">Dados Fiscais da NF-e</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de NF-e *</label>
                                    <select
                                        value={tipoNF}
                                        onChange={(e) => setTipoNF(e.target.value as 'PRODUTO' | 'SERVICO')}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    >
                                        <option value="PRODUTO">NF-e de Produto</option>
                                        <option value="SERVICO">NF-e de Serviço</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Série *</label>
                                    <input
                                        type="text"
                                        value={serie}
                                        onChange={(e) => setSerie(e.target.value)}
                                        placeholder="1"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">CFOP *</label>
                                    <input
                                        type="text"
                                        value={cfop}
                                        onChange={(e) => setCfop(e.target.value)}
                                        placeholder="5101"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Natureza da Operação *</label>
                                    <input
                                        type="text"
                                        value={naturezaOperacao}
                                        onChange={(e) => setNaturezaOperacao(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Certifique-se de que os dados fiscais estão corretos antes de prosseguir.
                                    A emissão da NF-e será enviada para a SEFAZ após a confirmação.
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="px-8 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90"
                                >
                                    Próximo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Revisão */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800">Revisão da NF-e</h2>
                            
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Nota Fiscal Pronta para Emissão</h3>
                                        <p className="text-sm text-gray-600">Revise os dados antes de emitir</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Tipo:</p>
                                        <p className="font-semibold text-gray-900">{tipoNF}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">CFOP:</p>
                                        <p className="font-semibold text-gray-900">{cfop}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-600">Natureza da Operação:</p>
                                        <p className="font-semibold text-gray-900">{naturezaOperacao}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={() => alert('Funcionalidade de emissão será integrada com API da SEFAZ/Emissor externo')}
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg"
                                >
                                    Emitir NF-e
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* SEÇÃO: Operações Fiscais (Cancelar e Corrigir) */}
            {activeSection === 'operacoes' && (
                <div className="space-y-6">
                    {/* GRID de Cards */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* CARD: CANCELAMENTO DE NF-E */}
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

                        {/* CARD: CARTA DE CORREÇÃO (CC-E) */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center gap-3">
                                <PencilSquareIcon className="w-8 h-8 text-white" />
                                <div>
                                    <h2 className="text-xl font-bold text-white">Carta de Correção (CC-e)</h2>
                                    <p className="text-sm text-white/80">Corrigir informações de NF-e já autorizada</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
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

                                {/* Resultado */}
                                {resultadoCorrecao && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">✅ CC-e Registrada</h4>
                                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                            <p><strong>Protocolo:</strong> {resultadoCorrecao.protocolo}</p>
                                            <p><strong>Mensagem:</strong> {resultadoCorrecao.mensagem}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO: Configurar Empresas */}
            {activeSection === 'configurar' && (
                <div>
                    {/* Header da Seção */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Configurações Fiscais</h2>
                                <p className="text-sm text-gray-600 mt-1">Gerencie os CNPJs e certificados digitais para emissão de NF-e</p>
                            </div>
                            <button
                                onClick={handleOpenModalEmpresa}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Adicionar Empresa
                            </button>
                        </div>
                    </div>

                    {/* Lista de Empresas Configuradas */}
                    {loadingEmpresas ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando empresas cadastradas...</p>
                        </div>
                    ) : empresas.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma Empresa Configurada</h3>
                            <p className="text-gray-600 mb-6">Configure os dados fiscais da sua empresa para começar a emitir NF-e</p>
                            <button
                                onClick={handleOpenModalEmpresa}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Adicionar Primeira Empresa
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {empresas.map((empresa) => (
                                <div key={empresa.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-400 transition-all overflow-hidden">
                                    {/* Header do Card */}
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                        <h3 className="text-xl font-bold text-white">{empresa.razaoSocial}</h3>
                                        {empresa.nomeFantasia && (
                                            <p className="text-sm text-white/80">{empresa.nomeFantasia}</p>
                                        )}
                                    </div>

                                    {/* Conteúdo do Card */}
                                    <div className="p-6 space-y-4">
                                        {/* Grid de Informações */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 mb-1">CNPJ</p>
                                                <p className="text-sm font-bold text-gray-900">{empresa.cnpj}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 mb-1">Inscrição Estadual</p>
                                                <p className="text-sm font-bold text-gray-900">{empresa.inscricaoEstadual}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 mb-1">Regime Tributário</p>
                                                <p className="text-sm font-semibold text-gray-900">{empresa.regimeTributario}</p>
                                            </div>
                                            <div className={`rounded-lg p-3 ${empresa.certificadoValidade ? 'bg-green-50' : 'bg-red-50'}`}>
                                                <p className="text-xs font-medium text-gray-500 mb-1">Certificado Digital</p>
                                                <p className={`text-sm font-bold ${empresa.certificadoValidade ? 'text-green-700' : 'text-red-700'}`}>
                                                    {empresa.certificadoValidade ? `Válido até ${empresa.certificadoValidade}` : 'Não configurado'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Endereço */}
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <p className="text-xs font-medium text-gray-600 mb-1">📍 Endereço</p>
                                            <p className="text-sm text-gray-800">
                                                {empresa.endereco}, {empresa.numero} {empresa.complemento && `- ${empresa.complemento}`}
                                                <br />
                                                {empresa.bairro} - {empresa.cidade}/{empresa.estado}
                                                <br />
                                                CEP: {empresa.cep}
                                            </p>
                                        </div>

                                        {/* Botões de Ação */}
                                        <div className="pt-4 border-t border-gray-200 flex justify-between">
                                            <button
                                                onClick={() => handleEditarEmpresa(empresa)}
                                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmpresa(empresa.id)}
                                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Modal de Adicionar/Editar Empresa */}
                    {isModalEmpresaOpen && (
                        <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-gray-200/50 dark:border-dark-border animate-in zoom-in-95 duration-300">
                                {/* Header */}
                                <div className="p-6 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">
                                                {editandoEmpresaId ? 'Editar' : 'Nova'} Configuração Fiscal
                                            </h2>
                                            <p className="text-sm text-white/80">Dados da empresa para emissão de NF-e</p>
                                        </div>
                                    </div>
                                    <button onClick={handleCloseModalEmpresa} className="p-2 rounded-xl text-white/90 hover:bg-white/20 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Conteúdo Scrollável */}
                                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                    {/* Dados da Empresa */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-gray-200 dark:border-dark-border">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Dados da Empresa
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">CNPJ *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.cnpj}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, cnpj: e.target.value})}
                                                    placeholder="00.000.000/0000-00"
                                                    className="input-field disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                                                    required
                                                    disabled={!!editandoEmpresaId}
                                                />
                                                {editandoEmpresaId && (
                                                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">⚠️ CNPJ não pode ser alterado</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Inscrição Estadual *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.inscricaoEstadual}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, inscricaoEstadual: e.target.value})}
                                                    placeholder="000.000.000"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Razão Social *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.razaoSocial}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, razaoSocial: e.target.value})}
                                                    placeholder="Nome completo da empresa"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Nome Fantasia</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.nomeFantasia}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, nomeFantasia: e.target.value})}
                                                    placeholder="Nome comercial (opcional)"
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Regime Tributário *</label>
                                                <select
                                                    value={empresaForm.regimeTributario}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, regimeTributario: e.target.value})}
                                                    className="select-field"
                                                >
                                                    <option value="SimplesNacional">Simples Nacional</option>
                                                    <option value="RegimeNormal">Regime Normal</option>
                                                    <option value="MEI">MEI</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Endereço */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Endereço Fiscal
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Logradouro *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.endereco}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, endereco: e.target.value})}
                                                    placeholder="Rua, Avenida, etc"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Número *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.numero}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, numero: e.target.value})}
                                                    placeholder="123"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Complemento</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.complemento}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, complemento: e.target.value})}
                                                    placeholder="Sala, Andar..."
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Bairro *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.bairro}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, bairro: e.target.value})}
                                                    placeholder="Centro"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Cidade *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.cidade}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, cidade: e.target.value})}
                                                    placeholder="Florianópolis"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Estado *</label>
                                                <select
                                                    value={empresaForm.estado}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, estado: e.target.value})}
                                                    className="input-field"
                                                    required
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option value="SC">Santa Catarina</option>
                                                    <option value="PR">Paraná</option>
                                                    <option value="RS">Rio Grande do Sul</option>
                                                    <option value="SP">São Paulo</option>
                                                    {/* Adicionar outros estados conforme necessário */}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">CEP *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.cep}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, cep: e.target.value})}
                                                    placeholder="00000-000"
                                                    className="input-field"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Telefone</label>
                                                <input
                                                    type="tel"
                                                    value={empresaForm.telefone}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, telefone: e.target.value})}
                                                    placeholder="(00) 0000-0000"
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">E-mail</label>
                                                <input
                                                    type="email"
                                                    value={empresaForm.email}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, email: e.target.value})}
                                                    placeholder="contato@empresa.com"
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificado Digital */}
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Certificado Digital A1
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Opção: Usar Certificado Existente */}
                                            {empresas.filter(e => e.certificadoValidade && e.id !== editandoEmpresaId).length > 0 && (
                                                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={usarCertificadoExistente}
                                                            onChange={(e) => {
                                                                setUsarCertificadoExistente(e.target.checked);
                                                                if (e.target.checked) {
                                                                    setCertificadoFile(null);
                                                                    setCertificadoSenha('');
                                                                } else {
                                                                    setEmpresaCertificadoId('');
                                                                }
                                                            }}
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-dark-text">Usar Certificado Existente</p>
                                                            <p className="text-xs text-gray-600 dark:text-dark-text-secondary">Compartilhar certificado de outra empresa</p>
                                                        </div>
                                                    </label>
                                                    
                                                    {usarCertificadoExistente && (
                                                        <div className="mt-4">
                                                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Selecione a Empresa *</label>
                                                            <select
                                                                value={empresaCertificadoId}
                                                                onChange={(e) => setEmpresaCertificadoId(e.target.value)}
                                                                className="select-field"
                                                                required
                                                            >
                                                                <option value="">Selecione...</option>
                                                                {empresas
                                                                    .filter(e => e.certificadoValidade && e.id !== editandoEmpresaId)
                                                                    .map(emp => (
                                                                        <option key={emp.id} value={emp.id}>
                                                                            {emp.razaoSocial} ({emp.cnpj}) - Válido até {emp.certificadoValidade}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Upload de Novo Certificado */}
                                            {!usarCertificadoExistente && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                            Arquivo .pfx/.p12 {!editandoEmpresaId && '*'}
                                                        </label>
                                                        <input
                                                            type="file"
                                                            accept=".pfx,.p12"
                                                            onChange={handleCertificadoChange}
                                                            className="input-field"
                                                        />
                                                        {certificadoFile && (
                                                            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Arquivo selecionado: {certificadoFile.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                            Senha do Certificado {!editandoEmpresaId && '*'}
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={certificadoSenha}
                                                            onChange={(e) => setCertificadoSenha(e.target.value)}
                                                            placeholder="Digite a senha do certificado"
                                                            className="input-field"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            <div className="bg-white dark:bg-slate-800 border-l-4 border-orange-400 dark:border-orange-600 p-4 rounded-r-lg">
                                                <div className="flex gap-3">
                                                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div className="text-sm text-gray-700 dark:text-dark-text">
                                                        <p className="font-semibold mb-1">Segurança do Certificado:</p>
                                                        <ul className="text-xs space-y-1 text-gray-600 dark:text-dark-text-secondary">
                                                            <li>• O certificado será armazenado de forma segura no servidor</li>
                                                            <li>• A senha será criptografada antes do armazenamento</li>
                                                            <li>• Apenas administradores podem gerenciar certificados</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3 rounded-b-2xl">
                                    <button
                                        onClick={handleCloseModalEmpresa}
                                        className="btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSalvarEmpresa}
                                        disabled={salvandoEmpresa}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {salvandoEmpresa ? (
                                            <>
                                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Salvando...
                                            </>
                                        ) : (
                                            editandoEmpresaId ? 'Atualizar Configuração' : 'Salvar Configuração'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmissaoNFe;

