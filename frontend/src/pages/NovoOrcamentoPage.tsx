import React, { useState, useEffect, useMemo } from 'react';
import { orcamentosService, type CreateOrcamentoData } from '../services/orcamentosService';
import { clientesService } from '../services/clientesService';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';
import EditorDescricaoAvancada from '../components/EditorDescricaoAvancada';

// ==================== ICONS ====================
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

// Types
interface Cliente {
    id: string;
    nome: string;
    cpfCnpj: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    ativo: boolean;
}

interface Material {
    id: string;
    nome: string;
    sku: string;
    unidadeMedida: string;
    preco: number;
    estoque: number;
    categoria: string;
    ativo: boolean;
}

interface OrcamentoItem {
    id?: string;
    tipo: 'MATERIAL' | 'KIT' | 'SERVICO' | 'QUADRO_PRONTO' | 'CUSTO_EXTRA';
    materialId?: string;
    kitId?: string;
    servicoNome?: string;
    descricao?: string;
    nome: string;
    unidadeMedida: string;
    quantidade: number;
    custoUnit: number;
    precoUnit: number;
    subtotal: number;
}

interface Foto {
    id?: string;
    url: string;
    legenda: string;
    ordem: number;
    preview?: string;
}

interface NovoOrcamentoPageProps {
    setAbaAtiva: (aba: 'listagem' | 'novo') => void;
    onOrcamentoCriado?: () => void;
}

