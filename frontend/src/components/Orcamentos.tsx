import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { orcamentosService, type Orcamento as ApiOrcamento, type CreateOrcamentoData } from '../services/orcamentosService';
import { clientesService, type Cliente } from '../services/clientesService';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';
import JoditEditorComponent from './JoditEditor';
import { generateOrcamentoPDF, type OrcamentoPDFData as OrcamentoPDFDataOld } from '../utils/pdfGenerator';
import NovoOrcamentoPage from '../pages/NovoOrcamentoPage';
import PDFCustomizationModal from './PDFCustomization/PDFCustomizationModalWrapper';
import { OrcamentoPDFData } from '../types/pdfCustomization';

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
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const DocumentArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

// Types (usar tipo Cliente do service importado)

interface Material {
    id: string;
    nome: string;
    sku: string;
    unidadeMedida: string;
    preco: number;
    estoque: number;
    categoria: string;
    ativo: boolean;
    fornecedor?: {
        id: string;
        nome: string;
    };
}

interface OrcamentoItem {
    id?: string;
    tipo: 'MATERIAL' | 'KIT' | 'SERVICO' | 'QUADRO_PRONTO' | 'CUSTO_EXTRA';
    materialId?: string;
    kitId?: string;
    quadroId?: string;
    servicoId?: string;
    servicoNome?: string;
    descricao?: string;
    nome: string;
    unidadeMedida: string;
    quantidade: number;
    custoUnit: number;
    precoUnit: number;
    subtotal: number;
    orcamentoId?: string;
}

interface Foto {
    id?: string;
    url: string;
    legenda: string;
    ordem: number;
    preview?: string;
}

// Usar o tipo do service
type Orcamento = ApiOrcamento;

interface OrcamentosProps {
    toggleSidebar: () => void;
}

