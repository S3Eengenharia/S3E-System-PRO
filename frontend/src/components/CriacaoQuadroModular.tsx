import React, { useState, useMemo, useEffect } from 'react';
import { quadrosService, type QuadroConfig, type CaixaEstoque } from '../services/quadrosService';
import { axiosApiService } from '../services/axiosApi';

// Icons
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

interface Material {
    id: string;
    nome: string;
    preco: number;
    estoque: number;
    unidadeMedida: string;
}

interface CriacaoQuadroModularProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const ETAPAS = [
    { id: 1, nome: 'Caixas' },
    { id: 2, nome: 'Disjuntor Geral' },
    { id: 3, nome: 'Medição' },
    { id: 4, nome: 'Cabos' },
    { id: 5, nome: 'DPS' },
    { id: 6, nome: 'Born/Parafuso' },
    { id: 7, nome: 'Trilho DIN' },
    { id: 8, nome: 'Componentes Finais' }
];

const CriacaoQuadroModular: React.FC<CriacaoQuadroModularProps> = ({ isOpen, onClose, onSave }) => {
    const [etapaAtual, setEtapaAtual] = useState(1);
    const [nomeQuadro, setNomeQuadro] = useState('');
    const [descricaoQuadro, setDescricaoQuadro] = useState('');
    const [tipoQuadro, setTipoQuadro] = useState<'POLICARBONATO' | 'ALUMINIO' | 'COMANDO'>('POLICARBONATO');
    
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Estados específicos para ALUMINIO/COMANDO (BLOCO 2)
    const [caixasDisponiveis, setCaixasDisponiveis] = useState<CaixaEstoque[]>([]);
    const [isLoadingCaixas, setIsLoadingCaixas] = useState(false);
    const [caixaSelecionada, setCaixaSelecionada] = useState<CaixaEstoque | null>(null);
    const [searchCaixaTerm, setSearchCaixaTerm] = useState('');
    
    // Configuração do quadro
    const [config, setConfig] = useState<QuadroConfig>({
        tipo: 'POLICARBONATO',
        caixas: [],
        medidores: [],
        cabos: [],
        componentes: []
    });

    useEffect(() => {
        if (isOpen) {
            loadMateriais();
        }
    }, [isOpen]);

    // BLOCO 2: useEffect para monitorar mudança de tipo do quadro
    useEffect(() => {
        if (isOpen && (tipoQuadro === 'ALUMINIO' || tipoQuadro === 'COMANDO')) {
            loadCaixasDisponiveis(tipoQuadro);
        }
    }, [tipoQuadro, isOpen]);

    const loadMateriais = async () => {
        try {
            setLoading(true);
            const response = await axiosApiService.get('/api/materiais');
            if (response.success && response.data) {
                const materiaisArray = Array.isArray(response.data) ? response.data : [];
                setMateriais(materiaisArray.map((m: any) => ({
                    id: m.id,
                    nome: m.nome,
                    preco: m.preco || 0,
                    estoque: m.estoque || 0,
                    unidadeMedida: m.unidadeMedida || 'un'
                })));
            }
        } catch (error) {
            console.error('Erro ao carregar materiais:', error);
        } finally {
            setLoading(false);
        }
    };

    // BLOCO 2: Função para carregar caixas de estoque (ALUMINIO/COMANDO)
    const loadCaixasDisponiveis = async (tipo: 'ALUMINIO' | 'COMANDO') => {
        try {
            setIsLoadingCaixas(true);
            console.log(`🔍 Carregando caixas de estoque do tipo: ${tipo}`);
            
            const caixas = await quadrosService.buscarCaixasEstoque(tipo);
            setCaixasDisponiveis(caixas);
            
            console.log(`✅ ${caixas.length} caixas carregadas`);
        } catch (error) {
            console.error('❌ Erro ao carregar caixas disponíveis:', error);
            setCaixasDisponiveis([]);
        } finally {
            setIsLoadingCaixas(false);
        }
    };

    const materiaisFiltrados = useMemo(() => {
        if (!searchTerm) return materiais.filter(m => m.estoque > 0);
        return materiais.filter(m => 
            m.estoque > 0 &&
            (m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
             m.id.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [materiais, searchTerm]);

    // BLOCO 2: Filtrar caixas disponíveis por termo de busca
    const caixasFiltradas = useMemo(() => {
        if (!searchCaixaTerm) return caixasDisponiveis;
        return caixasDisponiveis.filter(c =>
            c.descricao.toLowerCase().includes(searchCaixaTerm.toLowerCase()) ||
            c.codigo.toLowerCase().includes(searchCaixaTerm.toLowerCase())
        );
    }, [caixasDisponiveis, searchCaixaTerm]);

    const valorTotal = useMemo(() => {
        let total = 0;
        
        // Caixas
        config.caixas.forEach(item => {
            const material = materiais.find(m => m.id === item.materialId);
            if (material) total += material.preco * item.quantidade;
        });
        
        // Disjuntor Geral
        if (config.disjuntorGeral) {
            const material = materiais.find(m => m.id === config.disjuntorGeral!.materialId);
            if (material) total += material.preco * config.disjuntorGeral.quantidade;
        }
        
        // Barramento
        if (config.barramento) {
            const material = materiais.find(m => m.id === config.barramento!.materialId);
            if (material) total += material.preco * config.barramento.quantidade;
        }
        
        // Medidores
        config.medidores.forEach(item => {
            const materialDisjuntor = materiais.find(m => m.id === item.disjuntorId);
            if (materialDisjuntor) total += materialDisjuntor.preco * item.quantidade;
            
            if (item.medidorId) {
                const materialMedidor = materiais.find(m => m.id === item.medidorId);
                if (materialMedidor) total += materialMedidor.preco * item.quantidade;
            }
        });
        
        // Cabos
        config.cabos.forEach(item => {
            const material = materiais.find(m => m.id === item.materialId);
            if (material) {
                const qtd = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
                total += material.preco * qtd;
            }
        });
        
        // DPS
        if (config.dps) {
            config.dps.items.forEach(item => {
                const material = materiais.find(m => m.id === item.materialId);
                if (material) total += material.preco * item.quantidade;
            });
        }
        
        // Born
        if (config.born) {
            config.born.forEach(item => {
                const material = materiais.find(m => m.id === item.materialId);
                if (material) total += material.preco * item.quantidade;
            });
        }
        
        // Parafusos
        if (config.parafusos) {
            config.parafusos.forEach(item => {
                const material = materiais.find(m => m.id === item.materialId);
                if (material) total += material.preco * item.quantidade;
            });
        }
        
        // Trilhos
        if (config.trilhos) {
            config.trilhos.forEach(item => {
                const material = materiais.find(m => m.id === item.materialId);
                if (material) {
                    const qtd = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
                    total += material.preco * qtd;
                }
            });
        }
        
        // Componentes
        config.componentes.forEach(item => {
            const material = materiais.find(m => m.id === item.materialId);
            if (material) total += material.preco * item.quantidade;
        });
        
        return total;
    }, [config, materiais]);

    const handleAddCaixa = (materialId: string, quantidade: number) => {
        setConfig(prev => ({
            ...prev,
            caixas: [...prev.caixas, { materialId, quantidade }]
        }));
        setSearchTerm('');
    };

    const handleRemoveCaixa = (index: number) => {
        setConfig(prev => ({
            ...prev,
            caixas: prev.caixas.filter((_, i) => i !== index)
        }));
    };

    const handleAddComponente = (materialId: string, quantidade: number) => {
        setConfig(prev => ({
            ...prev,
            componentes: [...prev.componentes, { materialId, quantidade }]
        }));
        setSearchTerm('');
    };

    const handleRemoveComponente = (index: number) => {
        setConfig(prev => ({
            ...prev,
            componentes: prev.componentes.filter((_, i) => i !== index)
        }));
    };

    // BLOCO 2: Handlers para seleção de caixa de estoque (ALUMINIO/COMANDO)
    const handleSelecionarCaixaEstoque = (caixa: CaixaEstoque) => {
        setCaixaSelecionada(caixa);
        
        // Atualizar config com a caixa selecionada
        setConfig(prev => ({
            ...prev,
            caixas: [{
                materialId: caixa.id,
                quantidade: 1
            }]
        }));
        
        setSearchCaixaTerm('');
        console.log(`✅ Caixa selecionada: ${caixa.descricao}`);
    };

    const handleRemoverCaixaEstoque = () => {
        setCaixaSelecionada(null);
        setConfig(prev => ({
            ...prev,
            caixas: []
        }));
    };

    // Handlers para Etapa 2: Disjuntor Geral
    const handleSetDisjuntorGeral = (materialId: string, quantidade: number) => {
        setConfig(prev => ({
            ...prev,
            disjuntorGeral: { materialId, quantidade }
        }));
        setSearchTerm('');
    };

    const handleSetBarramento = (materialId: string, quantidade: number) => {
        setConfig(prev => ({
            ...prev,
            barramento: { materialId, quantidade }
        }));
        setSearchTerm('');
    };

    // Handlers para Etapa 3: Medição
    const handleAddMedidor = (disjuntorId: string, medidorId: string | undefined, quantidade: number) => {
        setConfig(prev => ({
            ...prev,
            medidores: [...prev.medidores, { disjuntorId, medidorId, quantidade }]
        }));
        setSearchTerm('');
    };

    const handleRemoveMedidor = (index: number) => {
        setConfig(prev => ({
            ...prev,
            medidores: prev.medidores.filter((_, i) => i !== index)
        }));
    };

    // Handlers para Etapa 4: Cabos
    const handleAddCabo = (materialId: string, quantidade: number, unidade: 'METROS' | 'CM') => {
        setConfig(prev => ({
            ...prev,
            cabos: [...prev.cabos, { materialId, quantidade, unidade }]
        }));
        setSearchTerm('');
    };

    const handleRemoveCabo = (index: number) => {
        setConfig(prev => ({
            ...prev,
            cabos: prev.cabos.filter((_, i) => i !== index)
        }));
    };

    // Handlers para Etapa 5: DPS
    const handleAddDPS = (materialId: string, quantidade: number, classe: 'CLASSE_1' | 'CLASSE_2') => {
        setConfig(prev => ({
            ...prev,
            dps: {
                classe,
                items: prev.dps?.items ? [...prev.dps.items, { materialId, quantidade }] : [{ materialId, quantidade }]
            }
        }));
        setSearchTerm('');
    };

    const handleRemoveDPS = (index: number) => {
        setConfig(prev => ({
            ...prev,
            dps: prev.dps ? {
                ...prev.dps,
                items: prev.dps.items.filter((_, i) => i !== index)
            } : undefined
        }));
    };

    // Handlers para Etapa 6: Born/Parafuso
    const handleAddBorn = (materialId: string, quantidade: number) => {
        setConfig(prev => ({
            ...prev,
            born: prev.born ? [...prev.born, { materialId, quantidade }] : [{ materialId, quantidade }]
        }));
        setSearchTerm('');
    };

    const handleRemoveBorn = (index: number) => {
        setConfig(prev => ({
            ...prev,
            born: prev.born?.filter((_, i) => i !== index)
        }));
    };

    const handleAddParafuso = (materialId: string, quantidade: number) => {
        setConfig(prev => ({
            ...prev,
            parafusos: prev.parafusos ? [...prev.parafusos, { materialId, quantidade }] : [{ materialId, quantidade }]
        }));
        setSearchTerm('');
    };

    const handleRemoveParafuso = (index: number) => {
        setConfig(prev => ({
            ...prev,
            parafusos: prev.parafusos?.filter((_, i) => i !== index)
        }));
    };

    // Handlers para Etapa 7: Trilho DIN
    const handleAddTrilho = (materialId: string, quantidade: number, unidade: 'METROS' | 'CM') => {
        setConfig(prev => ({
            ...prev,
            trilhos: prev.trilhos ? [...prev.trilhos, { materialId, quantidade, unidade }] : [{ materialId, quantidade, unidade }]
        }));
        setSearchTerm('');
    };

    const handleRemoveTrilho = (index: number) => {
        setConfig(prev => ({
            ...prev,
            trilhos: prev.trilhos?.filter((_, i) => i !== index)
        }));
    };

    const handleFinalizarQuadro = async () => {
        if (!nomeQuadro.trim()) {
            alert('Por favor, informe o nome do quadro');
            return;
        }

        try {
            setIsSaving(true);
            
            const quadroData = {
                nome: nomeQuadro,
                descricao: descricaoQuadro,
                configuracao: {
                    ...config,
                    tipo: tipoQuadro
                }
            };
            
            const response = await quadrosService.criar(quadroData);
            
            if (response.success) {
                alert('✅ Quadro elétrico criado com sucesso!');
                onSave();
                onClose();
            } else {
                alert(`❌ ${response.error || 'Erro ao criar quadro elétrico'}`);
            }
        } catch (error) {
            console.error('Erro ao criar quadro:', error);
            alert('❌ Erro ao criar quadro elétrico. Verifique o console para mais detalhes.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderEtapaConteudo = () => {
        switch (etapaAtual) {
            case 1:
                // BLOCO 2: Ramificação condicional baseada no tipo de quadro
                if (tipoQuadro === 'POLICARBONATO') {
                    // FLUXO ORIGINAL: Policarbonato (múltiplas caixas)
                    return (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800">Etapa 1: Caixas de Policarbonato</h3>
                            <p className="text-gray-600">Selecione as caixas que farão parte do quadro elétrico</p>
                            
                            {/* Busca de materiais */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar material por nome ou código..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            
                            {/* Lista de materiais filtrados */}
                            {searchTerm && materiaisFiltrados.length > 0 && (
                                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                                    {materiaisFiltrados.slice(0, 10).map(material => (
                                        <div
                                            key={material.id}
                                            className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                            onClick={() => {
                                                const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                                if (qtd && parseFloat(qtd) > 0) {
                                                    handleAddCaixa(material.id, parseFloat(qtd));
                                                }
                                            }}
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">{material.nome}</p>
                                                <p className="text-sm text-gray-600">
                                                    Estoque: {material.estoque} {material.unidadeMedida} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <PlusIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Lista de caixas adicionadas */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Caixas Adicionadas ({config.caixas.length})</h4>
                                {config.caixas.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Nenhuma caixa adicionada</p>
                                ) : (
                                    <div className="space-y-2">
                                        {config.caixas.map((item, index) => {
                                            const material = materiais.find(m => m.id === item.materialId);
                                            return (
                                                <div key={index} className="flex justify-between items-center bg-purple-50 border border-purple-200 p-3 rounded-lg">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{material?.nome || 'Material não encontrado'}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Qtd: {item.quantidade} • Subtotal: R$ {((material?.preco || 0) * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveCaixa(index)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                } else {
                    // NOVO FLUXO: Alumínio ou Comando (caixa única de estoque)
                    return (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Etapa 1: Seleção da Caixa de Estoque
                                </h3>
                                <p className="text-gray-700 mt-1">
                                    Tipo: <span className="font-semibold text-blue-700">{tipoQuadro}</span>
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Selecione uma caixa do estoque para o quadro {tipoQuadro.toLowerCase()}
                                </p>
                            </div>
                            
                            {/* Loading state */}
                            {isLoadingCaixas && (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                    <p className="text-gray-600 mt-3">Carregando caixas disponíveis...</p>
                                </div>
                            )}
                            
                            {/* Caixa já selecionada */}
                            {!isLoadingCaixas && caixaSelecionada && (
                                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">✅</span>
                                                <h4 className="text-lg font-bold text-green-900">Caixa Selecionada</h4>
                                            </div>
                                            <p className="font-semibold text-gray-900">{caixaSelecionada.descricao}</p>
                                            <p className="text-sm text-gray-700 mt-1">
                                                <span className="font-medium">Código:</span> {caixaSelecionada.codigo}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Estoque:</span> {caixaSelecionada.estoque} {caixaSelecionada.unidadeMedida}
                                            </p>
                                            <p className="text-lg font-bold text-green-700 mt-2">
                                                R$ {caixaSelecionada.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleRemoverCaixaEstoque}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Remover seleção"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Busca e seleção de caixa */}
                            {!isLoadingCaixas && !caixaSelecionada && (
                                <>
                                    {/* Campo de busca */}
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar caixa por código ou descrição..."
                                            value={searchCaixaTerm}
                                            onChange={(e) => setSearchCaixaTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    {/* Tabela de caixas disponíveis */}
                                    {caixasFiltradas.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-gray-500">
                                                {caixasDisponiveis.length === 0 
                                                    ? 'Nenhuma caixa disponível em estoque para este tipo'
                                                    : 'Nenhuma caixa encontrada com o termo de busca'
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="max-h-96 overflow-y-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-100 sticky top-0">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
                                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estoque</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Preço</th>
                                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ação</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {caixasFiltradas.map((caixa) => (
                                                            <tr 
                                                                key={caixa.id}
                                                                className="border-t border-gray-100 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{caixa.codigo}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">{caixa.descricao}</td>
                                                                <td className="px-4 py-3 text-sm text-center">
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                        caixa.estoque > 5 ? 'bg-green-100 text-green-800' :
                                                                        caixa.estoque > 2 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {caixa.estoque} {caixa.unidadeMedida}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                                                    R$ {caixa.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => handleSelecionarCaixaEstoque(caixa)}
                                                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                                    >
                                                                        Selecionar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Info adicional */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-semibold">💡 Dica:</span> Para quadros tipo {tipoQuadro}, selecione apenas UMA caixa do estoque.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                }
            
            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Etapa 2: Disjuntor Geral e Barramento</h3>
                        <p className="text-gray-600">Selecione o disjuntor geral e barramento (opcional)</p>
                        
                        {/* Seção: Disjuntor Geral */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-3">Disjuntor Geral</h4>
                            
                            {config.disjuntorGeral ? (
                                <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {materiais.find(m => m.id === config.disjuntorGeral?.materialId)?.nome || 'Material não encontrado'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Qtd: {config.disjuntorGeral.quantidade} • Subtotal: R$ {((materiais.find(m => m.id === config.disjuntorGeral?.materialId)?.preco || 0) * config.disjuntorGeral.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setConfig(prev => ({ ...prev, disjuntorGeral: undefined }))}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-3">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar disjuntor geral..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    
                                    {searchTerm && materiaisFiltrados.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                                            {materiaisFiltrados.slice(0, 10).map(material => (
                                                <div
                                                    key={material.id}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                                    onClick={() => {
                                                        const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                                        if (qtd && parseFloat(qtd) > 0) {
                                                            handleSetDisjuntorGeral(material.id, parseFloat(qtd));
                                                        }
                                                    }}
                                                >
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{material.nome}</p>
                                                        <p className="text-xs text-gray-600">
                                                            Estoque: {material.estoque} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <PlusIcon className="w-5 h-5 text-purple-600" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Seção: Barramento (Opcional) */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-3">Barramento <span className="text-sm text-gray-500">(Opcional)</span></h4>
                            
                            {config.barramento ? (
                                <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {materiais.find(m => m.id === config.barramento?.materialId)?.nome || 'Material não encontrado'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Qtd: {config.barramento.quantidade} • Subtotal: R$ {((materiais.find(m => m.id === config.barramento?.materialId)?.preco || 0) * config.barramento.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setConfig(prev => ({ ...prev, barramento: undefined }))}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-3">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar barramento..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    
                                    {searchTerm && materiaisFiltrados.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                                            {materiaisFiltrados.slice(0, 10).map(material => (
                                                <div
                                                    key={material.id}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                                    onClick={() => {
                                                        const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                                        if (qtd && parseFloat(qtd) > 0) {
                                                            handleSetBarramento(material.id, parseFloat(qtd));
                                                        }
                                                    }}
                                                >
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{material.nome}</p>
                                                        <p className="text-xs text-gray-600">
                                                            Estoque: {material.estoque} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <PlusIcon className="w-5 h-5 text-purple-600" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            
            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Etapa 3: Medição/Unidade</h3>
                        <p className="text-gray-600">Adicione disjuntores de medição e medidores (opcional)</p>
                        
                        {/* Busca de materiais */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar disjuntor ou medidor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        {/* Lista de materiais filtrados */}
                        {searchTerm && materiaisFiltrados.length > 0 && (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                                {materiaisFiltrados.slice(0, 10).map(material => (
                                    <div
                                        key={material.id}
                                        className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                        onClick={() => {
                                            const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                            if (qtd && parseFloat(qtd) > 0) {
                                                const temMedidor = window.confirm('Adicionar medidor também?');
                                                const medidorId = temMedidor ? prompt('ID do medidor (opcional):') : undefined;
                                                handleAddMedidor(material.id, medidorId, parseFloat(qtd));
                                            }
                                        }}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{material.nome}</p>
                                            <p className="text-sm text-gray-600">
                                                Estoque: {material.estoque} {material.unidadeMedida} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <PlusIcon className="w-5 h-5 text-purple-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Lista de medidores adicionados */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Medições Adicionadas ({config.medidores.length})</h4>
                            {config.medidores.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Nenhuma medição adicionada</p>
                            ) : (
                                <div className="space-y-2">
                                    {config.medidores.map((item, index) => {
                                        const material = materiais.find(m => m.id === item.disjuntorId);
                                        return (
                                            <div key={index} className="flex justify-between items-center bg-orange-50 border border-orange-200 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{material?.nome || 'Material não encontrado'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Qtd: {item.quantidade}{item.medidorId ? ` • Medidor: ${item.medidorId}` : ''} • Subtotal: R$ {((material?.preco || 0) * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMedidor(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            
            case 4:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Etapa 4: Cabos</h3>
                        <p className="text-gray-600">Adicione os cabos necessários para o quadro</p>
                        
                        {/* Busca de materiais */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cabo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        {/* Lista de materiais filtrados */}
                        {searchTerm && materiaisFiltrados.length > 0 && (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                                {materiaisFiltrados.slice(0, 10).map(material => (
                                    <div
                                        key={material.id}
                                        className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                        onClick={() => {
                                            const unidade = window.confirm('Metros? (Cancelar = Centímetros)') ? 'METROS' : 'CM';
                                            const qtd = prompt(`Quantidade em ${unidade}?`, unidade === 'METROS' ? '1' : '100');
                                            if (qtd && parseFloat(qtd) > 0) {
                                                handleAddCabo(material.id, parseFloat(qtd), unidade);
                                            }
                                        }}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{material.nome}</p>
                                            <p className="text-sm text-gray-600">
                                                Estoque: {material.estoque} {material.unidadeMedida} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m
                                            </p>
                                        </div>
                                        <PlusIcon className="w-5 h-5 text-purple-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Lista de cabos adicionados */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Cabos Adicionados ({config.cabos.length})</h4>
                            {config.cabos.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Nenhum cabo adicionado</p>
                            ) : (
                                <div className="space-y-2">
                                    {config.cabos.map((item, index) => {
                                        const material = materiais.find(m => m.id === item.materialId);
                                        const qtdMetros = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
                                        return (
                                            <div key={index} className="flex justify-between items-center bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{material?.nome || 'Material não encontrado'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantidade} {item.unidade} ({qtdMetros}m) • Subtotal: R$ {((material?.preco || 0) * qtdMetros).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveCabo(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            
            case 5:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Etapa 5: DPS (Dispositivo de Proteção contra Surtos)</h3>
                        <p className="text-gray-600">Adicione DPS conforme necessário</p>
                        
                        {/* Seleção de Classe */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Classe do DPS</label>
                            <select
                                value={config.dps?.classe || 'CLASSE_1'}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    dps: { classe: e.target.value as any, items: prev.dps?.items || [] }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="CLASSE_1">Classe 1 (Proteção Primária)</option>
                                <option value="CLASSE_2">Classe 2 (Proteção Secundária)</option>
                            </select>
                        </div>
                        
                        {/* Busca de materiais */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar DPS..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        {/* Lista de materiais filtrados */}
                        {searchTerm && materiaisFiltrados.length > 0 && (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                                {materiaisFiltrados.slice(0, 10).map(material => (
                                    <div
                                        key={material.id}
                                        className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                        onClick={() => {
                                            const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                            if (qtd && parseFloat(qtd) > 0) {
                                                handleAddDPS(material.id, parseFloat(qtd), config.dps?.classe || 'CLASSE_1');
                                            }
                                        }}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{material.nome}</p>
                                            <p className="text-sm text-gray-600">
                                                Estoque: {material.estoque} {material.unidadeMedida} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <PlusIcon className="w-5 h-5 text-purple-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Lista de DPS adicionados */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">DPS Adicionados ({config.dps?.items.length || 0})</h4>
                            {!config.dps || config.dps.items.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Nenhum DPS adicionado</p>
                            ) : (
                                <div className="space-y-2">
                                    {config.dps.items.map((item, index) => {
                                        const material = materiais.find(m => m.id === item.materialId);
                                        return (
                                            <div key={index} className="flex justify-between items-center bg-red-50 border border-red-200 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{material?.nome || 'Material não encontrado'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Qtd: {item.quantidade} • Subtotal: R$ {((material?.preco || 0) * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveDPS(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            
            case 6:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Etapa 6: Bornes e Parafusos</h3>
                        <p className="text-gray-600">Adicione bornes e parafusos necessários</p>
                        
                        {/* Seção: Bornes */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-3">Bornes</h4>
                            <div className="relative mb-3">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar borne..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            
                            {searchTerm && materiaisFiltrados.length > 0 && (
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl mb-3">
                                    {materiaisFiltrados.slice(0, 10).map(material => (
                                        <div
                                            key={material.id}
                                            className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                            onClick={() => {
                                                const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                                if (qtd && parseFloat(qtd) > 0) {
                                                    handleAddBorn(material.id, parseFloat(qtd));
                                                }
                                            }}
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{material.nome}</p>
                                                <p className="text-xs text-gray-600">
                                                    Estoque: {material.estoque} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <PlusIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Bornes Adicionados ({config.born?.length || 0})</h5>
                                {!config.born || config.born.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-2">Nenhum borne adicionado</p>
                                ) : (
                                    <div className="space-y-2">
                                        {config.born.map((item, index) => {
                                            const material = materiais.find(m => m.id === item.materialId);
                                            return (
                                                <div key={index} className="flex justify-between items-center bg-green-50 border border-green-200 p-2 rounded-lg">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{material?.nome || 'Material não encontrado'}</p>
                                                        <p className="text-xs text-gray-600">
                                                            Qtd: {item.quantidade} • R$ {((material?.preco || 0) * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleRemoveBorn(index)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seção: Parafusos */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-3">Parafusos</h4>
                            <div className="relative mb-3">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar parafuso..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            
                            {searchTerm && materiaisFiltrados.length > 0 && (
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl mb-3">
                                    {materiaisFiltrados.slice(0, 10).map(material => (
                                        <div
                                            key={material.id}
                                            className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                            onClick={() => {
                                                const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                                if (qtd && parseFloat(qtd) > 0) {
                                                    handleAddParafuso(material.id, parseFloat(qtd));
                                                }
                                            }}
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{material.nome}</p>
                                                <p className="text-xs text-gray-600">
                                                    Estoque: {material.estoque} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <PlusIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Parafusos Adicionados ({config.parafusos?.length || 0})</h5>
                                {!config.parafusos || config.parafusos.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-2">Nenhum parafuso adicionado</p>
                                ) : (
                                    <div className="space-y-2">
                                        {config.parafusos.map((item, index) => {
                                            const material = materiais.find(m => m.id === item.materialId);
                                            return (
                                                <div key={index} className="flex justify-between items-center bg-blue-50 border border-blue-200 p-2 rounded-lg">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{material?.nome || 'Material não encontrado'}</p>
                                                        <p className="text-xs text-gray-600">
                                                            Qtd: {item.quantidade} • R$ {((material?.preco || 0) * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleRemoveParafuso(index)} className="p-1 text-red-600 hover:bg-red-100 rounded-lg">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            
            case 7:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Etapa 7: Trilho DIN</h3>
                        <p className="text-gray-600">Adicione trilhos DIN necessários</p>
                        
                        {/* Busca de materiais */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar trilho DIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        {/* Lista de materiais filtrados */}
                        {searchTerm && materiaisFiltrados.length > 0 && (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                                {materiaisFiltrados.slice(0, 10).map(material => (
                                    <div
                                        key={material.id}
                                        className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                        onClick={() => {
                                            const unidade = window.confirm('Metros? (Cancelar = Centímetros)') ? 'METROS' : 'CM';
                                            const qtd = prompt(`Quantidade em ${unidade}?`, unidade === 'METROS' ? '1' : '100');
                                            if (qtd && parseFloat(qtd) > 0) {
                                                handleAddTrilho(material.id, parseFloat(qtd), unidade);
                                            }
                                        }}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{material.nome}</p>
                                            <p className="text-sm text-gray-600">
                                                Estoque: {material.estoque} {material.unidadeMedida} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m
                                            </p>
                                        </div>
                                        <PlusIcon className="w-5 h-5 text-purple-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Lista de trilhos adicionados */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Trilhos Adicionados ({config.trilhos?.length || 0})</h4>
                            {!config.trilhos || config.trilhos.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Nenhum trilho adicionado</p>
                            ) : (
                                <div className="space-y-2">
                                    {config.trilhos.map((item, index) => {
                                        const material = materiais.find(m => m.id === item.materialId);
                                        const qtdMetros = item.unidade === 'CM' ? item.quantidade / 100 : item.quantidade;
                                        return (
                                            <div key={index} className="flex justify-between items-center bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{material?.nome || 'Material não encontrado'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantidade} {item.unidade} ({qtdMetros}m) • Subtotal: R$ {((material?.preco || 0) * qtdMetros).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveTrilho(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            
            case 8:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">Etapa 8: Componentes Finais</h3>
                        <p className="text-gray-600">Adicione isoladores, terminais e outros componentes finais</p>
                        
                        {/* Busca de materiais */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar componente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        {/* Lista de materiais filtrados */}
                        {searchTerm && materiaisFiltrados.length > 0 && (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                                {materiaisFiltrados.slice(0, 10).map(material => (
                                    <div
                                        key={material.id}
                                        className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                        onClick={() => {
                                            const qtd = prompt(`Quantidade de "${material.nome}"?`, '1');
                                            if (qtd && parseFloat(qtd) > 0) {
                                                handleAddComponente(material.id, parseFloat(qtd));
                                            }
                                        }}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{material.nome}</p>
                                            <p className="text-sm text-gray-600">
                                                Estoque: {material.estoque} {material.unidadeMedida} • R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <PlusIcon className="w-5 h-5 text-purple-600" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Lista de componentes adicionados */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Componentes Adicionados ({config.componentes.length})</h4>
                            {config.componentes.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Nenhum componente adicionado</p>
                            ) : (
                                <div className="space-y-2">
                                    {config.componentes.map((item, index) => {
                                        const material = materiais.find(m => m.id === item.materialId);
                                        return (
                                            <div key={index} className="flex justify-between items-center bg-purple-50 border border-purple-200 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{material?.nome || 'Material não encontrado'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Qtd: {item.quantidade} • Subtotal: R$ {((material?.preco || 0) * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveComponente(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🚧</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {ETAPAS[etapaAtual - 1]?.nome}
                        </h3>
                        <p className="text-gray-600 mb-4">Esta etapa está em desenvolvimento</p>
                        <p className="text-sm text-gray-500">
                            Por enquanto, você pode pular para a próxima etapa ou finalizar usando apenas as etapas disponíveis
                        </p>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Criar Quadro Elétrico Modular</h2>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Configure seu quadro elétrico personalizado</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Informações básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1">Nome do Quadro *</label>
                            <input
                                type="text"
                                value={nomeQuadro}
                                onChange={(e) => setNomeQuadro(e.target.value)}
                                className="input-field"
                                placeholder="Ex: Quadro Medidor 3 Fases"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1">Tipo</label>
                            <select
                                value={tipoQuadro}
                                onChange={(e) => setTipoQuadro(e.target.value as any)}
                                className="select-field"
                            >
                                <option value="POLICARBONATO">Policarbonato</option>
                                <option value="ALUMINIO">Alumínio</option>
                                <option value="COMANDO">Comando</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1">Descrição</label>
                            <input
                                type="text"
                                value={descricaoQuadro}
                                onChange={(e) => setDescricaoQuadro(e.target.value)}
                                className="input-field"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="flex gap-2 mt-4">
                        {ETAPAS.map((etapa) => (
                            <div
                                key={etapa.id}
                                className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                                    etapa.id <= etapaAtual ? 'bg-purple-600' : 'bg-gray-200'
                                } hover:opacity-80`}
                                onClick={() => setEtapaAtual(etapa.id)}
                                title={etapa.nome}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Body - Conteúdo da etapa */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando materiais...</p>
                        </div>
                    ) : (
                        renderEtapaConteudo()
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Valor Total Estimado</p>
                            <p className="text-3xl font-bold text-purple-700">
                                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {etapaAtual > 1 && (
                                <button
                                    onClick={() => setEtapaAtual(e => e - 1)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                                >
                                    ← Voltar
                                </button>
                            )}
                            {etapaAtual < 8 ? (
                                <button
                                    onClick={() => {
                                        // BLOCO 2: Validação condicional da Etapa 1
                                        if (etapaAtual === 1) {
                                            if (tipoQuadro === 'POLICARBONATO') {
                                                // POLICARBONATO: Verifica se tem caixas adicionadas
                                                if (config.caixas.length === 0) {
                                                    alert('⚠️ Por favor, adicione pelo menos uma caixa antes de prosseguir.');
                                                    return;
                                                }
                                            } else if (tipoQuadro === 'ALUMINIO' || tipoQuadro === 'COMANDO') {
                                                // ALUMINIO/COMANDO: Verifica se selecionou uma caixa de estoque
                                                if (!caixaSelecionada) {
                                                    alert('⚠️ Por favor, selecione uma caixa de estoque antes de prosseguir.');
                                                    return;
                                                }
                                            }
                                        }
                                        setEtapaAtual(e => e + 1);
                                    }}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold"
                                >
                                    Próxima Etapa →
                                </button>
                            ) : (
                                <button
                                    onClick={handleFinalizarQuadro}
                                    disabled={isSaving || !nomeQuadro.trim()}
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Salvando...' : '✓ Criar Quadro'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriacaoQuadroModular;