const NovoOrcamentoPage: React.FC<NovoOrcamentoPageProps> = ({ setAbaAtiva, onOrcamentoCriado }) => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formState, setFormState] = useState({
        clienteId: '',
        titulo: '',
        descricao: '',
        descricaoProjeto: '',
        validade: '',
        bdi: 20,
        observacoes: '',
        empresaCNPJ: '',
        enderecoObra: '',
        cidade: '',
        bairro: '',
        cep: '',
        responsavelObra: '',
        previsaoInicio: '',
        previsaoTermino: '',
        descontoValor: 0,
        impostoPercentual: 0,
        condicaoPagamento: 'À Vista'
    });

    const [items, setItems] = useState<OrcamentoItem[]>([]);
    const [fotos, setFotos] = useState<Foto[]>([]);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showEditorAvancado, setShowEditorAvancado] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    
    // Estado para item manual
    const [modoAdicao, setModoAdicao] = useState<'estoque' | 'manual'>('estoque');
    const [novoItemManual, setNovoItemManual] = useState({
        nome: '',
        descricao: '',
        unidadeMedida: 'UN',
        quantidade: 1,
        custoUnit: 0,
        tipo: 'MATERIAL' as const
    });

    // Carregar dados iniciais
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [clientesRes, materiaisRes] = await Promise.all([
                clientesService.listar(),
                axiosApiService.get<Material[]>(ENDPOINTS.MATERIAIS)
            ]);

            if (clientesRes.success && clientesRes.data) {
                setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : []);
            }

            if (materiaisRes.success && materiaisRes.data) {
                setMateriais(Array.isArray(materiaisRes.data) ? materiaisRes.data : []);
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar dados iniciais');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar materiais para seleção
    const filteredMaterials = useMemo(() => {
        return materiais
            .filter(material => material.ativo && material.estoque > 0)
            .filter(material =>
                material.nome.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                material.sku.toLowerCase().includes(itemSearchTerm.toLowerCase())
            );
    }, [materiais, itemSearchTerm]);

    // Calcular totais do orçamento
    const calculosOrcamento = useMemo(() => {
        const subtotalItens = items.reduce((sum, item) => sum + item.subtotal, 0);
        const valorComDesconto = subtotalItens - formState.descontoValor;
        const valorTotalFinal = valorComDesconto * (1 + formState.impostoPercentual / 100);

        return { subtotalItens, valorComDesconto, valorTotalFinal };
    }, [items, formState.descontoValor, formState.impostoPercentual]);

    // Adicionar item do estoque ao orçamento
    const handleAddItem = (material: Material) => {
        const newItem: OrcamentoItem = {
            tipo: 'MATERIAL',
            materialId: material.id,
            nome: material.nome,
            unidadeMedida: material.unidadeMedida,
            quantidade: 1,
            custoUnit: material.preco,
            precoUnit: material.preco * (1 + formState.bdi / 100),
            subtotal: material.preco * (1 + formState.bdi / 100)
        };

        setItems(prev => [...prev, newItem]);
        setShowItemModal(false);
        setItemSearchTerm('');
    };

    // Adicionar item manual (sem estoque)
    const handleAddItemManual = () => {
        // Validação
        if (!novoItemManual.nome.trim()) {
            alert('⚠️ Digite o nome do item');
            return;
        }
        if (novoItemManual.custoUnit <= 0) {
            alert('⚠️ Digite um custo unitário válido');
            return;
        }
        if (novoItemManual.quantidade <= 0) {
            alert('⚠️ Digite uma quantidade válida');
            return;
        }

        const precoUnit = novoItemManual.custoUnit * (1 + formState.bdi / 100);
        const newItem: OrcamentoItem = {
            tipo: novoItemManual.tipo,
            nome: novoItemManual.nome,
            descricao: novoItemManual.descricao,
            unidadeMedida: novoItemManual.unidadeMedida,
            quantidade: novoItemManual.quantidade,
            custoUnit: novoItemManual.custoUnit,
            precoUnit: precoUnit,
            subtotal: precoUnit * novoItemManual.quantidade
        };

        setItems(prev => [...prev, newItem]);
        
        // Resetar formulário
        setNovoItemManual({
            nome: '',
            descricao: '',
            unidadeMedida: 'UN',
            quantidade: 1,
            custoUnit: 0,
            tipo: 'MATERIAL'
        });
        
        setShowItemModal(false);
        alert('✅ Item adicionado com sucesso!');
    };

    // Remover item
    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Atualizar quantidade do item
    const handleUpdateItemQuantity = (index: number, quantidade: number) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                const precoUnit = item.custoUnit * (1 + formState.bdi / 100);
                return {
                    ...item,
                    quantidade,
                    precoUnit,
                    subtotal: precoUnit * quantidade
                };
            }
            return item;
        }));
    };

    // Atualizar BDI e recalcular preços
    const handleBdiChange = (newBdi: number) => {
        setFormState(prev => ({ ...prev, bdi: newBdi }));

        setItems(prev => prev.map(item => {
            const precoUnit = item.custoUnit * (1 + newBdi / 100);
            return {
                ...item,
                precoUnit,
                subtotal: precoUnit * item.quantidade
            };
        }));
    };

    // Salvar orçamento
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (items.length === 0) {
            setError('Adicione pelo menos um item ao orçamento');
            return;
        }

        try {
            setSalvando(true);

            const orcamentoData: any = {
                clienteId: formState.clienteId,
                titulo: formState.titulo,
                descricao: formState.descricao,
                descricaoProjeto: formState.descricaoProjeto,
                validade: formState.validade,
                bdi: formState.bdi,
                observacoes: formState.observacoes,
                empresaCNPJ: formState.empresaCNPJ,
                enderecoObra: formState.enderecoObra,
                cidade: formState.cidade,
                bairro: formState.bairro,
                cep: formState.cep,
                responsavelObra: formState.responsavelObra,
                previsaoInicio: formState.previsaoInicio || null,
                previsaoTermino: formState.previsaoTermino || null,
                descontoValor: formState.descontoValor,
                impostoPercentual: formState.impostoPercentual,
                condicaoPagamento: formState.condicaoPagamento,
                items: items.map(item => ({
                    tipo: item.tipo,
                    materialId: item.materialId,
                    kitId: item.kitId,
                    servicoNome: item.servicoNome,
                    descricao: item.descricao || item.nome,
                    quantidade: item.quantidade,
                    custoUnit: item.custoUnit,
                    precoUnitario: item.precoUnit,
                    subtotal: item.subtotal
                }))
            };

            const response = await orcamentosService.criar(orcamentoData);

            if (response.success || response.statusCode === 201) {
                alert('✅ Orçamento criado com sucesso!');
                if (onOrcamentoCriado) onOrcamentoCriado();
                setAbaAtiva('listagem');
            } else {
                setError(response.error || 'Erro ao criar orçamento');
            }
        } catch (err: any) {
            console.error('Erro ao criar orçamento:', err);
            setError(err.response?.data?.message || 'Erro ao criar orçamento');
        } finally {
            setSalvando(false);
        }
    };

    // Cancelar e voltar
    const handleCancelar = () => {
        if (items.length > 0 || formState.titulo) {
            if (confirm('Tem certeza? Todos os dados não salvos serão perdidos.')) {
                setAbaAtiva('listagem');
            }
        } else {
            setAbaAtiva('listagem');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-dark-text-secondary">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-dark-bg">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleCancelar}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Voltar
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-dark-text tracking-tight">
                            Novo Orçamento
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-dark-text-secondary mt-1">
                            Crie uma nova proposta comercial
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                        <p className="text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}
            </header>

            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
                {/* SEÇÃO 1: Informações Básicas */}
                <div className="card-primary">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">📋</span>
                        Informações Básicas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                CNPJ da Empresa Executora
                            </label>
                            <input
                                type="text"
                                value={formState.empresaCNPJ}
                                onChange={(e) => setFormState(prev => ({ ...prev, empresaCNPJ: e.target.value }))}
                                className="input-field"
                                placeholder="Selecione o CNPJ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Cliente
                            </label>
                            <select
                                value={formState.clienteId}
                                onChange={(e) => setFormState(prev => ({ ...prev, clienteId: e.target.value }))}
                                className="select-field"
                            >
                                <option value="">Selecione um cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome} - {cliente.cpfCnpj}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Título do Projeto
                            </label>
                            <input
                                type="text"
                                value={formState.titulo}
                                onChange={(e) => setFormState(prev => ({ ...prev, titulo: e.target.value }))}
                                className="input-field"
                                placeholder="Ex: Instalação Elétrica - Edifício Comercial"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Validade do Orçamento
                            </label>
                            <input
                                type="date"
                                value={formState.validade}
                                onChange={(e) => setFormState(prev => ({ ...prev, validade: e.target.value }))}
                                className="input-field"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Endereço da Obra (Rua e Número)
                            </label>
                            <input
                                type="text"
                                value={formState.enderecoObra}
                                onChange={(e) => setFormState(prev => ({ ...prev, enderecoObra: e.target.value }))}
                                className="input-field"
                                placeholder="Ex: Rua das Flores, 123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Bairro
                            </label>
                            <input
                                type="text"
                                value={formState.bairro}
                                onChange={(e) => setFormState(prev => ({ ...prev, bairro: e.target.value }))}
                                className="input-field"
                                placeholder="Ex: Centro"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Cidade
                            </label>
                            <input
                                type="text"
                                value={formState.cidade}
                                onChange={(e) => setFormState(prev => ({ ...prev, cidade: e.target.value }))}
                                className="input-field"
                                placeholder="Ex: Florianópolis"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                CEP
                            </label>
                            <input
                                type="text"
                                value={formState.cep}
                                onChange={(e) => setFormState(prev => ({ ...prev, cep: e.target.value }))}
                                className="input-field"
                                placeholder="00000-000"
                                maxLength={9}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Responsável no Local
                            </label>
                            <input
                                type="text"
                                value={formState.responsavelObra}
                                onChange={(e) => setFormState(prev => ({ ...prev, responsavelObra: e.target.value }))}
                                className="input-field"
                                placeholder="Nome do responsável técnico"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                BDI - Margem (%)
                            </label>
                            <input
                                type="number"
                                value={formState.bdi}
                                onChange={(e) => handleBdiChange(Number(e.target.value))}
                                min="0"
                                max="100"
                                className="input-field"
                                placeholder="20"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Descrição Resumida
                            </label>
                            <textarea
                                value={formState.descricao}
                                onChange={(e) => setFormState(prev => ({ ...prev, descricao: e.target.value }))}
                                rows={2}
                                className="textarea-field"
                                placeholder="Resumo breve do projeto..."
                            />
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 2: Prazos e Cronograma */}
                <div className="card-primary">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">📅</span>
                        Prazos e Cronograma
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Previsão de Início
                            </label>
                            <input
                                type="date"
                                value={formState.previsaoInicio}
                                onChange={(e) => setFormState(prev => ({ ...prev, previsaoInicio: e.target.value }))}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Previsão de Término
                            </label>
                            <input
                                type="date"
                                value={formState.previsaoTermino}
                                onChange={(e) => setFormState(prev => ({ ...prev, previsaoTermino: e.target.value }))}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 3: Itens do Orçamento */}
                <div className="card-primary">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Itens do Orçamento</h3>
                        <button
                            type="button"
                            onClick={() => setShowItemModal(true)}
                            className="btn-info flex items-center gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Adicionar Item
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📦</span>
                            </div>
                            <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Nenhum item adicionado</p>
                            <p className="text-gray-400 dark:text-dark-text-secondary text-sm mt-1">Clique em "Adicionar Item" para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-dark-border p-4 rounded-xl">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-dark-text">{item.nome}</p>
                                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{item.unidadeMedida}</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Quantidade</label>
                                            <input
                                                type="number"
                                                value={item.quantidade}
                                                onChange={(e) => handleUpdateItemQuantity(index, Number(e.target.value))}
                                                min="1"
                                                step="0.01"
                                                className="input-field text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Valor Unit.</label>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">
                                                R$ {item.precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">Subtotal</label>
                                            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                                R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="btn-action-delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SEÇÃO 4: Cálculo Financeiro */}
                <div className="card-primary">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">💰</span>
                        Cálculo Financeiro
                    </h3>
                    <div className="space-y-4">
                        {/* Subtotal */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Subtotal (com BDI {formState.bdi}%)</span>
                                <span className="text-xl font-bold text-blue-900 dark:text-blue-200">
                                    R$ {calculosOrcamento.subtotalItens.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Desconto e Impostos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                    Desconto (R$)
                                </label>
                                <input
                                    type="number"
                                    value={formState.descontoValor}
                                    onChange={(e) => setFormState(prev => ({ ...prev, descontoValor: parseFloat(e.target.value) || 0 }))}
                                    min="0"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0,00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                    Impostos (%)
                                </label>
                                <input
                                    type="number"
                                    value={formState.impostoPercentual}
                                    onChange={(e) => setFormState(prev => ({ ...prev, impostoPercentual: parseFloat(e.target.value) || 0 }))}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                    Condição de Pagamento
                                </label>
                                <select
                                    value={formState.condicaoPagamento}
                                    onChange={(e) => setFormState(prev => ({ ...prev, condicaoPagamento: e.target.value }))}
                                    className="select-field"
                                >
                                    <option>À Vista</option>
                                    <option>30 dias</option>
                                    <option>60 dias</option>
                                    <option>90 dias</option>
                                    <option>Parcelado</option>
                                </select>
                            </div>
                        </div>

                        {/* TOTAL FINAL */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-300 dark:border-purple-700 p-6 rounded-xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-lg font-semibold text-purple-700 dark:text-purple-300 uppercase">Valor Total Final</span>
                                    <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-1">
                                        Subtotal - Desconto + Impostos
                                    </p>
                                </div>
                                <span className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                                    R$ {calculosOrcamento.valorTotalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 5: Descrição Técnica */}
                <div className="card-primary">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">📝</span>
                        Descrição Técnica e Documentação
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowEditorAvancado(true)}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        ABRIR EDITOR AVANÇADO DE DESCRIÇÃO E FOTOS
                    </button>

                    <div className="mt-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                            Observações Gerais
                        </label>
                        <textarea
                            value={formState.observacoes}
                            onChange={(e) => setFormState(prev => ({ ...prev, observacoes: e.target.value }))}
                            rows={4}
                            className="textarea-field"
                            placeholder="Informações adicionais sobre o orçamento..."
                        />
                    </div>
                </div>

                {/* Botões de Ação Fixos no Footer */}
                <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border shadow-lg p-6 rounded-t-2xl">
                    <div className="max-w-6xl mx-auto flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleCancelar}
                            className="btn-secondary"
                            disabled={salvando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary disabled:opacity-50"
                            disabled={salvando}
                        >
                            {salvando ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="w-5 h-5 inline mr-2" />
                                    Criar Orçamento
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Modal de Adicionar Item - Com Abas */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header com Abas */}
                        <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-indigo-600 to-purple-600">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Adicionar Item ao Orçamento</h3>
                                    <p className="text-sm text-white/80 mt-1">Escolha como deseja adicionar o item</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowItemModal(false);
                                        setItemSearchTerm('');
                                        setModoAdicao('estoque');
                                    }}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Abas */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModoAdicao('estoque')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        modoAdicao === 'estoque'
                                            ? 'bg-white text-indigo-700'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    📦 Do Estoque
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModoAdicao('manual')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        modoAdicao === 'manual'
                                            ? 'bg-white text-indigo-700'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    ✏️ Criar Manualmente
                                </button>
                            </div>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Modo: Importar do Estoque */}
                            {modoAdicao === 'estoque' && (
                                <div>
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            value={itemSearchTerm}
                                            onChange={(e) => setItemSearchTerm(e.target.value)}
                                            className="input-field"
                                            placeholder="🔍 Buscar material por nome ou SKU..."
                                        />
                                    </div>

                                    {filteredMaterials.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl">📦</span>
                                            </div>
                                            <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Nenhum material encontrado</p>
                                            <p className="text-gray-400 dark:text-dark-text-secondary text-sm mt-1">Tente ajustar a busca ou criar manualmente</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {filteredMaterials.map(material => (
                                                <button
                                                    key={material.id}
                                                    type="button"
                                                    onClick={() => handleAddItem(material)}
                                                    className="w-full text-left p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-dark-border rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                                                >
                                                    <p className="font-semibold text-gray-900 dark:text-dark-text">{material.nome}</p>
                                                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                                        SKU: {material.sku} • Estoque: {material.estoque} {material.unidadeMedida} • Custo: R$ {material.preco.toFixed(2)}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Modo: Criar Manualmente */}
                            {modoAdicao === 'manual' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            💡 <strong>Dica:</strong> Use esta opção para adicionar materiais/serviços que ainda não foram comprados.
                                            Ideal para orçamentos baseados em cotações de fornecedores.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                Tipo de Item
                                            </label>
                                            <select
                                                value={novoItemManual.tipo}
                                                onChange={(e) => setNovoItemManual(prev => ({ ...prev, tipo: e.target.value as any }))}
                                                className="select-field"
                                            >
                                                <option value="MATERIAL">Material</option>
                                                <option value="SERVICO">Serviço</option>
                                                <option value="KIT">Kit</option>
                                                <option value="CUSTO_EXTRA">Custo Extra</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                Nome/Descrição do Item
                                            </label>
                                            <input
                                                type="text"
                                                value={novoItemManual.nome}
                                                onChange={(e) => setNovoItemManual(prev => ({ ...prev, nome: e.target.value }))}
                                                className="input-field"
                                                placeholder="Ex: Disjuntor 32A Tripolar, Instalação de Quadro, etc."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                Descrição Técnica (Opcional)
                                            </label>
                                            <textarea
                                                value={novoItemManual.descricao}
                                                onChange={(e) => setNovoItemManual(prev => ({ ...prev, descricao: e.target.value }))}
                                                rows={2}
                                                className="textarea-field"
                                                placeholder="Detalhes técnicos, especificações, normas..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                Unidade de Medida
                                            </label>
                                            <select
                                                value={novoItemManual.unidadeMedida}
                                                onChange={(e) => setNovoItemManual(prev => ({ ...prev, unidadeMedida: e.target.value }))}
                                                className="select-field"
                                            >
                                                <option value="UN">Unidade (UN)</option>
                                                <option value="M">Metro (M)</option>
                                                <option value="M²">Metro Quadrado (M²)</option>
                                                <option value="M³">Metro Cúbico (M³)</option>
                                                <option value="KG">Quilograma (KG)</option>
                                                <option value="L">Litro (L)</option>
                                                <option value="CX">Caixa (CX)</option>
                                                <option value="PC">Peça (PC)</option>
                                                <option value="SERV">Serviço (SERV)</option>
                                                <option value="HR">Hora (HR)</option>
                                                <option value="VERBA">Verba (VERBA)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                Quantidade
                                            </label>
                                            <input
                                                type="number"
                                                value={novoItemManual.quantidade}
                                                onChange={(e) => setNovoItemManual(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                                                min="0.01"
                                                step="0.01"
                                                className="input-field"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                                Custo Unitário (R$)
                                            </label>
                                            <input
                                                type="number"
                                                value={novoItemManual.custoUnit}
                                                onChange={(e) => setNovoItemManual(prev => ({ ...prev, custoUnit: parseFloat(e.target.value) || 0 }))}
                                                min="0"
                                                step="0.01"
                                                className="input-field"
                                                placeholder="0,00"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
                                                💡 Digite o custo real do material/serviço (sem BDI). O preço de venda será calculado automaticamente com a margem de {formState.bdi}%.
                                            </p>
                                        </div>

                                        {/* Preview do Cálculo */}
                                        {novoItemManual.custoUnit > 0 && novoItemManual.quantidade > 0 && (
                                            <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600 dark:text-dark-text-secondary mb-1">Custo Total</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-dark-text">
                                                            R$ {(novoItemManual.custoUnit * novoItemManual.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 dark:text-dark-text-secondary mb-1">Preço Unit. (com BDI)</p>
                                                        <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                                                            R$ {(novoItemManual.custoUnit * (1 + formState.bdi / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 dark:text-dark-text-secondary mb-1">Preço Total</p>
                                                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                                            R$ {(novoItemManual.custoUnit * (1 + formState.bdi / 100) * novoItemManual.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowItemModal(false);
                                    setItemSearchTerm('');
                                    setModoAdicao('estoque');
                                    setNovoItemManual({
                                        nome: '',
                                        descricao: '',
                                        unidadeMedida: 'UN',
                                        quantidade: 1,
                                        custoUnit: 0,
                                        tipo: 'MATERIAL'
                                    });
                                }}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            {modoAdicao === 'manual' && (
                                <button
                                    type="button"
                                    onClick={handleAddItemManual}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Adicionar Item
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Avançado de Descrição */}
            {showEditorAvancado && (
                <EditorDescricaoAvancada
                    isOpen={showEditorAvancado}
                    onClose={() => setShowEditorAvancado(false)}
                    descricaoProjeto={formState.descricaoProjeto}
                    fotos={fotos}
                    onSave={(descricao, fotosAtualizadas) => {
                        setFormState(prev => ({ ...prev, descricaoProjeto: descricao }));
                        setFotos(fotosAtualizadas);
                        setShowEditorAvancado(false);
                    }}
                />
            )}
        </div>
    );
};

export default NovoOrcamentoPage;