const Orcamentos: React.FC<OrcamentosProps> = ({ toggleSidebar }) => {
    // Estado de Navegação por Abas
    const [abaAtiva, setAbaAtiva] = useState<'listagem' | 'novo'>('listagem');

    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shouldLoadEditor, setShouldLoadEditor] = useState(false);
    const [orcamentoToEdit, setOrcamentoToEdit] = useState<Orcamento | null>(null);
    const [orcamentoToView, setOrcamentoToView] = useState<Orcamento | null>(null);
    
    // Estado para PDF Customization
    const [showPDFCustomization, setShowPDFCustomization] = useState(false);
    const [orcamentoForPDF, setOrcamentoForPDF] = useState<Orcamento | null>(null);

    // Form state
    const [formState, setFormState] = useState({
        clienteId: '',
        titulo: '',
        descricao: '',
        descricaoProjeto: '',
        validade: '',
        bdi: 20,
        observacoes: '',
        // Novos campos
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
    const [showItemModal, setShowItemModal] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');

    // Carregar dados iniciais usando os serviços adequados
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Carregando dados de orçamentos via serviços...');

            const [orcamentosRes, clientesRes, materiaisRes] = await Promise.all([
                orcamentosService.listar(),
                clientesService.listar(),
                axiosApiService.get<Material[]>(ENDPOINTS.MATERIAIS)
            ]);

            console.log('📊 Resposta do serviço - Orçamentos:', orcamentosRes);
            console.log('👥 Resposta do serviço - Clientes:', clientesRes);
            console.log('📦 Resposta da API - Materiais:', materiaisRes);

            // Tratar orçamentos usando o serviço
            if (orcamentosRes.success && orcamentosRes.data) {
                const orcamentosData = Array.isArray(orcamentosRes.data) ? orcamentosRes.data : [];
                setOrcamentos(orcamentosData);
                console.log(`✅ ${orcamentosData.length} orçamentos carregados`);
            } else {
                console.warn('⚠️ Erro ao carregar orçamentos:', orcamentosRes.error);
                setOrcamentos([]);
            }

            // Tratar clientes usando o serviço
            if (clientesRes.success && clientesRes.data) {
                const clientesData = Array.isArray(clientesRes.data) ? clientesRes.data : [];
                setClientes(clientesData);
                console.log(`✅ ${clientesData.length} clientes carregados`);
            } else {
                console.warn('⚠️ Erro ao carregar clientes:', clientesRes.error);
                setClientes([]);
            }

            // Tratar materiais
            if (materiaisRes.success && materiaisRes.data) {
                const materiaisData = Array.isArray(materiaisRes.data) ? materiaisRes.data : [];
                setMateriais(materiaisData);
                console.log(`✅ ${materiaisData.length} materiais carregados`);
            } else {
                console.warn('⚠️ Erro ao carregar materiais:', materiaisRes.error);
                setMateriais([]);
            }

        } catch (err) {
            console.error('❌ Erro crítico ao carregar dados:', err);
            setError('Erro de conexão ao carregar dados');
            setOrcamentos([]);
            setClientes([]);
            setMateriais([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrar materiais para seleção
    const filteredMaterials = useMemo(() => {
        if (!Array.isArray(materiais)) return [];

        return materiais
            .filter(material => material.ativo && material.estoque > 0)
            .filter(material =>
                material.nome.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                material.sku.toLowerCase().includes(itemSearchTerm.toLowerCase())
            );
    }, [materiais, itemSearchTerm]);

    // Filtrar orçamentos
    const filteredOrcamentos = useMemo(() => {
        if (!Array.isArray(orcamentos)) return [];

        return orcamentos
            .filter(orc => statusFilter === 'Todos' || orc.status === statusFilter)
            .filter(orc =>
                orc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (orc.cliente?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [orcamentos, statusFilter, searchTerm]);

    // Calcular totais do orçamento (NOVA LÓGICA)
    const calculosOrcamento = useMemo(() => {
        const subtotalItens = items.reduce((sum, item) => sum + item.subtotal, 0);
        const valorComDesconto = subtotalItens - formState.descontoValor;
        const valorTotalFinal = valorComDesconto * (1 + formState.impostoPercentual / 100);

        return {
            subtotalItens,
            valorComDesconto,
            valorTotalFinal
        };
    }, [items, formState.descontoValor, formState.impostoPercentual]);

    const calculateTotal = () => {
        return calculosOrcamento.valorTotalFinal;
    };

    // Abrir modal
    const handleOpenModal = (orcamento: Orcamento | null = null) => {
        // Reset editor loading state
        setShouldLoadEditor(false);
        
        // Processar dados imediatamente (não bloqueia)
        if (orcamento) {
            setOrcamentoToEdit(orcamento);
            setFormState({
                clienteId: orcamento.clienteId,
                titulo: orcamento.titulo,
                descricao: orcamento.descricao || '',
                descricaoProjeto: orcamento.descricaoProjeto || '',
                validade: orcamento.validade.split('T')[0],
                bdi: orcamento.bdi,
                observacoes: orcamento.observacoes || '',
                // Novos campos
                empresaCNPJ: orcamento.empresaCNPJ || '',
                enderecoObra: orcamento.enderecoObra || '',
                cidade: orcamento.cidade || '',
                bairro: orcamento.bairro || '',
                cep: orcamento.cep || '',
                responsavelObra: orcamento.responsavelObra || '',
                previsaoInicio: orcamento.previsaoInicio ? new Date(orcamento.previsaoInicio).toISOString().split('T')[0] : '',
                previsaoTermino: orcamento.previsaoTermino ? new Date(orcamento.previsaoTermino).toISOString().split('T')[0] : '',
                descontoValor: orcamento.descontoValor || 0,
                impostoPercentual: orcamento.impostoPercentual || 0,
                condicaoPagamento: orcamento.condicaoPagamento || 'À Vista'
            });
            // Mapear ItemOrcamento para OrcamentoItem
            const mappedItems = (orcamento.items || []).map((item: any) => ({
                id: item.id,
                tipo: item.tipo,
                materialId: item.materialId,
                kitId: item.kitId,
                quadroId: item.quadroId,
                servicoId: item.servicoId,
                nome: item.nome || item.descricao || 'Item',
                descricao: item.descricao || '',
                unidadeMedida: item.unidadeMedida || 'UN',
                quantidade: item.quantidade,
                custoUnit: item.custoUnitario || 0,
                precoUnit: item.precoUnitario || item.precoUnit || 0,
                subtotal: item.subtotal,
                orcamentoId: item.orcamentoId
            }));
            setItems(mappedItems as OrcamentoItem[]);
        } else {
            setOrcamentoToEdit(null);
            setFormState({
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
            setItems([]);
        }
        
        // Abrir modal IMEDIATAMENTE (sem esperar)
        setIsModalOpen(true);
        
        // Carregar editor Jodit DEPOIS de 300ms (dar tempo pro modal renderizar)
        setTimeout(() => {
            setShouldLoadEditor(true);
        }, 300);
    };

    // Fechar modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setShowItemModal(false);
        setShouldLoadEditor(false);
        setOrcamentoToEdit(null);
        setFormState({
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
        setItems([]);
    };

    // Adicionar item ao orçamento
    const handleAddItem = (material: Material) => {
        const newItem: OrcamentoItem = {
            tipo: 'MATERIAL',
            materialId: material.id,
            nome: material.nome,
            descricao: material.nome, // Usar o nome como descrição
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

    // Salvar orçamento usando o serviço
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validar items apenas ao CRIAR novo orçamento
        // Ao EDITAR, permite salvar sem items (mantém os existentes no backend)
        if (!orcamentoToEdit && items.length === 0) {
            setError('Adicione pelo menos um item ao orçamento');
            toast.error('Orçamento sem itens', {
                description: 'Adicione pelo menos um item antes de criar o orçamento'
            });
            return;
        }

        try {
            console.log('💾 Salvando orçamento...', formState);

            const orcamentoData: any = {
                clienteId: formState.clienteId,
                titulo: formState.titulo,
                descricao: formState.descricao,
                descricaoProjeto: formState.descricaoProjeto,
                validade: formState.validade,
                bdi: formState.bdi,
                observacoes: formState.observacoes,
                // Novos campos
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
                condicaoPagamento: formState.condicaoPagamento
            };

            // Incluir items apenas se houver items para enviar
            // Ao editar sem modificar items, o backend manterá os items existentes
            if (items.length > 0) {
                orcamentoData.items = items.map(item => ({
                    tipo: item.tipo,
                    materialId: item.materialId,
                    kitId: item.kitId,
                    quadroId: item.quadroId,
                    servicoId: item.servicoId,
                    servicoNome: item.servicoNome,
                    descricao: item.descricao || item.nome,
                    quantidade: item.quantidade,
                    custoUnit: item.custoUnit,
                    precoUnitario: item.precoUnit,
                    subtotal: item.subtotal
                }));
            }

            console.log('📤 Enviando dados do orçamento:', orcamentoData);

            let response;
            if (orcamentoToEdit) {
                console.log('🔄 Modo: EDIÇÃO - Atualizando orçamento existente');
                response = await orcamentosService.atualizar(orcamentoToEdit.id, orcamentoData);
            } else {
                console.log('✨ Modo: CRIAÇÃO - Criando novo orçamento');
                response = await orcamentosService.criar(orcamentoData);
            }

            console.log('📥 Resposta do servidor:', response);

            if (response.success) {
                console.log('✅ Orçamento salvo com sucesso');
                handleCloseModal();
                await loadData();

                // Mostrar mensagem de sucesso
                toast.success(`Orçamento ${orcamentoToEdit ? 'atualizado' : 'criado'}!`, {
                    description: orcamentoToEdit ? 'As alterações foram salvas' : 'Novo orçamento criado com sucesso'
                });
            } else {
                const errorMsg = response.error || 'Erro ao salvar orçamento';
                console.warn('⚠️ Erro ao salvar:', errorMsg);
                setError(errorMsg);
                toast.error('Erro ao salvar orçamento', {
                    description: errorMsg
                });
            }
        } catch (err) {
            console.error('❌ Erro crítico ao salvar orçamento:', err);
            const errorMsg = 'Erro de conexão ao salvar orçamento';
            setError(errorMsg);
        }
    };

    // Aprovar orçamento
    const handleAprovarOrcamento = async (orcamentoId: string) => {
        toast(`Aprovar orçamento #${orcamentos.find(o => o.id === orcamentoId)?.numeroSequencial}?`, {
            description: 'Esta ação permitirá criar projetos/obras a partir deste orçamento.',
            action: {
                label: 'Confirmar Aprovação',
                onClick: async () => {
                    const response = await orcamentosService.aprovar(orcamentoId);
                    
                    if (response.success) {
                        toast.success('Orçamento aprovado!', {
                            description: 'O orçamento foi aprovado e está disponível para criar projetos.'
                        });
                        await loadData();
                    } else {
                        toast.error('Erro ao aprovar', {
                            description: response.error
                        });
                    }
                }
            }
        });
    };

    // Recusar orçamento
    const handleRecusarOrcamento = async (orcamentoId: string) => {
        const motivo = prompt('Digite o motivo da recusa (opcional):');
        
        const response = await orcamentosService.recusar(orcamentoId, motivo || undefined);
        
        if (response.success) {
            toast.success('Orçamento recusado', {
                description: motivo || 'Orçamento foi marcado como recusado'
            });
            await loadData();
        } else {
            toast.error('Erro ao recusar', {
                description: response.error
            });
        }
    };

    // Alterar status do orçamento (mantido para compatibilidade)
    const handleChangeStatus = async (orcamentoId: string, novoStatus: 'Pendente' | 'Aprovado' | 'Recusado') => {
        const promise = (async () => {
            console.log(`🔄 Alterando status do orçamento ${orcamentoId} para ${novoStatus}...`);
            const response = await orcamentosService.atualizarStatus(orcamentoId, novoStatus);

            if (response.success) {
                console.log('✅ Status alterado com sucesso');
                await loadData();
                return response.message || `Status alterado para ${novoStatus}`;
            } else {
                const errorMsg = response.error || 'Erro ao alterar status';
                console.warn('⚠️ Erro ao alterar status:', errorMsg);
                throw new Error(errorMsg);
            }
        })();

        toast.promise(promise, {
            loading: `Alterando status para ${novoStatus}...`,
            success: (message) => message,
            error: (err) => err.message || 'Erro ao alterar status'
        });
    };

    // Preparar dados do orçamento para PDF customizado
    const prepararDadosParaPDF = (orcamento: Orcamento): OrcamentoPDFData => {
        // Buscar dados completos do cliente
        const clienteCompleto = clientes.find(c => c.id === orcamento.clienteId);

        return {
            numero: orcamento.id.substring(0, 8).toUpperCase(),
            data: new Date(orcamento.createdAt).toLocaleDateString('pt-BR'),
            validade: new Date(orcamento.validade).toLocaleDateString('pt-BR'),
            cliente: {
                nome: orcamento.cliente?.nome || clienteCompleto?.nome || 'Cliente não informado',
                cpfCnpj: (orcamento.cliente as any)?.cpfCnpj || clienteCompleto?.cpfCnpj || '',
                endereco: clienteCompleto?.endereco,
                telefone: clienteCompleto?.telefone,
                email: clienteCompleto?.email
            },
            projeto: {
                titulo: orcamento.titulo,
                descricao: orcamento.descricao,
                enderecoObra: (orcamento as any).enderecoObra,
                cidade: (orcamento as any).cidade,
                bairro: (orcamento as any).bairro,
                cep: (orcamento as any).cep
            },
            prazos: {
                previsaoInicio: (orcamento as any).previsaoInicio ? new Date((orcamento as any).previsaoInicio).toLocaleDateString('pt-BR') : undefined,
                previsaoTermino: (orcamento as any).previsaoTermino ? new Date((orcamento as any).previsaoTermino).toLocaleDateString('pt-BR') : undefined
            },
            items: (orcamento.items || []).map((item: any) => ({
                codigo: item.materialId || item.kitId,
                nome: item.nome || item.descricao || 'Item',
                descricao: item.descricao,
                unidade: item.unidadeMedida || 'UN',
                quantidade: item.quantidade,
                valorUnitario: item.precoUnit || item.precoUnitario,
                valorTotal: item.subtotal
            })),
            financeiro: {
                subtotal: orcamento.custoTotal,
                bdi: orcamento.bdi,
                valorComBDI: orcamento.custoTotal * (1 + orcamento.bdi / 100),
                desconto: (orcamento as any).descontoValor || 0,
                impostos: (orcamento as any).impostoPercentual || 0,
                valorTotal: orcamento.precoVenda,
                condicaoPagamento: (orcamento as any).condicaoPagamento || 'À Vista'
            },
            observacoes: orcamento.observacoes,
            descricaoTecnica: (orcamento as any).descricaoProjeto,
            fotos: [], // Fotos agora estão inline no HTML do Jodit
            empresa: {
                nome: 'S3E Engenharia',
                cnpj: '00.000.000/0000-00',
                endereco: 'Endereço da empresa',
                telefone: '(48) 0000-0000',
                email: 'contato@s3e.com.br'
            }
        };
    };

    // Abrir modal de customização de PDF
    const handlePersonalizarPDF = (orcamento: Orcamento) => {
        setOrcamentoForPDF(orcamento);
        setShowPDFCustomization(true);
    };

    // Gerar PDF profissional com marca d'água
    const handleGerarPDFProfissional = async (orcamento: Orcamento) => {
        try {
            console.log('📄 Gerando PDF profissional:', orcamento.id);
            toast.info('Gerando PDF...');
            
            // Buscar HTML via API autenticada
            const response = await axiosApiService.get(`/api/orcamentos/${orcamento.id}/pdf/preview?opacidade=0.08`);
            
            if (response.success && response.data?.html) {
                // Criar blob com o HTML
                const blob = new Blob([response.data.html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                
                console.log('✅ PDF gerado, abrindo em nova janela...');
                
                // Abrir em nova janela
                const win = window.open(url, '_blank');
                
                if (win) {
                    // Aguardar carregar e disparar impressão automaticamente
                    win.addEventListener('load', () => {
                        setTimeout(() => {
                            win.print();
                            // Limpar blob URL após uso
                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                        }, 500);
                    });
                    toast.success('PDF aberto em nova janela!');
                } else {
                    toast.error('Popup bloqueado! Permita popups neste site.');
                }
            } else {
                toast.error('Erro ao gerar PDF');
            }
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            toast.error('Erro ao gerar PDF do orçamento');
        }
    };

    // Gerar PDF do orçamento (função antiga mantida para compatibilidade)
    const handleGerarPDF = (orcamento: Orcamento) => {
        try {
            console.log('📄 Gerando PDF do orçamento:', orcamento.id);

            const pdfData: OrcamentoPDFDataOld = {
                id: orcamento.id.substring(0, 8).toUpperCase(),
                titulo: orcamento.titulo,
                cliente: {
                    nome: orcamento.cliente?.nome || 'Cliente não informado',
                    cpfCnpj: (orcamento.cliente as any)?.cpfCnpj || '',
                    endereco: (orcamento.cliente as any)?.endereco,
                    telefone: orcamento.cliente?.telefone
                },
                data: new Date(orcamento.createdAt).toLocaleDateString('pt-BR'),
                validade: new Date(orcamento.validade).toLocaleDateString('pt-BR'),
                descricao: orcamento.descricao,
                items: (orcamento.items || []).map((item: any) => ({
                    nome: item.nome || item.descricao || 'Item',
                    quantidade: item.quantidade,
                    valorUnit: item.precoUnit || item.precoUnitario,
                    valorTotal: item.subtotal
                })),
                subtotal: orcamento.custoTotal,
                bdi: orcamento.bdi,
                valorTotal: orcamento.precoVenda,
                observacoes: orcamento.observacoes
            };

            generateOrcamentoPDF(pdfData);
            toast.success('PDF gerado com sucesso!', {
                description: 'O download foi iniciado automaticamente'
            });
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            toast.error('Erro ao gerar PDF', {
                description: 'Verifique o console para mais detalhes'
            });
        }
    };


    // Status styling
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Pendente': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
            case 'Aprovado': return 'bg-green-100 text-green-800 ring-1 ring-green-200';
            case 'Recusado': return 'bg-red-100 text-red-800 ring-1 ring-red-200';
            default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando orçamentos...</p>
                </div>
            </div>
        );
    }

    // Se a aba ativa for 'novo', renderiza a nova página
    if (abaAtiva === 'novo') {
        return (
            <NovoOrcamentoPage
                setAbaAtiva={setAbaAtiva}
                onOrcamentoCriado={loadData}
            />
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-dark-bg">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 dark:text-dark-text-secondary rounded-xl hover:bg-white dark:hover:bg-dark-card hover:shadow-soft">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-dark-text tracking-tight">Orçamentos</h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-dark-text-secondary mt-1">Gerencie seus orçamentos e propostas comerciais</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="btn-info flex items-center gap-2 disabled:opacity-50"
                        title="Recarregar dados"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Carregando...' : 'Atualizar'}
                    </button>
                    <button
                        onClick={() => setAbaAtiva('novo')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Novo Orçamento
                    </button>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <p className="text-red-800 font-medium">⚠️ {error}</p>
                        <button
                            onClick={loadData}
                            className="text-red-700 hover:text-red-900 font-medium underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título ou cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="Todos">Todos os Status</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Recusado">Recusado</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Exibindo <span className="font-bold text-gray-900">{filteredOrcamentos.length}</span> de <span className="font-bold text-gray-900">{orcamentos.length}</span> orçamentos
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Pendente: {orcamentos.filter(o => o.status === 'Pendente').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Aprovado: {orcamentos.filter(o => o.status === 'Aprovado').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Recusado: {orcamentos.filter(o => o.status === 'Recusado').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : orcamentos.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-xs text-gray-600">
                                {error ? 'API Error' : orcamentos.length > 0 ? 'API Online' : 'Carregando...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Orçamentos */}
            {filteredOrcamentos.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📋</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || statusFilter !== 'Todos'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece criando seu primeiro orçamento'}
                    </p>
                    {!searchTerm && statusFilter === 'Todos' && (
                        <button
                            onClick={() => setAbaAtiva('novo')}
                            className="btn-primary flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Criar Primeiro Orçamento
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrcamentos.map((orcamento) => (
                        <div key={orcamento.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-purple-300 transition-all duration-200">
                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-gray-100 text-gray-700 rounded">
                                            #{orcamento.numeroSequencial || '---'}
                                        </span>
                                        <h3 className="font-bold text-lg text-gray-900">{orcamento.titulo}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 ring-1 ring-purple-200">
                                            📋 Orçamento
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getStatusClass(orcamento.status)}`}>
                                    {orcamento.status === 'Pendente' && '⏳ '}
                                    {orcamento.status === 'Aprovado' && '✅ '}
                                    {orcamento.status === 'Recusado' && '❌ '}
                                    {orcamento.status}
                                </span>
                            </div>

                            {/* Informações */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>👤</span>
                                    <span className="truncate">{orcamento.cliente?.nome || 'Cliente não informado'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>💰</span>
                                    <span className="font-bold text-purple-700">
                                        R$ {orcamento.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📅</span>
                                    <span>Válido até: {new Date(orcamento.validade).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>📝</span>
                                    <span>{orcamento.items?.length || 0} item(s)</span>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setOrcamentoToView(orcamento)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => handlePersonalizarPDF(orcamento)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-indigo-200 transition-all text-sm font-semibold shadow-sm"
                                        title="Personalizar e gerar PDF"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                        </svg>
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(orcamento)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Editar
                                    </button>
                                </div>
                                
                                {/* Botões de Aprovação/Recusa - Apenas para Pendentes */}
                                {orcamento.status === 'Pendente' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAprovarOrcamento(orcamento.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-semibold shadow-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Aprovar
                                        </button>
                                        <button
                                            onClick={() => handleRecusarOrcamento(orcamento.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all font-semibold shadow-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Recusar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-strong max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        {/* Header */}
                        <div className="relative p-6 border-b border-gray-200 dark:border-dark-border bg-[#0a1a2f] dark:bg-gradient-to-r dark:from-purple-600 dark:to-purple-700">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-medium">
                                    {orcamentoToEdit ? <PencilIcon className="w-7 h-7 text-white" /> : <PlusIcon className="w-7 h-7 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white">
                                        {orcamentoToEdit ? 'Editar Orçamento' : 'Novo Orçamento'}
                                    </h2>
                                    <p className="text-sm text-white/80 mt-1">
                                        {orcamentoToEdit ? 'Atualize as informações do orçamento' : 'Crie uma nova proposta comercial'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* SEÇÃO 1: Informações Básicas */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">📋</span>
                                    Informações Básicas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            CNPJ da Empresa Executora
                                        </label>
                                        <select
                                            value={formState.empresaCNPJ}
                                            onChange={(e) => setFormState(prev => ({ ...prev, empresaCNPJ: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Selecione o CNPJ</option>
                                            <option value="00.000.000/0001-00">S3E Engenharia - 00.000.000/0001-00</option>
                                            <option value="00.000.000/0002-00">S3E Filial - 00.000.000/0002-00</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Cliente *
                                        </label>
                                        <select
                                            value={formState.clienteId}
                                            onChange={(e) => setFormState(prev => ({ ...prev, clienteId: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Selecione um cliente</option>
                                            {Array.isArray(clientes) && clientes.length > 0 ? (
                                                clientes.map(cliente => (
                                                    <option key={cliente.id} value={cliente.id}>
                                                        {cliente.nome} - {cliente.cpfCnpj}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>Nenhum cliente disponível</option>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Título do Projeto *
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.titulo}
                                            onChange={(e) => setFormState(prev => ({ ...prev, titulo: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="Ex: Instalação Elétrica - Edifício Comercial"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Validade do Orçamento *
                                        </label>
                                        <input
                                            type="date"
                                            value={formState.validade}
                                            onChange={(e) => setFormState(prev => ({ ...prev, validade: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Endereço da Obra (Rua e Número) *
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.enderecoObra}
                                            onChange={(e) => setFormState(prev => ({ ...prev, enderecoObra: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="Ex: Rua das Flores, 123"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Bairro *
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.bairro}
                                            onChange={(e) => setFormState(prev => ({ ...prev, bairro: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="Ex: Centro"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Cidade *
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.cidade}
                                            onChange={(e) => setFormState(prev => ({ ...prev, cidade: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="Ex: Florianópolis"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            CEP *
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.cep}
                                            onChange={(e) => setFormState(prev => ({ ...prev, cep: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Responsável no Local
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.responsavelObra}
                                            onChange={(e) => setFormState(prev => ({ ...prev, responsavelObra: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="Nome do responsável técnico"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            BDI - Margem (%) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formState.bdi}
                                            onChange={(e) => handleBdiChange(Number(e.target.value))}
                                            min="0"
                                            max="100"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="20"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Descrição Resumida
                                        </label>
                                        <textarea
                                            value={formState.descricao}
                                            onChange={(e) => setFormState(prev => ({ ...prev, descricao: e.target.value }))}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="Resumo breve do projeto..."
                                        />
                                    </div>
                                </div>

                                {/* SEÇÃO 2: Prazos e Cronograma */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">📅</span>
                                        Prazos e Cronograma
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Previsão de Início
                                            </label>
                                            <input
                                                type="date"
                                                value={formState.previsaoInicio}
                                                onChange={(e) => setFormState(prev => ({ ...prev, previsaoInicio: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Previsão de Término
                                            </label>
                                            <input
                                                type="date"
                                                value={formState.previsaoTermino}
                                                onChange={(e) => setFormState(prev => ({ ...prev, previsaoTermino: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SEÇÃO 3: Itens do Orçamento */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Itens do Orçamento</h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowItemModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-medium font-semibold"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Adicionar Item
                                        </button>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl">📦</span>
                                            </div>
                                            <p className="text-gray-500 font-medium">Nenhum item adicionado</p>
                                            <p className="text-gray-400 text-sm mt-1">Clique em "Adicionar Item" para começar</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((item, index) => (
                                                <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{item.nome}</p>
                                                            <p className="text-sm text-gray-600">{item.unidadeMedida}</p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                                                            <input
                                                                type="number"
                                                                value={item.quantidade}
                                                                onChange={(e) => handleUpdateItemQuantity(index, Number(e.target.value))}
                                                                min="1"
                                                                step="0.01"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Valor Unit.</label>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                R$ {item.precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Subtotal</label>
                                                            <p className="text-sm font-bold text-purple-700">
                                                                R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">💰</span>
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Desconto (R$)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formState.descontoValor}
                                                    onChange={(e) => setFormState(prev => ({ ...prev, descontoValor: parseFloat(e.target.value) || 0 }))}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                                    placeholder="0,00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Impostos (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formState.impostoPercentual}
                                                    onChange={(e) => setFormState(prev => ({ ...prev, impostoPercentual: parseFloat(e.target.value) || 0 }))}
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Condição de Pagamento
                                                </label>
                                                <select
                                                    value={formState.condicaoPagamento}
                                                    onChange={(e) => setFormState(prev => ({ ...prev, condicaoPagamento: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="À Vista">À Vista</option>
                                                    <option value="30 dias">30 dias</option>
                                                    <option value="30/60 dias">30/60 dias</option>
                                                    <option value="30/60/90 dias">30/60/90 dias</option>
                                                    <option value="Personalizado">Personalizado</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Valor com Desconto */}
                                        {formState.descontoValor > 0 && (
                                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-semibold text-orange-700">Valor com Desconto</span>
                                                    <span className="text-xl font-bold text-orange-900">
                                                        R$ {calculosOrcamento.valorComDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

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

                                {/* SEÇÃO 5: Descrição Técnica com Editor Jodit WYSIWYG */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">📝</span>
                                        Descrição Técnica do Projeto
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        💡 Use o editor abaixo para criar ou editar a descrição técnica. Formate texto, insira imagens e crie tabelas.
                                    </p>

                                    {/* Editor Jodit WYSIWYG Inline - Lazy Load */}
                                    <div className="mb-4">
                                        {!shouldLoadEditor ? (
                                            <div className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-dashed border-purple-300 rounded-xl p-12 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
                                                <div className="relative mb-6">
                                                    <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-3xl animate-bounce">📝</span>
                                                    </div>
                                                </div>
                                                <h4 className="text-xl font-bold text-purple-800 mb-2 animate-pulse">
                                                    Carregando Editor WYSIWYG
                                                </h4>
                                                <p className="text-purple-600 text-center max-w-md">
                                                    Preparando o editor de texto rico com suporte a formatação, imagens e tabelas...
                                                </p>
                                                <div className="mt-4 flex gap-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <JoditEditorComponent
                                                value={formState.descricaoProjeto}
                                                onChange={(content) => setFormState(prev => ({ ...prev, descricaoProjeto: content }))}
                                                placeholder="Digite a descrição técnica completa do projeto... Você pode formatar o texto, inserir imagens, criar tabelas e listas."
                                                height={400}
                                            />
                                        )}
                                    </div>

                                    {/* Dica de Uso */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                        <p className="text-xs text-blue-800">
                                            💡 <strong>Dica:</strong> Use o ícone 🖼️ para inserir imagens inline e o ícone 📊 para criar tabelas de especificações.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-[#0a1a2f] hover:bg-[#0d2240] dark:bg-gradient-to-r dark:from-purple-600 dark:to-purple-500 text-white rounded-xl dark:hover:from-purple-700 dark:hover:to-purple-600 transition-all shadow-medium font-semibold"
                                    >
                                        {orcamentoToEdit ? 'Atualizar' : 'Criar'} Orçamento
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE SELEÇÃO DE ITENS */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-strong w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-blue-600 to-blue-700">
                            <div>
                                <h3 className="text-xl font-bold text-white">Adicionar Item ao Orçamento</h3>
                                <p className="text-sm text-white/80 mt-1">Escolha o tipo e selecione o item</p>
                            </div>
                            <button onClick={() => setShowItemModal(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Seletor de Tipo de Item */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Item</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <button type="button" className="px-4 py-3 bg-blue-100 border-2 border-blue-300 text-blue-800 rounded-xl font-semibold hover:bg-blue-200 transition-all">
                                        📦 Material
                                    </button>
                                    <button type="button" className="px-4 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                        🎁 Kit
                                    </button>
                                    <button type="button" className="px-4 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                        🔧 Serviço
                                    </button>
                                    <button type="button" className="px-4 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                        ⚡ Quadro Pronto
                                    </button>
                                    <button type="button" className="px-4 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                        💵 Custo Extra
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar materiais por nome ou SKU..."
                                        value={itemSearchTerm}
                                        onChange={(e) => setItemSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {filteredMaterials.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">Nenhum material disponível</p>
                                        <p className="text-gray-400 text-sm mt-1">Verifique se há materiais cadastrados com estoque</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredMaterials.map((material) => (
                                            <div
                                                key={material.id}
                                                className="bg-gray-50 border-2 border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                                onClick={() => handleAddItem(material)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-900">{material.nome}</h4>
                                                    <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-lg">
                                                        Estoque: {material.estoque}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">SKU: {material.sku}</p>
                                                <p className="text-sm text-gray-600 mb-2">Unidade: {material.unidadeMedida}</p>
                                                <p className="text-lg font-bold text-blue-700">
                                                    R$ {material.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE VISUALIZAÇÃO */}
            {orcamentoToView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-blue-600 to-blue-700">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Detalhes do Orçamento</h2>
                                <p className="text-sm text-white/80 mt-1">Visualização completa do orçamento</p>
                            </div>
                            <button onClick={() => setOrcamentoToView(null)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Cliente</h3>
                                    <p className="text-gray-900 font-medium">{orcamentoToView.cliente?.nome || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusClass(orcamentoToView.status)}`}>
                                        {orcamentoToView.status === 'Pendente' && '⏳ '}
                                        {orcamentoToView.status === 'Aprovado' && '✅ '}
                                        {orcamentoToView.status === 'Recusado' && '❌ '}
                                        {orcamentoToView.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Total</h3>
                                    <p className="text-2xl font-bold text-purple-700">R$ {orcamentoToView.precoVenda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Validade</h3>
                                    <p className="text-gray-900 font-medium">{new Date(orcamentoToView.validade).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            {orcamentoToView.descricao && (
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                                    <p className="text-gray-700">{orcamentoToView.descricao}</p>
                                </div>
                            )}

                            {orcamentoToView.items && orcamentoToView.items.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-4">Itens do Orçamento</h3>
                                    <div className="space-y-3">
                                        {orcamentoToView.items.map((item, index) => (
                                            <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{(item as any).nome || (item as any).descricao || 'Item'}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {item.quantidade} {(item as any).unidadeMedida || 'UN'} × R$ {((item as any).precoUnit || (item as any).precoUnitario)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg text-purple-700">
                                                            R$ {item.subtotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {orcamentoToView.observacoes && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
                                    <p className="text-gray-700">{orcamentoToView.observacoes}</p>
                                </div>
                            )}

                            {/* Ações do Orçamento */}
                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => handleGerarPDFProfissional(orcamentoToView)}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0a1a2f] hover:bg-[#0d2240] dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 text-white rounded-xl dark:hover:from-purple-700 dark:hover:to-indigo-700 transition-all shadow-medium font-semibold"
                                    title="Gerar PDF com marca d'água padrão S3E"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                    📄 Gerar PDF Rápido
                                </button>
                                <button
                                    onClick={() => {
                                        setOrcamentoToView(null);
                                        handlePersonalizarPDF(orcamentoToView);
                                    }}
                                    className="btn-success flex items-center gap-2"
                                    title="Personalizar PDF com logo e folha timbrada"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                    </svg>
                                    🎨 Personalizar PDF
                                </button>
                                {orcamentoToView.status === 'Pendente' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleAprovarOrcamento(orcamentoToView.id);
                                                setOrcamentoToView(null);
                                            }}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-medium font-semibold"
                                        >
                                            ✅ Aprovar Orçamento
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleRecusarOrcamento(orcamentoToView.id);
                                                setOrcamentoToView(null);
                                            }}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2.5 rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-medium font-semibold"
                                        >
                                            ❌ Recusar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Customização de PDF */}
            {showPDFCustomization && orcamentoForPDF && (
                <PDFCustomizationModal
                    isOpen={showPDFCustomization}
                    onClose={() => {
                        setShowPDFCustomization(false);
                        setOrcamentoForPDF(null);
                    }}
                    orcamentoId={orcamentoForPDF.id}
                    orcamentoData={prepararDadosParaPDF(orcamentoForPDF)}
                    onGeneratePDF={() => {
                        console.log('✅ PDF gerado com sucesso!');
                        toast.success('PDF personalizado gerado com sucesso!');
                        // Fechar modal após gerar (opcional)
                        setShowPDFCustomization(false);
                        setOrcamentoForPDF(null);
                    }}
                />
            )}

        </div>
    );
};

export default Orcamentos;