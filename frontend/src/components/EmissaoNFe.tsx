import React, { useState } from 'react';

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

interface EmissaoNFeProps {
    toggleSidebar: () => void;
}

type SectionType = 'emitir' | 'configurar';

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
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [isModalEmpresaOpen, setIsModalEmpresaOpen] = useState(false);
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
        setIsModalEmpresaOpen(true);
    };

    const handleCloseModalEmpresa = () => {
        setIsModalEmpresaOpen(false);
    };

    const handleSalvarEmpresa = () => {
        // TODO: Conectar com API
        const novaEmpresa = {
            id: Date.now().toString(),
            ...empresaForm,
            certificadoValidade: certificadoFile ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : null
        };
        
        setEmpresas([...empresas, novaEmpresa]);
        handleCloseModalEmpresa();
        alert('Empresa cadastrada com sucesso!');
    };

    const handleDeleteEmpresa = (id: string) => {
        if (confirm('Deseja realmente excluir esta configuração fiscal?')) {
            setEmpresas(empresas.filter(e => e.id !== id));
        }
    };

    const handleCertificadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertificadoFile(e.target.files[0]);
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
                <nav className="flex gap-2">
                    <button
                        onClick={() => setActiveSection('emitir')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeSection === 'emitir'
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Emitir NF-e
                    </button>
                    <button
                        onClick={() => setActiveSection('configurar')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeSection === 'configurar'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
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
                    {empresas.length === 0 ? (
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

                                        {/* Botão Deletar */}
                                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                                            <button
                                                onClick={() => handleDeleteEmpresa(empresa.id)}
                                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Excluir Configuração
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
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-gray-200/50 animate-in zoom-in-95 duration-300">
                                {/* Header */}
                                <div className="p-6 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Configuração Fiscal</h2>
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
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Dados da Empresa
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.cnpj}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, cnpj: e.target.value})}
                                                    placeholder="00.000.000/0000-00"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Inscrição Estadual *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.inscricaoEstadual}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, inscricaoEstadual: e.target.value})}
                                                    placeholder="000.000.000"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.razaoSocial}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, razaoSocial: e.target.value})}
                                                    placeholder="Nome completo da empresa"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Fantasia</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.nomeFantasia}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, nomeFantasia: e.target.value})}
                                                    placeholder="Nome comercial (opcional)"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Regime Tributário *</label>
                                                <select
                                                    value={empresaForm.regimeTributario}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, regimeTributario: e.target.value})}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="SimplesNacional">Simples Nacional</option>
                                                    <option value="RegimeNormal">Regime Normal</option>
                                                    <option value="MEI">MEI</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Endereço */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Endereço Fiscal
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Logradouro *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.endereco}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, endereco: e.target.value})}
                                                    placeholder="Rua, Avenida, etc"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.numero}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, numero: e.target.value})}
                                                    placeholder="123"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.complemento}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, complemento: e.target.value})}
                                                    placeholder="Sala, Andar..."
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.bairro}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, bairro: e.target.value})}
                                                    placeholder="Centro"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.cidade}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, cidade: e.target.value})}
                                                    placeholder="Florianópolis"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                                                <select
                                                    value={empresaForm.estado}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, estado: e.target.value})}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
                                                <input
                                                    type="text"
                                                    value={empresaForm.cep}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, cep: e.target.value})}
                                                    placeholder="00000-000"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                                                <input
                                                    type="tel"
                                                    value={empresaForm.telefone}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, telefone: e.target.value})}
                                                    placeholder="(00) 0000-0000"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
                                                <input
                                                    type="email"
                                                    value={empresaForm.email}
                                                    onChange={(e) => setEmpresaForm({...empresaForm, email: e.target.value})}
                                                    placeholder="contato@empresa.com"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificado Digital */}
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Certificado Digital A1
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Arquivo .pfx/.p12 *</label>
                                                <input
                                                    type="file"
                                                    accept=".pfx,.p12"
                                                    onChange={handleCertificadoChange}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                                    required
                                                />
                                                {certificadoFile && (
                                                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Arquivo selecionado: {certificadoFile.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Senha do Certificado *</label>
                                                <input
                                                    type="password"
                                                    value={certificadoSenha}
                                                    onChange={(e) => setCertificadoSenha(e.target.value)}
                                                    placeholder="Digite a senha do certificado"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                                    required
                                                />
                                            </div>
                                            <div className="bg-white border-l-4 border-orange-400 p-4 rounded-r-lg">
                                                <div className="flex gap-3">
                                                    <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div className="text-sm text-gray-700">
                                                        <p className="font-semibold mb-1">Segurança do Certificado:</p>
                                                        <ul className="text-xs space-y-1 text-gray-600">
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
                                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
                                    <button
                                        onClick={handleCloseModalEmpresa}
                                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSalvarEmpresa}
                                        className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                                    >
                                        Salvar Configuração
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

