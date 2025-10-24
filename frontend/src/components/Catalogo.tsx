import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CatalogItem, CatalogItemType, Product, Kit, KitProduct, Service, KitService, ServiceType, KitConfiguration, MaterialItem } from '../types';
// Removido import de dados mock - usando API
import { apiService } from '../services/api';

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
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);
const Squares2x2Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const ListBulletIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9.75l-9-5.25M12 12.75L3 7.5m9 5.25L21 7.5" /></svg>;

interface CatalogoProps {
    toggleSidebar: () => void;
}

const initialKitConfig: KitConfiguration = {
    kitType: '',
    medidores: { materialType: '', numMedidores: 1, quadroAluminioId: undefined, caixasPolicarbonato: [] },
    comando: { assemblyType: '', baseQuadroId: undefined, items: [] },
    disjuntorGeralId: undefined,
    disjuntorGeralTipo: '', // 'caixa-moldada' ou 'din'
    disjuntorGeralPolaridade: '', // 'monopolar', 'bipolar', 'tripolar'
    disjuntoresIndividuais: [],
    disjuntoresIndividuaisPolaridade: '', // 'monopolar', 'bipolar', 'tripolar'
    cabos: { type: '', items: [] },
    dpsId: undefined,
    dpsClasse: '', // 'classe1' ou 'classe2'
    dpsConfig: {
        quantidade: 3,
        tcmQuantidade: 0,
        caboTerraComprimento: 30,
        caboTerraBitola: '',
        barramentoPenteQuantidade: 0,
        disjuntoresDPS: []
    },
    acabamentos: { 
        hasBornes: false, 
        parafusos: [], 
        arruelas: [],
        terminais: { type: '', id: undefined, quantity: 0 },
        terminaisTubulares: { quantity: 12, items: [] },
        curvaBox: { quantity: 1 }
    },
};

const Catalogo: React.FC<CatalogoProps> = ({ toggleSidebar }) => {
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<CatalogItemType | 'Todos'>('Todos');

    // Carregar dados da API
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [catalogRes, materialsRes, servicesRes] = await Promise.all([
                apiService.get<CatalogItem[]>('/api/catalogo'),
                apiService.get<MaterialItem[]>('/api/materiais'),
                apiService.get<Service[]>('/api/servicos')
            ]);

            if (catalogRes.success && catalogRes.data) setCatalogItems(catalogRes.data);
            if (materialsRes.success && materialsRes.data) setMaterials(materialsRes.data);
            if (servicesRes.success && servicesRes.data) setServices(servicesRes.data);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [catalogSection, setCatalogSection] = useState<'itens' | 'servicos'>('itens');
    const [servicesSearchTerm, setServicesSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isKitModalOpen, setIsKitModalOpen] = useState(false);
    const [isSubestacaoModalOpen, setIsSubestacaoModalOpen] = useState(false);
    
    // Edit/Delete state
    const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
    const [itemToView, setItemToView] = useState<CatalogItem | null>(null);

    // Form state for new/edit product (agora é para criar Kit)
    const [newProductName, setNewProductName] = useState('');
    const [newProductSku, setNewProductSku] = useState('');
    const [newProductDesc, setNewProductDesc] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductStock, setNewProductStock] = useState('');
    const [newProductImage, setNewProductImage] = useState<string | null>(null);
    const productFileInputRef = useRef<HTMLInputElement>(null);

    // Estados para novo modal de Kit
    const [kitNome, setKitNome] = useState('');
    const [kitDescricao, setKitDescricao] = useState('');
    const [kitComposicao, setKitComposicao] = useState<Array<{
        id: string;
        name: string;
        type: 'material' | 'produto' | 'kit';
        unitPrice: number;
        quantity: number;
        total: number;
    }>>([]);
    const [kitMargemLucro, setKitMargemLucro] = useState<number>(0);
    const [composicaoSearch, setComposicaoSearch] = useState('');
    const [composicaoQuantity, setComposicaoQuantity] = useState(1);
    const [isComposicaoDropdownOpen, setIsComposicaoDropdownOpen] = useState(false);
    const composicaoDropdownRef = useRef<HTMLDivElement>(null);

    // New Kit Builder State
    const [currentStep, setCurrentStep] = useState(1);
    const [kitConfig, setKitConfig] = useState<KitConfiguration>(initialKitConfig);
    const [newKitName, setNewKitName] = useState('');
    const [newKitDesc, setNewKitDesc] = useState('');
    const [isCaixasModalOpen, setIsCaixasModalOpen] = useState(false);
    const [tempCaixaQuantities, setTempCaixaQuantities] = useState<{ [key: string]: number }>({});
    
    const [comandoItemSearch, setComandoItemSearch] = useState('');
    const [comandoProductToAdd, setComandoProductToAdd] = useState<Product | null>(null);
    const [isComandoListOpen, setIsComandoListOpen] = useState(false);
    const comandoDropdownRef = useRef<HTMLDivElement>(null);

    // State for multi-item steps
    const [disjuntorIndividualToAdd, setDisjuntorIndividualToAdd] = useState({ id: '', quantityPerMeter: 1 });
    const [acabamentoSearch, setAcabamentoSearch] = useState('');
    
    // Estados para busca personalizada (outros tipos de kit)
    const [disjuntorGeralSearch, setDisjuntorGeralSearch] = useState('');
    const [disjuntorIndividualSearch, setDisjuntorIndividualSearch] = useState('');
    const [dpsSearch, setDpsSearch] = useState('');
    const [terminalSearch, setTerminalSearch] = useState('');
    const [caboSearch, setCaboSearch] = useState('');
    
    // Referências para dropdowns de busca
    const disjuntorGeralDropdownRef = useRef<HTMLDivElement>(null);
    const disjuntorIndividualDropdownRef = useRef<HTMLDivElement>(null);
    const dpsDropdownRef = useRef<HTMLDivElement>(null);
    const terminalDropdownRef = useRef<HTMLDivElement>(null);
    const caboDropdownRef = useRef<HTMLDivElement>(null);
    
    // Estado para Subestações
    const [subestacaoTipo, setSubestacaoTipo] = useState<'aerea' | 'abrigada' | ''>('');
    const [subestacaoStep, setSubestacaoStep] = useState(1);
    const [subestacaoNome, setSubestacaoNome] = useState('');
    const [subestacaoDesc, setSubestacaoDesc] = useState('');
    const [rascunhoSalvoMensagem, setRascunhoSalvoMensagem] = useState(false);
    
    // Estados para Subestação - Busca e adição de materiais
    const [subestacaoConfig, setSubestacaoConfig] = useState({
        postoTransformacao: { potencia: '', tensao: '', items: [] as KitProduct[] },
        aterramento: { items: [] as KitProduct[] },
        iluminacao: { items: [] as KitProduct[] },
        cabineMedicao: { items: [] as KitProduct[] },
        condutores: { items: [] as KitProduct[] },
        camposPersonalizados: [] as { nome: string; items: KitProduct[] }[]
    });
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [materialQuantity, setMaterialQuantity] = useState(1);
    const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
    const materialSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
             if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId]?.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
             if (comandoDropdownRef.current && !comandoDropdownRef.current.contains(event.target as Node)) {
                setIsComandoListOpen(false);
            }
             if (materialSearchRef.current && !materialSearchRef.current.contains(event.target as Node)) {
                setIsMaterialDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    // Fechar dropdown de composição ao clicar fora
    useEffect(() => {
        const handleClickOutsideComposicao = (event: MouseEvent) => {
            if (composicaoDropdownRef.current && !composicaoDropdownRef.current.contains(event.target as Node)) {
                setIsComposicaoDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideComposicao);
        return () => document.removeEventListener('mousedown', handleClickOutsideComposicao);
    }, []);

    // Fechar modal com tecla ESC
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isKitModalOpen) {
                    handleCloseKitModal();
                } else if (isSubestacaoModalOpen) {
                    handleCloseSubestacaoModal();
                } else if (isProductModalOpen) {
                    handleCloseProductModal();
                } else if (itemToDelete) {
                    handleCloseDeleteModal();
                } else if (itemToView) {
                    handleCloseViewModal();
                } else if (isCaixasModalOpen) {
                    setIsCaixasModalOpen(false);
                }
            }
        };
        
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isKitModalOpen, isSubestacaoModalOpen, isProductModalOpen, itemToDelete, itemToView, isCaixasModalOpen]);

    // Auto-preencher configuração DPS baseado na classe (apenas para Quadro de Medição)
    useEffect(() => {
        if (kitConfig.kitType !== 'medidores') return;
        
        if (kitConfig.dpsClasse === 'classe1') {
            handleKitConfigChange('dpsConfig', {
                quantidade: 3,
                tcmQuantidade: 0,
                caboTerraComprimento: 30,
                caboTerraBitola: '16mm²',
                barramentoPenteQuantidade: 0,
                disjuntoresDPS: []
            });
        } else if (kitConfig.dpsClasse === 'classe2') {
            handleKitConfigChange('dpsConfig', {
                quantidade: 3,
                tcmQuantidade: 0,
                caboTerraComprimento: 30,
                caboTerraBitola: '6mm²',
                barramentoPenteQuantidade: 0,
                disjuntoresDPS: [{ id: '', name: 'Disjuntor DIN 25A-10KA Monopolar', quantity: 3 }]
            });
        }
    }, [kitConfig.dpsClasse, kitConfig.kitType]);

    // Auto-preencher tipo de disjuntor geral baseado no tipo (apenas para Quadro de Medição)
    useEffect(() => {
        if (kitConfig.kitType !== 'medidores') return;
        
        if (kitConfig.disjuntorGeralTipo === 'caixa-moldada') {
            handleKitConfigChange('disjuntorGeralPolaridade', 'tripolar');
        }
    }, [kitConfig.disjuntorGeralTipo, kitConfig.kitType]);


    const filteredItems = useMemo(() => {
        return catalogItems
            .filter(item => filter === 'Todos' || item.type === filter)
            .filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.type === CatalogItemType.Produto && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [catalogItems, filter, searchTerm]);

    // Handlers for Product Modal (Create and Edit)
    const handleOpenProductModal = (product: Product | null = null) => {
        setOpenDropdownId(null);
        if (product) {
            setItemToEdit(product);
            setKitNome(product.name);
            setKitDescricao(product.description);
            // Aqui poderia carregar a composição se estiver editando
        } else {
            setItemToEdit(null);
            setKitNome('');
            setKitDescricao('');
            setKitComposicao([]);
            setKitMargemLucro(0);
        }
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setItemToEdit(null);
        setKitNome('');
        setKitDescricao('');
        setKitComposicao([]);
        setKitMargemLucro(0);
        setComposicaoSearch('');
        setComposicaoQuantity(1);
        setIsComposicaoDropdownOpen(false);
    };

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setNewProductImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    // Funções para gerenciar composição do kit
    const handleAddItemToComposicao = (item: MaterialItem | Product | Kit, quantity: number) => {
        const itemPrice = item.price || 0;
        const newItem = {
            id: item.id,
            name: item.name,
            type: ('sku' in item ? 'produto' : ('products' in item ? 'kit' : 'material')) as 'material' | 'produto' | 'kit',
            unitPrice: itemPrice,
            quantity: quantity,
            total: itemPrice * quantity
        };
        
        setKitComposicao(prev => {
            const existingIndex = prev.findIndex(i => i.id === item.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                updated[existingIndex].total = updated[existingIndex].unitPrice * updated[existingIndex].quantity;
                return updated;
            }
            return [...prev, newItem];
        });
        
        setComposicaoSearch('');
        setComposicaoQuantity(1);
        setIsComposicaoDropdownOpen(false);
    };

    const handleRemoveItemFromComposicao = (itemId: string) => {
        setKitComposicao(prev => prev.filter(item => item.id !== itemId));
    };

    const handleUpdateQuantityInComposicao = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveItemFromComposicao(itemId);
            return;
        }
        setKitComposicao(prev => prev.map(item => 
            item.id === itemId 
                ? { ...item, quantity: newQuantity, total: item.unitPrice * newQuantity }
                : item
        ));
    };

    // Filtrar itens disponíveis para composição (materiais + kits do catálogo)
    const itensDisponiveis = useMemo(() => {
        const allItems: (MaterialItem | Kit)[] = [
            ...materials,
            ...catalogItems.filter(item => item.type === CatalogItemType.Kit) as Kit[]
        ];
        
        if (!composicaoSearch.trim()) return [];
        
        return allItems.filter(item =>
            item.name.toLowerCase().includes(composicaoSearch.toLowerCase()) ||
            item.id.toLowerCase().includes(composicaoSearch.toLowerCase())
        ).slice(0, 20);
    }, [composicaoSearch, catalogItems]);

    // Cálculos do kit
    const kitCustoTotal = useMemo(() => {
        return kitComposicao.reduce((sum, item) => sum + item.total, 0);
    }, [kitComposicao]);

    const kitPrecoVenda = useMemo(() => {
        return kitCustoTotal * (1 + kitMargemLucro / 100);
    }, [kitCustoTotal, kitMargemLucro]);

    const handleProductFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!kitNome.trim()) {
            alert('Por favor, informe o nome do kit.');
            return;
        }

        if (kitComposicao.length === 0) {
            alert('Por favor, adicione pelo menos um item à composição do kit.');
            return;
        }
        
        // Criar o kit
        const newKit: Kit = {
            id: `KIT-${Date.now()}`,
            type: CatalogItemType.Kit,
            name: kitNome,
            description: kitDescricao || 'Kit personalizado',
            price: kitPrecoVenda,
            products: kitComposicao
                .filter(item => item.type === 'material' || item.type === 'produto')
                .map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.unitPrice,
                    quantity: item.quantity
                })),
            services: []
        };
        
        setCatalogItems(prev => [...prev, newKit]);
        handleCloseProductModal();
    };
    
    // Handlers for Deletion
    const handleOpenDeleteModal = (item: CatalogItem) => {
        setOpenDropdownId(null);
        setItemToDelete(item);
    };

    const handleCloseDeleteModal = () => {
        setItemToDelete(null);
    };
    
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setCatalogItems(prev => prev.filter(item => item.id !== itemToDelete.id));
            handleCloseDeleteModal();
        }
    };

    // Handlers for View Modal
    const handleOpenViewModal = (item: CatalogItem) => {
        setItemToView(item);
        setOpenDropdownId(null);
    };

    const handleCloseViewModal = () => {
        setItemToView(null);
    };


    // Handlers for Kit Builder Modal
    const handleOpenKitModal = (kit: Kit | null = null) => {
        setOpenDropdownId(null);
        if (kit) {
            setItemToEdit(kit);
            setNewKitName(kit.name);
            setNewKitDesc(kit.description);
            // Deep copy configuration to avoid mutation issues
            setKitConfig(JSON.parse(JSON.stringify(kit.configuration || initialKitConfig)));
        } else {
            setItemToEdit(null);
            setNewKitName('');
            setNewKitDesc('');
            setKitConfig(initialKitConfig);
        }
        setCurrentStep(1);
        setIsKitModalOpen(true);
    };
    

    const handleCloseKitModal = () => {
        setIsKitModalOpen(false);
        setItemToEdit(null);
        setKitConfig(initialKitConfig);
        setNewKitName('');
        setNewKitDesc('');
        setCurrentStep(1);
        // Resetar estados dos campos de adição
        setDisjuntorIndividualToAdd({ id: '', quantityPerMeter: 1 });
        setAcabamentoSearch('');
        setTempCaixaQuantities({});
    };

    // Handlers para Modal de Subestações
    const handleOpenSubestacaoModal = () => {
        setOpenDropdownId(null);
        
        // Verificar se existe rascunho salvo
        const rascunhoSalvo = localStorage.getItem('subestacaoRascunho');
        if (rascunhoSalvo) {
            const confirmar = window.confirm('Existe um rascunho salvo. Deseja continuar de onde parou?');
            if (confirmar) {
                try {
                    const dados = JSON.parse(rascunhoSalvo);
                    setSubestacaoNome(dados.nome || '');
                    setSubestacaoDesc(dados.desc || '');
                    setSubestacaoTipo(dados.tipo || '');
                    setSubestacaoStep(dados.step || 1);
                    setSubestacaoConfig(dados.config || {
                        postoTransformacao: { potencia: '', tensao: '', items: [] },
                        aterramento: { items: [] },
                        iluminacao: { items: [] },
                        cabineMedicao: { items: [] },
                        condutores: { items: [] },
                        camposPersonalizados: []
                    });
                } catch (e) {
                    console.error('Erro ao carregar rascunho:', e);
                }
            } else {
                // Limpar rascunho se não quiser continuar
                localStorage.removeItem('subestacaoRascunho');
                setSubestacaoNome('');
                setSubestacaoDesc('');
                setSubestacaoTipo('');
                setSubestacaoStep(1);
            }
        } else {
            setSubestacaoNome('');
            setSubestacaoDesc('');
            setSubestacaoTipo('');
            setSubestacaoStep(1);
        }
        
        setIsSubestacaoModalOpen(true);
    };

    const handleCloseSubestacaoModal = () => {
        setIsSubestacaoModalOpen(false);
        setSubestacaoNome('');
        setSubestacaoDesc('');
        setSubestacaoTipo('');
        setSubestacaoStep(1);
        setSubestacaoConfig({
            postoTransformacao: { potencia: '', tensao: '', items: [] },
            aterramento: { items: [] },
            iluminacao: { items: [] },
            cabineMedicao: { items: [] },
            condutores: { items: [] },
            camposPersonalizados: []
        });
    };

    // Salvar como rascunho
    const handleSalvarRascunhoSubestacao = () => {
        const rascunho = {
            nome: subestacaoNome,
            desc: subestacaoDesc,
            tipo: subestacaoTipo,
            step: subestacaoStep,
            config: subestacaoConfig,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('subestacaoRascunho', JSON.stringify(rascunho));
        setRascunhoSalvoMensagem(true);
        
        // Esconder mensagem após 3 segundos
        setTimeout(() => {
            setRascunhoSalvoMensagem(false);
        }, 3000);
    };

    // Funções para gerenciar materiais da subestação
    const handleAddMaterialToTopic = (topic: string, material: MaterialItem, quantity: number) => {
        const newItem: KitProduct = {
            productId: material.id,
            name: material.name,
            price: material.price || 0,
            quantity
        };

        if (topic === 'postoTransformacao' || topic === 'aterramento' || topic === 'iluminacao' || topic === 'cabineMedicao' || topic === 'condutores') {
            setSubestacaoConfig(prev => ({
                ...prev,
                [topic]: {
                    ...prev[topic],
                    items: [...prev[topic].items, newItem]
                }
            }));
        }
        
        setMaterialSearchTerm('');
        setMaterialQuantity(1);
        setIsMaterialDropdownOpen(false);
        setSelectedTopic('');
    };

    const handleRemoveMaterialFromTopic = (topic: string, productId: string) => {
        if (topic === 'postoTransformacao' || topic === 'aterramento' || topic === 'iluminacao' || topic === 'cabineMedicao' || topic === 'condutores') {
            setSubestacaoConfig(prev => ({
                ...prev,
                [topic]: {
                    ...prev[topic],
                    items: prev[topic].items.filter(item => item.productId !== productId)
                }
            }));
        }
    };

    const handleAddCustomField = () => {
        const fieldName = prompt('Nome do campo personalizado:');
        if (fieldName && fieldName.trim()) {
            setSubestacaoConfig(prev => ({
                ...prev,
                camposPersonalizados: [...prev.camposPersonalizados, { nome: fieldName.trim(), items: [] }]
            }));
        }
    };

    const handleRemoveCustomField = (index: number) => {
        setSubestacaoConfig(prev => ({
            ...prev,
            camposPersonalizados: prev.camposPersonalizados.filter((_, i) => i !== index)
        }));
    };

    const handleAddMaterialToCustomField = (index: number, material: MaterialItem, quantity: number) => {
        const newItem: KitProduct = {
            productId: material.id,
            name: material.name,
            price: material.price || 0,
            quantity
        };

        setSubestacaoConfig(prev => ({
            ...prev,
            camposPersonalizados: prev.camposPersonalizados.map((field, i) => 
                i === index ? { ...field, items: [...field.items, newItem] } : field
            )
        }));
        
        setMaterialSearchTerm('');
        setMaterialQuantity(1);
        setIsMaterialDropdownOpen(false);
        setSelectedTopic('');
    };

    const handleRemoveMaterialFromCustomField = (fieldIndex: number, productId: string) => {
        setSubestacaoConfig(prev => ({
            ...prev,
            camposPersonalizados: prev.camposPersonalizados.map((field, i) => 
                i === fieldIndex ? { ...field, items: field.items.filter(item => item.productId !== productId) } : field
            )
        }));
    };
    
    const handleOpenCaixasModal = () => {
        setTempCaixaQuantities(kitConfig.medidores?.caixasPolicarbonato?.reduce((acc, item) => ({...acc, [item.id]: item.quantity }), {}) || {});
        setIsCaixasModalOpen(true);
    };
    
    const handleConfirmCaixasSelection = () => {
        const newSelections = Object.entries(tempCaixaQuantities)
            .filter(([, quantity]) => quantity > 0)
            .map(([id, quantity]) => ({ id, quantity }));
        handleKitConfigChange('medidores.caixasPolicarbonato', newSelections);
        setIsCaixasModalOpen(false);
    };

    const handleKitConfigChange = (field: string, value: any) => {
        setKitConfig(prev => {
            const keys = field.split('.');
            let temp = { ...prev };
            let current: any = temp;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined || current[keys[i]] === null) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return temp;
        });
    };
    
    const kitBuilderPrice = useMemo(() => {
        let total = 0;
        const addPrice = (id?: string, qty = 1) => {
            if (!id) return;
            const material = materials.find(m => m.id === id);
            if (material?.price) {
                total += material.price * qty;
            }
        };

        if (kitConfig.kitType === 'medidores' && kitConfig.medidores) {
            if (kitConfig.medidores.materialType === 'aluminio') {
                addPrice(kitConfig.medidores.quadroAluminioId);
            } else if (kitConfig.medidores.materialType === 'policarbonato') {
                kitConfig.medidores.caixasPolicarbonato?.forEach(c => {
                    const caixa = caixasPolicarbonatoData.find(pc => pc.id === c.id);
                    if (caixa) total += caixa.price * c.quantity;
                });
            }
        } else if (kitConfig.kitType === 'comando' && kitConfig.comando) {
             addPrice(kitConfig.comando.baseQuadroId);
             kitConfig.comando.items?.forEach(item => addPrice(item.productId, item.quantity));
        }

        // Common parts
        addPrice(kitConfig.disjuntorGeralId);
        kitConfig.disjuntoresIndividuais?.forEach(dj => {
            if (kitConfig.medidores) {
                addPrice(dj.id, dj.quantityPerMeter * kitConfig.medidores.numMedidores);
            }
        });
        kitConfig.cabos?.items.forEach(c => addPrice(c.id, c.quantity));
        addPrice(kitConfig.dpsId);
        kitConfig.acabamentos?.parafusos?.forEach(p => addPrice(p.id, p.quantity));
        if (kitConfig.acabamentos?.terminais?.id) {
            addPrice(kitConfig.acabamentos.terminais.id, kitConfig.acabamentos.terminais.quantity);
        }

        return total;
    }, [kitConfig]);
    
    const buildKitProductsFromConfig = (): KitProduct[] => {
        const products: KitProduct[] = [];
        const addProduct = (id?: string, qty = 1) => {
            if (!id) return;
            const allItems = [...materials];
            const item = allItems.find(m => m.id === id);
            if (item?.price) {
                products.push({ productId: item.id, name: item.name, price: item.price, quantity: qty });
            }
        };

        if (kitConfig.kitType === 'medidores' && kitConfig.medidores) {
            if (kitConfig.medidores.materialType === 'aluminio') {
                addProduct(kitConfig.medidores.quadroAluminioId);
            } else if (kitConfig.medidores.materialType === 'policarbonato') {
                kitConfig.medidores.caixasPolicarbonato?.forEach(c => addProduct(c.id, c.quantity));
            }
        } else if (kitConfig.kitType === 'comando' && kitConfig.comando) {
             addProduct(kitConfig.comando.baseQuadroId);
             kitConfig.comando.items?.forEach(item => addProduct(item.productId, item.quantity));
        }

        addProduct(kitConfig.disjuntorGeralId);
        kitConfig.disjuntoresIndividuais?.forEach(dj => {
            if (kitConfig.medidores) {
                addProduct(dj.id, dj.quantityPerMeter * kitConfig.medidores.numMedidores);
            }
        });
        kitConfig.cabos?.items.forEach(c => addProduct(c.id, c.quantity));
        addProduct(kitConfig.dpsId);
        kitConfig.acabamentos?.parafusos?.forEach(p => addProduct(p.id, p.quantity));
        if (kitConfig.acabamentos?.terminais?.id) {
            addProduct(kitConfig.acabamentos.terminais.id, kitConfig.acabamentos.terminais.quantity);
        }

        return products;
    };


    const handleKitFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalProducts = buildKitProductsFromConfig();
        
        if (itemToEdit && itemToEdit.type === CatalogItemType.Kit) {
            const updatedKit: Kit = {
                ...(itemToEdit as Kit),
                name: newKitName,
                description: newKitDesc,
                products: finalProducts,
                price: kitBuilderPrice,
                configuration: kitConfig,
            };
            setCatalogItems(prev => prev.map(item => item.id === itemToEdit.id ? updatedKit : item));
        } else {
            const newKit: Kit = {
                id: `KIT-${String(catalogItems.filter(i => i.type === CatalogItemType.Kit).length + 1).padStart(3, '0')}`,
                type: CatalogItemType.Kit,
                name: newKitName,
                description: newKitDesc,
                products: finalProducts,
                services: [],
                price: kitBuilderPrice,
                imageUrl: undefined,
                configuration: kitConfig,
            };
            setCatalogItems(prev => [newKit, ...prev]);
        }
        
        handleCloseKitModal();
    };

    const disjuntoresGerais = useMemo(() => materials.filter(m => m.subType === 'Disjuntor Geral' && (m.properties?.amperage ?? 0) >= 50 && m.properties?.breakingCapacity === '6KA'), []);
    const disjuntoresIndividuais = useMemo(() => materials.filter(m => m.subType === 'Disjuntor Individual'), []);
    const cabosFlexiveis = useMemo(() => materials.filter(m => m.subType === 'Cabo Flexível'), []);
    const cabosRigidos = useMemo(() => materials.filter(m => m.subType === 'Cabo Rígido'), []);
    const todosCabos = useMemo(() => materials.filter(m => m.subType === 'Cabo Flexível' || m.subType === 'Cabo Rígido'), []);
    const dpsItems = useMemo(() => materials.filter(m => m.subType === 'DPS'), []);
    const parafusosItems = useMemo(() => materials.filter(m => m.subType === 'Parafuso'), []);
    const terminaisCompressao = useMemo(() => materials.filter(m => m.subType === 'Terminal de Compressão'), []);
    const terminaisTubulares = useMemo(() => materials.filter(m => m.subType === 'Terminal Tubular'), []);
    
    // Filtro de cabos baseado na busca do usuário
    const filteredCabos = useMemo(() => {
        if (!caboSearch.trim()) return [];
        return todosCabos.filter(cabo => 
            cabo.name.toLowerCase().includes(caboSearch.toLowerCase()) ||
            cabo.sku.toLowerCase().includes(caboSearch.toLowerCase()) ||
            cabo.subType?.toLowerCase().includes(caboSearch.toLowerCase())
        ).slice(0, 10); // Limitar a 10 resultados
    }, [caboSearch, todosCabos]);
    
    // Filtro de materiais para subestações - TODOS os materiais, sem filtro por categoria
    const filteredMaterials = useMemo(() => {
        if (!materialSearchTerm) return [];
        return materials.filter(m => 
            m.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
            m.sku.toLowerCase().includes(materialSearchTerm.toLowerCase())
        ).slice(0, 30); // Mostrar até 30 resultados
    }, [materialSearchTerm]);

    // Serviços filtrados (quando seção Serviços estiver ativa)
    const filteredServices = useMemo(() => {
        const term = servicesSearchTerm.trim().toLowerCase();
        if (!term) return services;
        return services.filter(s =>
            s.name.toLowerCase().includes(term) ||
            (s.internalCode || '').toLowerCase().includes(term) ||
            (s.description || '').toLowerCase().includes(term)
        );
    }, [servicesSearchTerm]);

    // Calcular preço total da subestação
    const subestacaoTotalPrice = useMemo(() => {
        let total = 0;
        
        // Itens dos tópicos fixos
        total += subestacaoConfig.postoTransformacao.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        total += subestacaoConfig.aterramento.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        total += subestacaoConfig.iluminacao.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        total += subestacaoConfig.cabineMedicao.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        total += subestacaoConfig.condutores.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Itens dos campos personalizados
        subestacaoConfig.camposPersonalizados.forEach(field => {
            field.items.forEach(item => {
                total += item.price * item.quantity;
            });
        });
        
        return total;
    }, [subestacaoConfig]);
    
    const STEPS = ["Info", "Estrutura", "Disjuntor Geral", "Disjuntores", "DPS", "Acabamentos", "Terminais"];

    // Multi-item handlers
    const handleAddDisjuntorIndividual = () => {
        if (!disjuntorIndividualToAdd.id || (kitConfig.disjuntoresIndividuais || []).some(dj => dj.id === disjuntorIndividualToAdd.id)) return;
        handleKitConfigChange('disjuntoresIndividuais', [...(kitConfig.disjuntoresIndividuais || []), disjuntorIndividualToAdd]);
        setDisjuntorIndividualToAdd({ id: '', quantityPerMeter: 1 });
    };
    const handleRemoveDisjuntorIndividual = (id: string) => {
        handleKitConfigChange('disjuntoresIndividuais', (kitConfig.disjuntoresIndividuais || []).filter(dj => dj.id !== id));
    };

    // Adicionar cabo do estoque via autocomplete
    const handleAddCaboFromSearch = (cabo: MaterialItem) => {
        // Verificar se já existe
        if ((kitConfig.cabos?.items || []).some((c: any) => c.materialId === cabo.id)) {
            alert('Este cabo já foi adicionado!');
            return;
        }
        
        // Adicionar cabo do estoque real
        const novoCabo = {
            id: `cabo-${Date.now()}`,
            materialId: cabo.id,
            materialName: cabo.name,
            materialSku: cabo.sku,
            bitola: '10mm²', // Extrair da nome se possível
            cor: 'Preto/Vermelho/Azul',
            tipo: cabo.subType || 'HEPR Rígido',
            quantidade: 10,
            precoUnitario: cabo.price || 0,
            isCustom: true
        };
        
        handleKitConfigChange('cabos.items', [...(kitConfig.cabos?.items || []), novoCabo]);
        setCaboSearch('');
    };
    
    const handleRemoveCabo = (id: string) => {
        handleKitConfigChange('cabos.items', (kitConfig.cabos?.items || []).filter(c => c.id !== id));
    };

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Catálogo</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de produtos e kits</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => handleOpenProductModal()} className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Criar Kit
                    </button>
                    <button onClick={() => handleOpenKitModal()} className="flex items-center justify-center bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-gray-50 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Criar Quadros
                    </button>
                    <button onClick={() => handleOpenSubestacaoModal()} className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:from-green-700 hover:to-green-800 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Kit Subestações
                    </button>
                </div>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                {/* Navegação Interna */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="inline-flex items-center rounded-xl border border-brand-gray-200 bg-white p-1">
                        <button
                            onClick={() => setCatalogSection('itens')}
                            className={`px-4 py-2 text-sm rounded-lg ${catalogSection === 'itens' ? 'bg-brand-gray-100 font-semibold' : 'hover:bg-brand-gray-50'}`}
                        >
                            Itens do Catálogo
                        </button>
                        <button
                            onClick={() => setCatalogSection('servicos')}
                            className={`px-4 py-2 text-sm rounded-lg ${catalogSection === 'servicos' ? 'bg-brand-gray-100 font-semibold' : 'hover:bg-brand-gray-50'}`}
                        >
                            Serviços
                        </button>
                    </div>
                    {catalogSection === 'servicos' && (
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Buscar serviços (nome, código)..."
                                value={servicesSearchTerm}
                                onChange={(e) => setServicesSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                        </div>
                    )}
                </div>
                {/* Seção: Itens do Catálogo */}
                {catalogSection === 'itens' && (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-brand-gray-600">Filtrar por:</span>
                            <select 
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value as CatalogItemType | 'Todos')}
                                className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                            >
                                <option value="Todos">Todos</option>
                                <option value={CatalogItemType.Produto}>Produtos</option>
                                <option value={CatalogItemType.Kit}>Kits</option>
                            </select>
                        </div>
                        <div className="flex items-center p-1 bg-brand-gray-100 rounded-lg">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-blue' : 'text-brand-gray-500 hover:text-brand-gray-800'}`}>
                                <Squares2x2Icon className="w-5 h-5" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-blue' : 'text-brand-gray-500 hover:text-brand-gray-800'}`}>
                                <ListBulletIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {/* Seção: Serviços */}
                {catalogSection === 'servicos' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredServices.map(s => (
                                <div key={s.id} className="p-4 rounded-xl border border-brand-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-brand-gray-800">{s.name}</h3>
                                        {s.internalCode && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gray-100 text-brand-gray-700">{s.internalCode}</span>
                                        )}
                                    </div>
                                    {s.description && (
                                        <p className="text-sm text-brand-gray-600 mb-2 line-clamp-3">{s.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-brand-gray-500">Tipo: {s.type}</span>
                                        <span className="text-base font-bold text-brand-gray-900">R$ {s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {catalogSection === 'itens' && (
                <div>
                    {viewMode === 'list' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-brand-gray-200">
                                <thead className="bg-brand-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Item</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Detalhes</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Preço</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-brand-gray-200">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-brand-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12 rounded-md bg-brand-gray-100 flex items-center justify-center">
                                                        {item.type === CatalogItemType.Kit ? (
                                                             <CubeIcon className="w-7 h-7 text-brand-gray-400" />
                                                        ) : (
                                                             <img className="h-12 w-12 rounded-md object-cover" src={item.imageUrl || 'https://picsum.photos/seed/placeholder/200'} alt={item.name} />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-brand-gray-900">{item.name}</div>
                                                        <div className="text-sm text-brand-gray-500">{item.type === CatalogItemType.Produto ? `SKU: ${item.sku}` : `ID: ${item.id}`}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === CatalogItemType.Produto ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">
                                                {item.type === CatalogItemType.Produto ? `${item.stock} em estoque` : `${(item.products.length + item.services.length)} itens no kit`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-800 font-semibold">
                                                R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="relative inline-block text-left">
                                                    <button onClick={() => setOpenDropdownId(item.id === openDropdownId ? null : item.id)} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                                    </button>
                                                     {openDropdownId === item.id && (
                                                        <div ref={el => { dropdownRefs.current[item.id] = el; }} className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleOpenViewModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100"><EyeIcon className="w-4 h-4" /> Visualizar</a>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); if (item.type === CatalogItemType.Produto) handleOpenProductModal(item as Product); if (item.type === CatalogItemType.Kit) handleOpenKitModal(item as Kit); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100"><PencilIcon className="w-4 h-4" /> Editar</a>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><TrashIcon className="w-4 h-4" /> Excluir</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map(item => (
                                <div key={item.id} className="bg-white rounded-lg border border-brand-gray-200 shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-xl hover:border-brand-blue/30">
                                    {/* Header com ícone para produtos */}
                                    {item.type === CatalogItemType.Produto && (
                                        <div className="relative h-24 w-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    {/* Header com ícone para kits */}
                                    {item.type === CatalogItemType.Kit && (
                                        <div className="relative h-24 w-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                            <CubeIcon className="w-16 h-16 text-white/90"/>
                                        </div>
                                    )}
                                    
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-brand-gray-800 leading-tight flex-1 pr-2">{item.name}</h3>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow ${item.type === CatalogItemType.Produto ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{item.type}</span>
                                        </div>
                                        <p className="text-xs text-brand-gray-500 mb-2">{item.type === CatalogItemType.Produto ? `SKU: ${item.sku}` : `ID: ${item.id}`}</p>
                                        
                                        {/* Descrição resumida */}
                                        <p className="text-sm text-brand-gray-600 mb-3 line-clamp-2 flex-grow">{item.description || 'Sem descrição'}</p>
                                        
                                        <div className="mt-auto pt-3 border-t border-brand-gray-100 space-y-3">
                                            <div className="flex justify-between items-baseline">
                                                <p className="text-xl font-bold text-brand-blue">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                <p className="text-sm text-brand-gray-600">
                                                    {item.type === CatalogItemType.Produto ? `${item.stock} em estoque` : `${(item.products.length + (item.services?.length || 0))} itens`}
                                                </p>
                                            </div>
                                            
                                            {/* Botões de ação */}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleOpenViewModal(item)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors font-medium text-sm"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    Visualizar
                                                </button>
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setOpenDropdownId(item.id === openDropdownId ? null : item.id)} 
                                                        className="p-2 rounded-lg border border-brand-gray-300 text-brand-gray-700 hover:bg-brand-gray-100 transition-colors"
                                                    >
                                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                                    </button>
                                                    {openDropdownId === item.id && (
                                                        <div ref={el => { dropdownRefs.current[item.id] = el; }} className="origin-top-right absolute right-0 bottom-full mb-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                            <a href="#" onClick={(e) => { e.preventDefault(); if (item.type === CatalogItemType.Produto) handleOpenProductModal(item as Product); if (item.type === CatalogItemType.Kit) handleOpenKitModal(item as Kit); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100"><PencilIcon className="w-4 h-4" /> Editar</a>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><TrashIcon className="w-4 h-4" /> Excluir</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Create Kit Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" aria-modal="true" role="dialog">
                    <form onSubmit={handleProductFormSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col border border-gray-200/50 animate-in zoom-in-95 duration-300">
                        {/* Header com Gradiente */}
                        <div className="p-6 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <CubeIcon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Criar Novo Kit</h2>
                                    <p className="text-sm text-white/80">Monte seu kit personalizado</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCloseProductModal} className="p-2 rounded-xl text-white/90 hover:bg-white/20 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Informações Básicas */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Informações do Kit
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="kitNome" className="block text-sm font-semibold text-gray-700 mb-2">Nome do Kit *</label>
                                        <input 
                                            type="text" 
                                            id="kitNome" 
                                            value={kitNome} 
                                            onChange={e => setKitNome(e.target.value)} 
                                            placeholder="Ex: Kit Residencial Completo"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="kitDescricao" className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                                        <textarea 
                                            id="kitDescricao" 
                                            value={kitDescricao} 
                                            onChange={e => setKitDescricao(e.target.value)} 
                                            rows={3} 
                                            placeholder="Descreva as características e aplicações do kit..."
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Composição do Kit */}
                            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-5 border border-blue-200/50">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Composição do Kit *
                                </h3>

                                {/* Campo de Busca */}
                                <div ref={composicaoDropdownRef} className="relative mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Item</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                value={composicaoSearch}
                                                onChange={e => {
                                                    setComposicaoSearch(e.target.value);
                                                    setIsComposicaoDropdownOpen(true);
                                                }}
                                                onFocus={() => composicaoSearch && setIsComposicaoDropdownOpen(true)}
                                                placeholder="Busque por nome ou código do material/kit..."
                                                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            
                                            {/* Dropdown de Resultados */}
                                            {isComposicaoDropdownOpen && itensDisponiveis.length > 0 && (
                                                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                                                    {itensDisponiveis.map(item => (
                                                        <div 
                                                            key={item.id}
                                                            onClick={() => handleAddItemToComposicao(item, composicaoQuantity)}
                                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                                                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                                        <span>ID: {item.id}</span>
                                                                        {'stock' in item && <span className="text-gray-400">|</span>}
                                                                        {'stock' in item && <span>Estoque: {item.stock}</span>}
                                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                                                            {'stock' in item ? 'Material' : 'Kit'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-3 text-right">
                                                                    <div className="text-blue-600 font-semibold text-sm">
                                                                        R$ {item.price?.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {isComposicaoDropdownOpen && composicaoSearch && itensDisponiveis.length === 0 && (
                                                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-center">
                                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-gray-500 text-sm">Nenhum item encontrado</p>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="number" 
                                            value={composicaoQuantity}
                                            onChange={e => setComposicaoQuantity(parseInt(e.target.value) || 1)}
                                            min="1"
                                            placeholder="Qtd"
                                            className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Lista de Itens Adicionados */}
                                {kitComposicao.length > 0 ? (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Itens no Kit ({kitComposicao.length})
                                        </label>
                                        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                            {kitComposicao.map((item) => (
                                                <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium flex-shrink-0">
                                                                    {item.type === 'material' ? 'Material' : item.type === 'produto' ? 'Produto' : 'Kit'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                <span>ID: {item.id}</span>
                                                                <span className="text-gray-400">|</span>
                                                                <span>R$ {item.unitPrice.toFixed(2)} / un</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateQuantityInComposicao(item.id, item.quantity - 1)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                                                >
                                                                    -
                                                                </button>
                                                                <input 
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={e => handleUpdateQuantityInComposicao(item.id, parseInt(e.target.value) || 0)}
                                                                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    min="1"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateQuantityInComposicao(item.id, item.quantity + 1)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <div className="text-right min-w-[100px]">
                                                                <div className="text-base font-bold text-blue-600">
                                                                    R$ {item.total.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRemoveItemFromComposicao(item.id)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Remover"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                        <CubeIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500 font-medium">Nenhum item adicionado</p>
                                        <p className="text-sm text-gray-400 mt-1">Use o campo de busca acima para adicionar itens</p>
                                    </div>
                                )}
                            </div>

                            {/* Cálculos */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Precificação
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Custo Total</label>
                                        <div className="text-2xl font-bold text-gray-900">
                                            R$ {kitCustoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Soma de todos os itens</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Margem de Lucro (%)</label>
                                        <input 
                                            type="number" 
                                            value={kitMargemLucro}
                                            onChange={e => setKitMargemLucro(parseFloat(e.target.value) || 0)}
                                            min="0"
                                            max="1000"
                                            step="0.1"
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold text-lg"
                                        />
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
                                        <label className="block text-sm font-medium text-white/90 mb-2">Preço de Venda</label>
                                        <div className="text-2xl font-bold">
                                            R$ {kitPrecoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                        <p className="text-xs text-white/80 mt-1">
                                            Lucro: R$ {(kitPrecoVenda - kitCustoTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Preencha todos os campos obrigatórios (*)</span>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={handleCloseProductModal} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                                    Criar Kit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-brand-gray-800">Confirmar Exclusão</h2>
                            <p className="text-sm text-brand-gray-600 mt-2">
                                Você tem certeza que deseja excluir o item <strong className="text-brand-gray-800">{itemToDelete.name}</strong>?
                                <br />
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg shadow-sm hover:bg-brand-red/90"
                            >
                                Confirmar Exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Item Modal */}
            {itemToView && (
                <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-gray-200/50 animate-in zoom-in-95 duration-300">
                        {/* Header com Gradiente */}
                        <div className={`p-6 rounded-t-2xl flex justify-between items-center ${itemToView.type === CatalogItemType.Produto ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-purple-600 to-purple-700'}`}>
                            <div className="flex items-center gap-3">
                                {itemToView.type === CatalogItemType.Produto ? (
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <CubeIcon className="w-7 h-7 text-white" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{itemToView.name}</h2>
                                    <p className="text-sm text-white/80">
                                        {itemToView.type === CatalogItemType.Produto ? `SKU: ${itemToView.sku}` : `ID: ${itemToView.id}`}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCloseViewModal} className="p-2 rounded-xl text-white/90 hover:bg-white/20 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Informações Principais */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Preço */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            R$ {itemToView.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {/* Descrição */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Descrição
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {itemToView.description || 'Sem descrição disponível'}
                                        </p>
                                    </div>
                                </div>

                                {/* Card de Estatísticas */}
                                <div className="space-y-4">
                                    {itemToView.type === CatalogItemType.Produto && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                Informações do Produto
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <span className="text-sm text-gray-600">Estoque Disponível</span>
                                                    <span className="text-lg font-bold text-blue-600">{itemToView.stock}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <span className="text-sm text-gray-600">SKU</span>
                                                    <span className="text-sm font-semibold text-gray-800">{itemToView.sku}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {itemToView.type === CatalogItemType.Kit && (
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <CubeIcon className="w-5 h-5 text-purple-600" />
                                                Resumo do Kit
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <span className="text-sm text-gray-600">Total de Produtos</span>
                                                    <span className="text-lg font-bold text-purple-600">{itemToView.products.length}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <span className="text-sm text-gray-600">Total de Serviços</span>
                                                    <span className="text-lg font-bold text-purple-600">{itemToView.services?.length || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                    <span className="text-sm text-gray-600">Total de Itens</span>
                                                    <span className="text-lg font-bold text-purple-600">{itemToView.products.length + (itemToView.services?.length || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detalhamento dos Itens do Kit */}
                            {itemToView.type === CatalogItemType.Kit && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Composição do Kit
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Produtos */}
                                        {itemToView.products.length > 0 && (
                                            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-5 border border-blue-200/50">
                                                <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                    Produtos ({itemToView.products.length})
                                                </h5>
                                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                                    {itemToView.products.map((p, idx) => (
                                                        <div key={p.productId} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">ID: {p.productId}</p>
                                                                </div>
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                                    {p.quantity}x
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                                <span className="text-sm text-gray-600">Valor unitário: R$ {p.price.toFixed(2)}</span>
                                                                <span className="text-base font-bold text-blue-600">
                                                                    R$ {(p.price * p.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 pt-4 border-t-2 border-blue-300">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-700">Subtotal Produtos:</span>
                                                        <span className="text-xl font-bold text-blue-600">
                                                            R$ {itemToView.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Serviços */}
                                        {itemToView.services && itemToView.services.length > 0 && (
                                            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-5 border border-green-200/50">
                                                <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Serviços ({itemToView.services.length})
                                                </h5>
                                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                                    {itemToView.services.map((s, idx) => (
                                                        <div key={s.serviceId} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">{s.name}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">ID: {s.serviceId}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end pt-2 border-t border-gray-100">
                                                                <span className="text-base font-bold text-green-600">
                                                                    R$ {s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 pt-4 border-t-2 border-green-300">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-700">Subtotal Serviços:</span>
                                                        <span className="text-xl font-bold text-green-600">
                                                            R$ {itemToView.services.reduce((sum, s) => sum + s.price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{itemToView.type === CatalogItemType.Produto ? 'Produto cadastrado no sistema' : 'Kit personalizado'}</span>
                            </div>
                            <button type="button" onClick={handleCloseViewModal} className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Kit Modal -> Kit Builder */}
            {isKitModalOpen && (
                 <div 
                    className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" 
                    aria-modal="true" 
                    role="dialog"
                    onClick={(e) => {
                        // Fecha ao clicar no backdrop (fundo)
                        if (e.target === e.currentTarget) {
                            handleCloseKitModal();
                        }
                    }}
                 >
                    <form 
                        onSubmit={handleKitFormSubmit} 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-gray-200/50 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header com Gradiente */}
                        <div className="relative p-6 bg-gradient-to-r from-brand-blue to-blue-600 text-white flex justify-between items-center flex-shrink-0 rounded-t-2xl">
                            <div>
                                <h2 className="text-2xl font-bold">{itemToEdit ? '✏️ Editar Kit' : '🛠️ Construtor de Kit'}</h2>
                                <p className="text-blue-100 text-sm mt-1">Configure seu kit de forma inteligente</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCloseKitModal();
                                }} 
                                className="relative z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Fechar modal"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                            {/* Decoração */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                        </div>

                        {/* Stepper Moderno */}
                        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white">
                            <nav aria-label="Progress">
                                <ol role="list" className="flex items-center justify-between">
                                    {STEPS.map((stepName, stepIdx) => (
                                    <li key={stepName} className="relative flex-1 group">
                                        {/* Linha conectora */}
                                        {stepIdx !== STEPS.length - 1 && (
                                            <div className="absolute top-4 left-1/2 w-full h-0.5 -ml-px">
                                                <div className={`h-full transition-all duration-500 ${stepIdx < currentStep ? 'bg-gradient-to-r from-brand-blue to-blue-500' : 'bg-gray-200'}`} />
                                            </div>
                                        )}
                                        
                                        {/* Step indicator */}
                                        <div className="relative flex flex-col items-center">
                                            {stepIdx < currentStep ? (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setCurrentStep(stepIdx + 1)} 
                                                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-110 transition-all duration-200"
                                                >
                                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            ) : stepIdx === currentStep ? (
                                                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-3 border-brand-blue bg-white shadow-lg ring-4 ring-blue-100 animate-pulse">
                                                    <span className="h-3 w-3 rounded-full bg-gradient-to-br from-brand-blue to-blue-600" />
                                                </div>
                                            ) : (
                                                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-md">
                                                    <span className="text-sm font-semibold text-gray-400">{stepIdx + 1}</span>
                                                </div>
                                            )}
                                            
                                            {/* Label */}
                                            <span className={`mt-2 text-xs font-medium text-center ${stepIdx === currentStep ? 'text-brand-blue' : stepIdx < currentStep ? 'text-gray-700' : 'text-gray-400'} transition-colors duration-200`}>
                                                {stepName}
                                            </span>
                                        </div>
                                    </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                            {/* Step 1 */}
                            {currentStep === 1 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">1. Informações Básicas do Kit</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nome do Kit</label>
                                                <input type="text" value={newKitName} onChange={e => setNewKitName(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Tipo de Kit</label>
                                                <select value={kitConfig.kitType} onChange={e => handleKitConfigChange('kitType', e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white" required>
                                                    <option value="">Selecione...</option>
                                                    <option value="medidores">Quadro de Medição</option>
                                                    <option value="comando">Quadro de Comando</option>
                                                    <option value="quadro-eletrico">Quadro Elétrico</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-1">Descrição do Kit</label>
                                            <textarea value={newKitDesc} onChange={e => setNewKitDesc(e.target.value)} rows={2} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                        </div>
                                        {kitConfig.kitType === 'medidores' && (
                                            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl shadow-sm">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
                                                <div className="relative flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                                                        <span className="text-xl">🤖</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-blue-900 mb-1">Modo Assistido Ativado</p>
                                                        <p className="text-sm text-blue-700">
                                                            As próximas etapas terão campos pré-preenchidos automaticamente baseados nas melhores práticas da S3E Engenharia. Você pode editar qualquer campo conforme necessário.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {(kitConfig.kitType === 'comando' || kitConfig.kitType === 'quadro-eletrico') && (
                                            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl shadow-sm">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
                                                <div className="relative flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                                                        <span className="text-xl">⚙️</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-purple-900 mb-1">Modo Personalizado</p>
                                                        <p className="text-sm text-purple-700">
                                                            Configure este kit de forma totalmente personalizada, adicionando os componentes necessários manualmente.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                             {/* Step 2 */}
                             {currentStep === 2 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">
                                        2. {kitConfig.kitType === 'medidores' ? 'Configuração do Quadro de Medidores' : 'Estrutura Base'}
                                    </h3>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-1">Material do Quadro</label>
                                            <select value={kitConfig.medidores?.materialType} onChange={e => handleKitConfigChange('medidores.materialType', e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white">
                                                <option value="">Selecione...</option>
                                                <option value="aluminio">Alumínio</option>
                                                <option value="policarbonato">Policarbonato</option>
                                            </select>
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-1">Quantidade de Medidores</label>
                                            <input type="number" value={kitConfig.medidores?.numMedidores} onChange={e => handleKitConfigChange('medidores.numMedidores', parseInt(e.target.value))} min="1" className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                        </div>
                                    </div>
                                    {kitConfig.medidores?.materialType === 'aluminio' && (
                                        <div className="space-y-2 mt-4">
                                            <h4 className="font-medium text-brand-gray-700 mb-2">Modelos Disponíveis</h4>
                                            {quadrosAluminioData.filter(q => q.capacidade >= (kitConfig.medidores?.numMedidores || 1)).map(q => (
                                                <label key={q.id} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${kitConfig.medidores?.quadroAluminioId === q.id ? 'bg-blue-100 border border-blue-300' : 'bg-brand-gray-50 hover:bg-brand-gray-100'}`}>
                                                    <input type="radio" name="aluminioQuadro" value={q.id} checked={kitConfig.medidores?.quadroAluminioId === q.id} onChange={() => handleKitConfigChange('medidores.quadroAluminioId', q.id)} className="h-4 w-4 text-brand-blue focus:ring-brand-blue" />
                                                    <span className="ml-3 text-sm font-medium text-brand-gray-800">{q.name} - R$ {q.price.toFixed(2)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {kitConfig.medidores?.materialType === 'policarbonato' && (
                                        <div className="mt-4">
                                            <button type="button" onClick={handleOpenCaixasModal} className="px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600">Selecionar Caixas</button>
                                            {(kitConfig.medidores?.caixasPolicarbonato?.length ?? 0) > 0 && (
                                                <div className="mt-4 space-y-2"><h4 className="font-medium text-brand-gray-700">Caixas Selecionadas:</h4>{kitConfig.medidores?.caixasPolicarbonato?.map(s => <div key={s.id} className="p-2 bg-brand-gray-50 rounded-md">{s.quantity}x {caixasPolicarbonatoData.find(c=>c.id === s.id)?.name}</div>)}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3 */}
                            {currentStep === 3 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">3. Disjuntor Geral</h3>
                                    {kitConfig.kitType === 'medidores' && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl flex items-center gap-3 shadow-sm">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">💡</span>
                                            </div>
                                            <p className="text-sm text-blue-800">
                                                <strong>Modo Assistido:</strong> Seleções baseadas em padrões técnicos
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-3">Tipo de Disjuntor Geral</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => handleKitConfigChange('disjuntorGeralTipo', 'caixa-moldada')}
                                                className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                                                    kitConfig.disjuntorGeralTipo === 'caixa-moldada'
                                                        ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                                        : 'border-brand-gray-300 bg-white text-brand-gray-700 hover:border-brand-gray-400'
                                                }`}
                                            >
                                                Caixa Moldada
                                                <span className="block text-xs font-normal mt-1 opacity-75">(Tripolar)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleKitConfigChange('disjuntorGeralTipo', 'din')}
                                                className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                                                    kitConfig.disjuntorGeralTipo === 'din'
                                                        ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                                        : 'border-brand-gray-300 bg-white text-brand-gray-700 hover:border-brand-gray-400'
                                                }`}
                                            >
                                                Disjuntor DIN
                                                <span className="block text-xs font-normal mt-1 opacity-75">(Configurável)</span>
                                            </button>
                                        </div>
                                    </div>

                                    {kitConfig.disjuntorGeralTipo === 'din' && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-3">Polaridade</label>
                                            <div className="flex gap-3">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="polaridadeGeral"
                                                        value="monopolar"
                                                        checked={kitConfig.disjuntorGeralPolaridade === 'monopolar'}
                                                        onChange={() => handleKitConfigChange('disjuntorGeralPolaridade', 'monopolar')}
                                                        className="h-4 w-4 text-brand-blue focus:ring-brand-blue mr-2"
                                                    />
                                                    Monopolar
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="polaridadeGeral"
                                                        value="bipolar"
                                                        checked={kitConfig.disjuntorGeralPolaridade === 'bipolar'}
                                                        onChange={() => handleKitConfigChange('disjuntorGeralPolaridade', 'bipolar')}
                                                        className="h-4 w-4 text-brand-blue focus:ring-brand-blue mr-2"
                                                    />
                                                    Bipolar
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="polaridadeGeral"
                                                        value="tripolar"
                                                        checked={kitConfig.disjuntorGeralPolaridade === 'tripolar'}
                                                        onChange={() => handleKitConfigChange('disjuntorGeralPolaridade', 'tripolar')}
                                                        className="h-4 w-4 text-brand-blue focus:ring-brand-blue mr-2"
                                                    />
                                                    Tripolar
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {kitConfig.disjuntorGeralTipo && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-brand-gray-700 mb-2">Selecione o Disjuntor</h4>
                                            {disjuntoresGerais.map(dj => (
                                                <label key={dj.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${kitConfig.disjuntorGeralId === dj.id ? 'bg-blue-100 border border-blue-300' : 'bg-brand-gray-50 hover:bg-brand-gray-100'} ${dj.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <div className="flex items-center">
                                                        <input type="radio" name="disjuntorGeral" value={dj.id} checked={kitConfig.disjuntorGeralId === dj.id} onChange={() => handleKitConfigChange('disjuntorGeralId', dj.id)} className="h-4 w-4 text-brand-blue focus:ring-brand-blue" disabled={dj.stock <= 0} />
                                                        <span className="ml-3 text-sm font-medium text-brand-gray-800">{dj.name} - R$ {dj.price?.toFixed(2)}</span>
                                                    </div>
                                                    {dj.stock <= 0 && <span className="text-xs font-bold text-red-600">SEM ESTOQUE</span>}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 4 */}
                            {currentStep === 4 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">
                                        4. {kitConfig.kitType === 'medidores' ? 'Disjuntores por Medidor' : 'Disjuntores Individuais'}
                                    </h3>
                                    {kitConfig.kitType === 'medidores' && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-3 shadow-sm">
                                            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">⚡</span>
                                            </div>
                                            <p className="text-sm text-green-800">
                                                <strong>Cabos Automáticos:</strong> Serão calculados conforme amperagem selecionada
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-3">Polaridade dos Disjuntores</label>
                                        <div className="flex gap-3">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="polaridadeIndividual"
                                                    value="monopolar"
                                                    checked={kitConfig.disjuntoresIndividuaisPolaridade === 'monopolar'}
                                                    onChange={() => handleKitConfigChange('disjuntoresIndividuaisPolaridade', 'monopolar')}
                                                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue mr-2"
                                                />
                                                Monopolar
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="polaridadeIndividual"
                                                    value="bipolar"
                                                    checked={kitConfig.disjuntoresIndividuaisPolaridade === 'bipolar'}
                                                    onChange={() => handleKitConfigChange('disjuntoresIndividuaisPolaridade', 'bipolar')}
                                                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue mr-2"
                                                />
                                                Bipolar
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="polaridadeIndividual"
                                                    value="tripolar"
                                                    checked={kitConfig.disjuntoresIndividuaisPolaridade === 'tripolar'}
                                                    onChange={() => handleKitConfigChange('disjuntoresIndividuaisPolaridade', 'tripolar')}
                                                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue mr-2"
                                                />
                                                Tripolar
                                            </label>
                                        </div>
                                    </div>

                                    {kitConfig.disjuntoresIndividuaisPolaridade && (
                                        <>
                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
                                                <div className="grid grid-cols-12 gap-4 items-end">
                                                    <div className="col-span-6">
                                                        <label className="block text-sm font-semibold text-brand-gray-800 mb-2">
                                                            📌 Modelo (Amperagem)
                                                        </label>
                                                        <select 
                                                            value={disjuntorIndividualToAdd.id} 
                                                            onChange={e => setDisjuntorIndividualToAdd({...disjuntorIndividualToAdd, id: e.target.value})} 
                                                            className="w-full px-4 py-3 border-2 border-brand-gray-300 rounded-lg bg-white text-base font-medium focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all"
                                                        >
                                                            <option value="">🔽 Selecione o disjuntor...</option>
                                                            {disjuntoresIndividuais
                                                                .filter(d => {
                                                                    const polaridade = kitConfig.disjuntoresIndividuaisPolaridade;
                                                                    const amperage = d.properties?.amperage || 0;
                                                                    
                                                                    // Filtrar por polaridade e amperagem
                                                                    if (polaridade === 'monopolar') {
                                                                        return [40, 50, 63].includes(amperage);
                                                                    } else if (polaridade === 'bipolar') {
                                                                        return [50, 63].includes(amperage);
                                                                    } else if (polaridade === 'tripolar') {
                                                                        return [40, 50, 63, 70, 90, 100, 125].includes(amperage);
                                                                    }
                                                                    return false;
                                                                })
                                                                .filter(d => !(kitConfig.disjuntoresIndividuais || []).some(added => added.id === d.id))
                                                                .map(dj => (
                                                                    <option key={dj.id} value={dj.id} disabled={dj.stock <= 0}>
                                                                        ⚡ {dj.properties?.amperage}A - {dj.name} {dj.stock <= 0 ? '(❌ SEM ESTOQUE)' : `(✅ ${dj.stock} unid.)`}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="block text-sm font-semibold text-brand-gray-800 mb-2">
                                                            🔢 Qtd. por Medidor
                                                        </label>
                                                        <input 
                                                            type="number" 
                                                            value={disjuntorIndividualToAdd.quantityPerMeter} 
                                                            onChange={e => setDisjuntorIndividualToAdd({...disjuntorIndividualToAdd, quantityPerMeter: parseInt(e.target.value)})} 
                                                            min="1" 
                                                            className="w-full px-4 py-3 border-2 border-brand-gray-300 rounded-lg text-base font-semibold text-center focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all" 
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <button 
                                                            type="button" 
                                                            onClick={handleAddDisjuntorIndividual} 
                                                            className="w-full px-4 py-3 bg-gradient-to-r from-brand-gray-700 to-brand-gray-800 text-white font-bold rounded-lg hover:from-brand-gray-600 hover:to-brand-gray-700 text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                                                            disabled={!disjuntorIndividualToAdd.id}
                                                        >
                                                            <PlusIcon className="w-5 h-5" />
                                                            Adicionar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-xs text-blue-800">
                                                    <strong>Cabos Automáticos:</strong> Os cabos serão adicionados automaticamente baseados na amperagem selecionada.
                                                </p>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                {(kitConfig.disjuntoresIndividuais || []).map(dj => {
                                                    const item = materials.find(m => m.id === dj.id);
                                                    return (
                                                        <div key={dj.id} className="p-2 bg-brand-gray-100 rounded-md flex justify-between items-center text-sm">
                                                            <span>{dj.quantityPerMeter}x {item?.name} (por medidor)</span>
                                                            <button type="button" onClick={() => handleRemoveDisjuntorIndividual(dj.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Seção de Adicionar Cabos do Estoque */}
                                            {(kitConfig.disjuntoresIndividuais || []).length > 0 && (
                                                <div className="mt-6 pt-6 border-t border-brand-gray-200">
                                                    {/* Input de Busca de Cabos */}
                                                    <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                                                        <h4 className="font-bold text-brand-gray-800 mb-3 flex items-center gap-2">
                                                            <span className="text-xl">🔌</span>
                                                            Adicionar Cabos do Estoque
                                                        </h4>
                                                        <div className="relative" ref={caboDropdownRef}>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={caboSearch}
                                                                    onChange={(e) => setCaboSearch(e.target.value)}
                                                                    onFocus={() => caboSearch && setCaboSearch(caboSearch)}
                                                                    placeholder="🔍 Digite para buscar cabos (nome, código, bitola...)"
                                                                    className="w-full px-4 py-3 border-2 border-brand-gray-300 rounded-lg text-base font-medium bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition-all"
                                                                />
                                                                {caboSearch && (
                                                                    <button
                                                                        onClick={() => setCaboSearch('')}
                                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <XMarkIcon className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Dropdown de Resultados */}
                                                            {filteredCabos.length > 0 && (
                                                                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-green-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                                                                    {filteredCabos.map(cabo => (
                                                                        <button
                                                                            key={cabo.id}
                                                                            onClick={() => handleAddCaboFromSearch(cabo)}
                                                                            className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors flex justify-between items-center group"
                                                                        >
                                                                            <div className="flex-1">
                                                                                <p className="font-semibold text-brand-gray-800 group-hover:text-green-700">
                                                                                    {cabo.name}
                                                                                </p>
                                                                                <p className="text-sm text-gray-600 mt-1">
                                                                                    SKU: {cabo.sku} | {cabo.subType}
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-right ml-4">
                                                                                <p className="font-bold text-brand-gray-800">
                                                                                    R$ {cabo.price?.toFixed(2)}
                                                                                </p>
                                                                                <p className={`text-xs font-semibold ${cabo.stock > 10 ? 'text-green-600' : cabo.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                                    {cabo.stock > 0 ? `✅ ${cabo.stock} unid.` : '❌ Sem estoque'}
                                                                                </p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {caboSearch && filteredCabos.length === 0 && (
                                                                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                                                                    Nenhum cabo encontrado com "{caboSearch}"
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-2">
                                                            💡 Dica: Digite o nome, código ou bitola do cabo para encontrá-lo rapidamente no estoque
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Seção de Cabos Calculados */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-semibold text-brand-gray-800 flex items-center gap-2">
                                                            <span className="text-lg">⚡</span>
                                                            Cabos no Kit
                                                        </h4>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {(() => {
                                                            // Calcular cabos automaticamente baseado nos disjuntores
                                                            const cabosCalculados: { [key: string]: { bitola: string; cor: string; tipo: string; quantidade: number } } = {};
                                                            
                                                            (kitConfig.disjuntoresIndividuais || []).forEach(dj => {
                                                                const disjuntor = materials.find(m => m.id === dj.id);
                                                                const amperage = disjuntor?.properties?.amperage || 0;
                                                                const polaridade = kitConfig.disjuntoresIndividuaisPolaridade || '';
                                                                
                                                                let bitola = '10mm²';
                                                                let tipo = 'HEPR Rígido';
                                                                
                                                                // Determinar bitola baseado na amperagem
                                                                if (polaridade === 'tripolar') {
                                                                    if (amperage === 70) bitola = '16mm²';
                                                                    else if (amperage === 90) bitola = '25mm²';
                                                                    else if (amperage === 100 || amperage === 125) {
                                                                        bitola = amperage === 125 ? '35mm²' : '25mm²';
                                                                        tipo = 'HEPR (Flex/Rígido)';
                                                                    }
                                                                }
                                                                
                                                                const numMedidores = kitConfig.medidores?.numMedidores || 1;
                                                                const quantidadePorMedidor = dj.quantityPerMeter;
                                                                
                                                                // Calcular quantidade total de metros necessários
                                                                // Assumindo 2 metros por disjuntor em média
                                                                const metrosPorDisjuntor = 2;
                                                                const quantidadeTotal = numMedidores * quantidadePorMedidor * metrosPorDisjuntor;
                                                                
                                                                // Agrupar por bitola
                                                                const key = `${bitola}-${tipo}`;
                                                                if (cabosCalculados[key]) {
                                                                    cabosCalculados[key].quantidade += quantidadeTotal;
                                                                } else {
                                                                    cabosCalculados[key] = {
                                                                        bitola,
                                                                        cor: 'Preto/Vermelho/Azul',
                                                                        tipo,
                                                                        quantidade: quantidadeTotal
                                                                    };
                                                                }
                                                            });

                                                            // Mesclar cabos calculados com cabos customizados
                                                            const cabosExistentes = kitConfig.cabos?.items || [];
                                                            const todosCabos = [
                                                                ...Object.entries(cabosCalculados).map(([key, cabo], idx) => ({
                                                                    id: `calc-${idx}`,
                                                                    ...cabo,
                                                                    isCalculated: true
                                                                })),
                                                                ...cabosExistentes.filter((c: any) => c.isCustom)
                                                            ];

                                                            return todosCabos.map((cabo: any, idx) => (
                                                                <div key={cabo.id || idx} className="p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-brand-gray-200 rounded-xl hover:border-brand-blue hover:shadow-lg transition-all">
                                                                    <div className="grid grid-cols-12 gap-4 items-center">
                                                                        {/* Tipo/Bitola */}
                                                                        <div className="col-span-3">
                                                                            <label className="block text-sm font-bold text-brand-gray-800 mb-2 flex items-center gap-2">
                                                                                <span>📏 Bitola</span>
                                                                                {cabo.isCalculated && (
                                                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Auto</span>
                                                                                )}
                                                                            </label>
                                                                            <select
                                                                                value={cabo.bitola}
                                                                                onChange={(e) => {
                                                                                    // Se for calculado, converter para customizado ao editar
                                                                                    if (cabo.isCalculated) {
                                                                                        const newCabo = { ...cabo, bitola: e.target.value, isCalculated: false, isCustom: true };
                                                                                        const updated = [...(kitConfig.cabos?.items || []), newCabo];
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    } else {
                                                                                        const updated = (kitConfig.cabos?.items || []).map((c: any) =>
                                                                                            c.id === cabo.id ? { ...c, bitola: e.target.value } : c
                                                                                        );
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    }
                                                                                }}
                                                                                className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg text-base font-medium bg-white hover:border-brand-blue focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all cursor-pointer"
                                                                            >
                                                                                <option value="2.5mm²">2.5mm²</option>
                                                                                <option value="4mm²">4mm²</option>
                                                                                <option value="6mm²">6mm²</option>
                                                                                <option value="10mm²">10mm²</option>
                                                                                <option value="16mm²">16mm²</option>
                                                                                <option value="25mm²">25mm²</option>
                                                                                <option value="35mm²">35mm²</option>
                                                                                <option value="50mm²">50mm²</option>
                                                                            </select>
                                                                        </div>

                                                                        {/* Tipo */}
                                                                        <div className="col-span-3">
                                                                            <label className="block text-sm font-bold text-brand-gray-800 mb-2">
                                                                                ⚡ Tipo
                                                                            </label>
                                                                            <select
                                                                                value={cabo.tipo}
                                                                                onChange={(e) => {
                                                                                    if (cabo.isCalculated) {
                                                                                        const newCabo = { ...cabo, tipo: e.target.value, isCalculated: false, isCustom: true };
                                                                                        const updated = [...(kitConfig.cabos?.items || []), newCabo];
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    } else {
                                                                                        const updated = (kitConfig.cabos?.items || []).map((c: any) =>
                                                                                            c.id === cabo.id ? { ...c, tipo: e.target.value } : c
                                                                                        );
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    }
                                                                                }}
                                                                                className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg text-base font-medium bg-white hover:border-brand-blue focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all cursor-pointer"
                                                                            >
                                                                                <option value="HEPR Rígido">HEPR Rígido</option>
                                                                                <option value="HEPR Flexível">HEPR Flexível</option>
                                                                                <option value="PP">PP</option>
                                                                                <option value="Cordoalha">Cordoalha</option>
                                                                            </select>
                                                                        </div>

                                                                        {/* Cor */}
                                                                        <div className="col-span-3">
                                                                            <label className="block text-sm font-bold text-brand-gray-800 mb-2">
                                                                                🎨 Cor
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                value={cabo.cor}
                                                                                onChange={(e) => {
                                                                                    if (cabo.isCalculated) {
                                                                                        const newCabo = { ...cabo, cor: e.target.value, isCalculated: false, isCustom: true };
                                                                                        const updated = [...(kitConfig.cabos?.items || []), newCabo];
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    } else {
                                                                                        const updated = (kitConfig.cabos?.items || []).map((c: any) =>
                                                                                            c.id === cabo.id ? { ...c, cor: e.target.value } : c
                                                                                        );
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    }
                                                                                }}
                                                                                className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg text-base font-medium hover:border-brand-blue focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all"
                                                                                placeholder="Ex: Preto/Vermelho/Azul"
                                                                            />
                                                                        </div>

                                                                        {/* Quantidade */}
                                                                        <div className="col-span-2">
                                                                            <label className="block text-sm font-bold text-brand-gray-800 mb-2">
                                                                                📐 Metros
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                value={cabo.quantidade}
                                                                                onChange={(e) => {
                                                                                    if (cabo.isCalculated) {
                                                                                        const newCabo = { ...cabo, quantidade: parseInt(e.target.value) || 0, isCalculated: false, isCustom: true };
                                                                                        const updated = [...(kitConfig.cabos?.items || []), newCabo];
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    } else {
                                                                                        const updated = (kitConfig.cabos?.items || []).map((c: any) =>
                                                                                            c.id === cabo.id ? { ...c, quantidade: parseInt(e.target.value) || 0 } : c
                                                                                        );
                                                                                        handleKitConfigChange('cabos.items', updated);
                                                                                    }
                                                                                }}
                                                                                min="1"
                                                                                className="w-full px-4 py-2.5 border-2 border-brand-gray-300 rounded-lg text-base font-bold text-center hover:border-brand-blue focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all"
                                                                            />
                                                                        </div>

                                                                        {/* Ações */}
                                                                        <div className="col-span-1 flex justify-end">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const updated = (kitConfig.cabos?.items || []).filter((c: any) => c.id !== cabo.id);
                                                                                    handleKitConfigChange('cabos.items', updated);
                                                                                }}
                                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                                title="Remover cabo"
                                                                            >
                                                                                <TrashIcon className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {cabo.isCalculated && (
                                                                        <div className="mt-2 pt-2 border-t border-brand-gray-100">
                                                                            <p className="text-xs text-brand-gray-500">
                                                                                💡 Calculado: {kitConfig.medidores?.numMedidores || 1} medidores × {(kitConfig.disjuntoresIndividuais || []).reduce((sum, dj) => sum + dj.quantityPerMeter, 0)} disjuntores × 2m
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>

                                                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                                                        <p className="text-xs text-blue-700">
                                                            <strong>💡 Dica:</strong> Os cabos marcados com "Auto" foram calculados automaticamente, mas você pode editar qualquer campo, adicionar novos cabos ou remover os que não precisar.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                             {/* Step 5 - DPS */}
                             {currentStep === 5 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">5. DPS - Dispositivo de Proteção contra Surtos</h3>
                                    {kitConfig.kitType === 'medidores' && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl flex items-center gap-3 shadow-sm">
                                            <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">🛡️</span>
                                            </div>
                                            <p className="text-sm text-amber-800">
                                                <strong>Pré-configurado:</strong> Valores padrão conforme classe selecionada
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-3">Classe do DPS</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => handleKitConfigChange('dpsClasse', 'classe1')}
                                                className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                                                    kitConfig.dpsClasse === 'classe1'
                                                        ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                                        : 'border-brand-gray-300 bg-white text-brand-gray-700 hover:border-brand-gray-400'
                                                }`}
                                            >
                                                DPS CLASSE 1
                                                <span className="block text-xs font-normal mt-1 opacity-75">60KA Potência Nominal</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleKitConfigChange('dpsClasse', 'classe2')}
                                                className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                                                    kitConfig.dpsClasse === 'classe2'
                                                        ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                                        : 'border-brand-gray-300 bg-white text-brand-gray-700 hover:border-brand-gray-400'
                                                }`}
                                            >
                                                DPS CLASSE 2
                                                <span className="block text-xs font-normal mt-1 opacity-75">20KA Potência Nominal</span>
                                            </button>
                                        </div>
                                    </div>

                                    {kitConfig.dpsClasse && (
                                        <div className="space-y-4 p-4 bg-brand-gray-50 rounded-lg border border-brand-gray-200">
                                            <p className="text-xs text-brand-gray-600 mb-3">
                                                <strong>Nota:</strong> Campos pré-preenchidos conforme padrão. Você pode editá-los conforme necessário.
                                            </p>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-brand-gray-700 mb-1">
                                                        Quantidade de DPS
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={kitConfig.dpsConfig?.quantidade || 3}
                                                        onChange={e => handleKitConfigChange('dpsConfig.quantidade', parseInt(e.target.value))}
                                                        min="1"
                                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-brand-gray-700 mb-1">
                                                        TCM (cm)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={kitConfig.dpsConfig?.tcmQuantidade || 9}
                                                        onChange={e => handleKitConfigChange('dpsConfig.tcmQuantidade', parseInt(e.target.value))}
                                                        min="0"
                                                        step="0.1"
                                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-brand-gray-700 mb-1">
                                                        Terra - Comprimento (cm)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={kitConfig.dpsConfig?.caboTerraComprimento || 30}
                                                        onChange={e => handleKitConfigChange('dpsConfig.caboTerraComprimento', parseInt(e.target.value))}
                                                        min="1"
                                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-brand-gray-700 mb-1">
                                                        Terra - Bitola Cabo Verde
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={kitConfig.dpsConfig?.caboTerraBitola || (kitConfig.dpsClasse === 'classe1' ? '16mm²' : '6mm²')}
                                                        onChange={e => handleKitConfigChange('dpsConfig.caboTerraBitola', e.target.value)}
                                                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                        placeholder="Ex: 16mm²"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-brand-gray-700 mb-1">
                                                    Barramento Tipo Pente Monofásico (quantidade)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={kitConfig.dpsConfig?.barramentoPenteQuantidade || 0}
                                                    onChange={e => handleKitConfigChange('dpsConfig.barramentoPenteQuantidade', parseInt(e.target.value))}
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                />
                                            </div>

                                            {kitConfig.dpsClasse === 'classe2' && (
                                                <div className="pt-4 border-t border-brand-gray-300">
                                                    <h4 className="text-sm font-semibold text-brand-gray-700 mb-2">
                                                        Disjuntores do DPS
                                                    </h4>
                                                    <div className="p-3 bg-white rounded border">
                                                        <p className="text-sm text-brand-gray-700">
                                                            <strong>3x</strong> Disjuntor DIN 25A - 10KA Monopolar
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                             {/* Step 6 - Acabamentos */}
                             {currentStep === 6 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">6. Acabamentos</h3>
                                    
                                    <div className="space-y-6">
                                        {/* Parafusos e Arruelas */}
                                        <div>
                                            <h4 className="font-semibold text-brand-gray-700 mb-3">Parafusos e Arruelas</h4>
                                            <div className="relative mb-3">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar parafusos, arruelas..."
                                                    value={acabamentoSearch}
                                                    onChange={e => setAcabamentoSearch(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue text-sm"
                                                />
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                                            </div>
                                            
                                            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-brand-gray-50 rounded-lg border">
                                                {parafusosItems
                                                    .filter(item => 
                                                        acabamentoSearch === '' || 
                                                        item.name.toLowerCase().includes(acabamentoSearch.toLowerCase())
                                                    )
                                                    .map(item => (
                                                        <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border hover:border-brand-blue transition-colors">
                                                            <span className="text-sm text-brand-gray-800">{item.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-brand-gray-500">Estoque: {item.stock}</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="Qtd"
                                                                    className="w-20 px-2 py-1 border border-brand-gray-300 rounded text-sm"
                                                                    disabled={item.stock <= 0}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>

                                        {/* Terminais Tubulares */}
                                        <div className="pt-4 border-t border-brand-gray-200">
                                            <h4 className="font-semibold text-brand-gray-700 mb-3">Terminais Tubulares</h4>
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-brand-gray-700">
                                                        Quantidade (padrão por conexão DPS)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={kitConfig.acabamentos?.terminaisTubulares?.quantity || 12}
                                                        onChange={e => handleKitConfigChange('acabamentos.terminaisTubulares.quantity', parseInt(e.target.value))}
                                                        min="1"
                                                        className="w-24 px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-brand-gray-700 mb-1">Tipo</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: Terminal Tubular"
                                                            className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-brand-gray-700 mb-1">Cor</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: Azul"
                                                            className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Curva Box */}
                                        <div className="pt-4 border-t border-brand-gray-200">
                                            <h4 className="font-semibold text-brand-gray-700 mb-3">Curva Box</h4>
                                            <div className="flex items-center gap-3">
                                                <label className="text-sm text-brand-gray-700">Quantidade por caixa:</label>
                                                <input
                                                    type="number"
                                                    value={kitConfig.acabamentos?.curvaBox?.quantity || 1}
                                                    onChange={e => handleKitConfigChange('acabamentos.curvaBox.quantity', parseInt(e.target.value))}
                                                    min="1"
                                                    className="w-24 px-3 py-2 border border-brand-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Step 7 - Terminal de Compressão */}
                             {currentStep === 7 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">7. Terminal de Compressão</h3>
                                    {kitConfig.kitType === 'medidores' && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl flex items-center gap-3 shadow-sm">
                                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">🔌</span>
                                            </div>
                                            <p className="text-sm text-indigo-800">
                                                <strong>Cálculo Automático:</strong> Baseado na polaridade dos disjuntores
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                                        <p className="text-sm text-blue-800">
                                            <strong>Cálculo Automático:</strong> A quantidade é calculada baseada no tipo de disjuntor selecionado:
                                        </p>
                                        <ul className="mt-2 text-xs text-blue-700 space-y-1">
                                            <li>• Monopolar: 2 unidades por disjuntor</li>
                                            <li>• Bipolar: 3 unidades por disjuntor</li>
                                            <li>• Tripolar: 4 unidades por disjuntor</li>
                                        </ul>
                                    </div>

                                    {kitConfig.disjuntoresIndividuaisPolaridade && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-white border border-brand-gray-300 rounded-lg">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h4 className="font-semibold text-brand-gray-800">Quantidade Calculada</h4>
                                                        <p className="text-sm text-brand-gray-600">
                                                            Baseado em {(kitConfig.disjuntoresIndividuais || []).length} disjuntor(es) {kitConfig.disjuntoresIndividuaisPolaridade}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-brand-blue">
                                                            {(() => {
                                                                const unidadesPorDisjuntor = 
                                                                    kitConfig.disjuntoresIndividuaisPolaridade === 'monopolar' ? 2 :
                                                                    kitConfig.disjuntoresIndividuaisPolaridade === 'bipolar' ? 3 : 4;
                                                                const totalDisjuntores = (kitConfig.disjuntoresIndividuais || [])
                                                                    .reduce((sum, dj) => sum + dj.quantityPerMeter, 0) * (kitConfig.medidores?.numMedidores || 1);
                                                                return totalDisjuntores * unidadesPorDisjuntor;
                                                            })()}
                                                        </p>
                                                        <p className="text-xs text-brand-gray-500">unidades</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-brand-gray-700 mb-2">
                                                            Tipo de Terminal Olhal de Compressão
                                                        </label>
                                                        <select className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white text-sm">
                                                            <option value="">Selecione o tamanho...</option>
                                                            {terminaisCompressao.map(terminal => (
                                                                <option key={terminal.id} value={terminal.id}>
                                                                    {terminal.name} - R$ {terminal.price?.toFixed(2)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="p-3 bg-brand-gray-50 rounded-lg">
                                                        <h5 className="text-sm font-semibold text-brand-gray-700 mb-2">Resumo dos Disjuntores:</h5>
                                                        <div className="space-y-1 text-sm text-brand-gray-600">
                                                            {(kitConfig.disjuntoresIndividuais || []).map(dj => {
                                                                const item = materials.find(m => m.id === dj.id);
                                                                const unidadesPorDisjuntor = 
                                                                    kitConfig.disjuntoresIndividuaisPolaridade === 'monopolar' ? 2 :
                                                                    kitConfig.disjuntoresIndividuaisPolaridade === 'bipolar' ? 3 : 4;
                                                                const totalPorMedidor = dj.quantityPerMeter * unidadesPorDisjuntor;
                                                                const totalGeral = totalPorMedidor * (kitConfig.medidores?.numMedidores || 1);
                                                                return (
                                                                    <div key={dj.id} className="flex justify-between">
                                                                        <span>{item?.name}</span>
                                                                        <span className="font-semibold">
                                                                            {totalGeral} terminais ({dj.quantityPerMeter} × {unidadesPorDisjuntor} × {kitConfig.medidores?.numMedidores || 1} medidores)
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!kitConfig.disjuntoresIndividuaisPolaridade && (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                Por favor, complete a Etapa 4 (Disjuntores por Medidor) para calcular automaticamente os terminais de compressão.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Moderno */}
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0 rounded-b-2xl">
                            {/* Preço Total */}
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/20">
                                    <p className="text-xs text-green-100 font-medium mb-0.5">Preço Total</p>
                                    <p className="text-2xl font-bold text-white">
                                        R$ {kitBuilderPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>Etapa {currentStep} de {STEPS.length}</p>
                                </div>
                            </div>
                            
                            {/* Botões de Navegação */}
                            <div className="flex gap-3">
                                {currentStep > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => setCurrentStep(s => s - 1)} 
                                        className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                                    >
                                        ← Voltar
                                    </button>
                                )}
                                {currentStep < STEPS.length ? (
                                    <button 
                                        type="button" 
                                        onClick={() => setCurrentStep(s => s + 1)} 
                                        className="px-8 py-2.5 bg-gradient-to-r from-brand-blue to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
                                    >
                                        Avançar →
                                    </button>
                                ) : (
                                    <button 
                                        type="submit" 
                                        className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                                        disabled={!newKitName || kitBuilderPrice <= 0}
                                    >
                                        ✓ Salvar Kit
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal de Kit Subestações */}
            {isSubestacaoModalOpen && (
                <div 
                    className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseSubestacaoModal();
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden relative">
                        {/* Notificação de Rascunho Salvo */}
                        {rascunhoSalvoMensagem && (
                            <div className="absolute top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Rascunho salvo com sucesso!</span>
                            </div>
                        )}
                        
                        {/* Header do Modal */}
                        <div className="relative bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full -mr-32 -mt-32"></div>
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Kit Subestações</h2>
                                    <p className="text-green-100 mt-1">Configure sua subestação de energia</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleCloseSubestacaoModal} 
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                            {/* Etapa 1 - Informações Básicas e Tipo */}
                            {subestacaoStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">1. Informações Básicas</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nome do Kit</label>
                                                <input 
                                                    type="text" 
                                                    value={subestacaoNome} 
                                                    onChange={e => setSubestacaoNome(e.target.value)} 
                                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                                    placeholder="Ex: Subestação 150 KVA"
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Descrição</label>
                                                <textarea 
                                                    value={subestacaoDesc} 
                                                    onChange={e => setSubestacaoDesc(e.target.value)} 
                                                    rows={3} 
                                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Descrição opcional do kit..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">2. Tipo de Subestação</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Subestação Aérea */}
                                            <button
                                                type="button"
                                                onClick={() => setSubestacaoTipo('aerea')}
                                                className={`relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-300 ${
                                                    subestacaoTipo === 'aerea'
                                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-500/20'
                                                        : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
                                                <div className="relative">
                                                    <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                                        subestacaoTipo === 'aerea' ? 'bg-green-500' : 'bg-gray-200'
                                                    }`}>
                                                        <span className="text-3xl">🌤️</span>
                                                    </div>
                                                    <h4 className={`text-xl font-bold mb-2 ${
                                                        subestacaoTipo === 'aerea' ? 'text-green-700' : 'text-gray-700'
                                                    }`}>
                                                        Subestação Aérea
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Instalação externa ao ar livre, montada em postes ou estruturas elevadas
                                                    </p>
                                                    {subestacaoTipo === 'aerea' && (
                                                        <div className="mt-3 flex items-center gap-2 text-green-600">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-sm font-semibold">Selecionado</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>

                                            {/* Subestação Abrigada */}
                                            <button
                                                type="button"
                                                onClick={() => setSubestacaoTipo('abrigada')}
                                                className={`relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-300 ${
                                                    subestacaoTipo === 'abrigada'
                                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-500/20'
                                                        : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
                                                <div className="relative">
                                                    <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                                        subestacaoTipo === 'abrigada' ? 'bg-green-500' : 'bg-gray-200'
                                                    }`}>
                                                        <span className="text-3xl">🏢</span>
                                                    </div>
                                                    <h4 className={`text-xl font-bold mb-2 ${
                                                        subestacaoTipo === 'abrigada' ? 'text-green-700' : 'text-gray-700'
                                                    }`}>
                                                        Subestação Abrigada
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Instalação protegida em ambiente fechado, dentro de edificações ou containers
                                                    </p>
                                                    {subestacaoTipo === 'abrigada' && (
                                                        <div className="mt-3 flex items-center gap-2 text-green-600">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-sm font-semibold">Selecionado</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Etapa 2 - Configuração dos Materiais */}
                            {subestacaoStep === 2 && (
                                <div className="space-y-6">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-brand-gray-800">2. Configuração dos Materiais</h3>
                                        <p className="text-sm text-gray-600 mt-1">Adicione os materiais necessários para cada componente da subestação</p>
                                        
                                        {/* Dica de funcionalidades */}
                                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl flex items-start gap-3 shadow-sm">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="text-sm text-blue-900">
                                                <p className="font-semibold mb-1">💡 Como usar:</p>
                                                <ul className="space-y-1 list-disc list-inside">
                                                    <li>Clique no botão <strong>"+ Adicionar Material"</strong> em cada seção</li>
                                                    <li>Digite o <strong>nome ou código SKU</strong> para buscar no estoque</li>
                                                    <li>Adicione <strong>quantos materiais quiser</strong> em cada tópico</li>
                                                    <li>Use <strong>"Salvar como Rascunho"</strong> para continuar depois!</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Renderizar componente de seção reutilizável */}
                                    {(() => {
                                        const renderMaterialSection = (
                                            title: string, 
                                            icon: string, 
                                            topicKey: 'postoTransformacao' | 'aterramento' | 'iluminacao' | 'cabineMedicao' | 'condutores',
                                            showExtraFields: boolean = false
                                        ) => {
                                            const topicItems = subestacaoConfig[topicKey].items;
                                            const topicTotal = topicItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                                            return (
                                                <div className="border border-green-200 rounded-xl overflow-hidden bg-gradient-to-br from-white to-green-50/30 flex flex-col">
                                                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 flex items-center gap-2">
                                                        <span className="text-xl">{icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-semibold text-sm truncate">{title}</h4>
                                                            <span className="text-green-100 text-xs font-medium">
                                                                R$ {topicTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                        <span className="text-green-100 text-xs font-medium bg-green-800/30 px-2 py-1 rounded">
                                                            {topicItems.length} {topicItems.length === 1 ? 'item' : 'itens'}
                                                        </span>
                                                    </div>

                                                    <div className="p-3 space-y-3 flex-1 flex flex-col">
                                                        {/* Campos extras para Posto de Transformação */}
                                                        {showExtraFields && topicKey === 'postoTransformacao' && (
                                                            <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-green-200">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Potência (KVA)</label>
                                                                    <input 
                                                                        type="text" 
                                                                        value={subestacaoConfig.postoTransformacao.potencia}
                                                                        onChange={e => setSubestacaoConfig(prev => ({
                                                                            ...prev,
                                                                            postoTransformacao: { ...prev.postoTransformacao, potencia: e.target.value }
                                                                        }))}
                                                                        placeholder="Ex: 150 KVA"
                                                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tensão</label>
                                                                    <input 
                                                                        type="text" 
                                                                        value={subestacaoConfig.postoTransformacao.tensao}
                                                                        onChange={e => setSubestacaoConfig(prev => ({
                                                                            ...prev,
                                                                            postoTransformacao: { ...prev.postoTransformacao, tensao: e.target.value }
                                                                        }))}
                                                                        placeholder="Ex: 13.8kV / 380V"
                                                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Botão para adicionar material */}
                                                        <div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTopic(topicKey);
                                                                    setMaterialSearchTerm('');
                                                                    setMaterialQuantity(1);
                                                                    setTimeout(() => {
                                                                        const input = document.querySelector(`[data-topic="${topicKey}"]`) as HTMLInputElement;
                                                                        input?.focus();
                                                                    }, 100);
                                                                }}
                                                                className="w-full py-2 px-4 bg-green-50 border-2 border-dashed border-green-300 text-green-700 rounded-lg hover:bg-green-100 hover:border-green-400 transition-colors font-medium flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                Adicionar Material
                                                            </button>
                                                        </div>

                                                        {/* Campos de busca de materiais */}
                                                        {selectedTopic === topicKey && (
                                                            <div ref={materialSearchRef} className="relative bg-white border-2 border-green-200 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                    </svg>
                                                                    <span className="text-sm font-medium text-gray-700">Buscar Material no Estoque</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <div className="flex-1 relative">
                                                                        <input 
                                                                            type="text" 
                                                                            data-topic={topicKey}
                                                                            value={materialSearchTerm}
                                                                            onChange={e => {
                                                                                setMaterialSearchTerm(e.target.value);
                                                                                setIsMaterialDropdownOpen(true);
                                                                            }}
                                                                            onFocus={() => {
                                                                                if (materialSearchTerm) setIsMaterialDropdownOpen(true);
                                                                            }}
                                                                            placeholder="Digite o nome ou código do material..."
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                                        />
                                                                        {isMaterialDropdownOpen && materialSearchTerm && filteredMaterials.length > 0 && (
                                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                                                {filteredMaterials.map(material => (
                                                                                    <div 
                                                                                        key={material.id}
                                                                                        onClick={() => {
                                                                                            handleAddMaterialToTopic(topicKey, material, materialQuantity);
                                                                                        }}
                                                                                        className="px-3 py-2.5 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                                                    >
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="flex-1">
                                                                                                <div className="font-medium text-sm text-gray-900">{material.name}</div>
                                                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                                                    SKU: {material.sku} | Estoque: {material.stock} {material.unitOfMeasure}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="ml-3 text-right">
                                                                                                <div className="text-green-600 font-semibold text-sm">
                                                                                                    R$ {material.price?.toFixed(2)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        {isMaterialDropdownOpen && materialSearchTerm && filteredMaterials.length === 0 && (
                                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-center">
                                                                                <div className="text-gray-500 text-sm">
                                                                                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    </svg>
                                                                                    Nenhum material encontrado
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <input 
                                                                        type="number" 
                                                                        value={materialQuantity}
                                                                        onChange={e => setMaterialQuantity(parseInt(e.target.value) || 1)}
                                                                        min="1"
                                                                        placeholder="Qtd"
                                                                        className="w-20 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedTopic('');
                                                                            setMaterialSearchTerm('');
                                                                            setIsMaterialDropdownOpen(false);
                                                                        }}
                                                                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                                        title="Fechar"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Lista de materiais adicionados */}
                                                        {topicItems.length > 0 ? (
                                                            <div className="flex-1 overflow-y-auto max-h-64">
                                                                <label className="block text-xs font-semibold text-gray-700 mb-2 sticky top-0 bg-green-50/30 py-1">
                                                                    📦 Materiais ({topicItems.length})
                                                                </label>
                                                                <div className="space-y-1.5">
                                                                    {topicItems.map((item, idx) => (
                                                                        <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-200 hover:border-green-300 transition-colors group">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="text-xs font-medium text-gray-900 truncate" title={item.name}>
                                                                                    {item.name}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                                    <span className="font-semibold text-green-600">{item.quantity}x</span> R$ {item.price.toFixed(2)}
                                                                                    <span className="text-gray-400"> = </span>
                                                                                    <span className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => handleRemoveMaterialFromTopic(topicKey, item.productId)}
                                                                                className="flex-shrink-0 p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                                                title="Remover"
                                                                            >
                                                                                <TrashIcon className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-center text-center py-6">
                                                                <div className="text-gray-400">
                                                                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                                    </svg>
                                                                    <p className="text-xs">Nenhum material adicionado</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        };

                                        return (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {renderMaterialSection('Posto de Transformação', '⚡', 'postoTransformacao', true)}
                                                {renderMaterialSection('Aterramento', '🔌', 'aterramento')}
                                                {renderMaterialSection('Iluminação', '💡', 'iluminacao')}
                                                {renderMaterialSection('Cabine de Medição', '📊', 'cabineMedicao')}
                                                {renderMaterialSection('Condutores', '🔗', 'condutores')}
                                            </div>
                                        );
                                    })()}

                                    {/* Campos Personalizados */}
                                    {subestacaoConfig.camposPersonalizados.length > 0 && (
                                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                                            <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Campos Personalizados
                                            </h4>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {subestacaoConfig.camposPersonalizados.map((field, fieldIdx) => {
                                            const fieldTotal = field.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                            return (
                                                <div key={fieldIdx} className="border border-gray-300 rounded-xl overflow-hidden bg-white flex flex-col">
                                                    <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-3 py-2 flex items-center gap-2">
                                                        <span className="text-xl">📦</span>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-semibold text-sm truncate">{field.nome}</h4>
                                                            <span className="text-gray-200 text-xs font-medium">
                                                                R$ {fieldTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-200 text-xs font-medium bg-gray-800/30 px-2 py-1 rounded">
                                                            {field.items.length} {field.items.length === 1 ? 'item' : 'itens'}
                                                        </span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveCustomField(fieldIdx)}
                                                            className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded transition-colors"
                                                            title="Remover campo"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="p-3 space-y-3 bg-gray-50 flex-1 flex flex-col">
                                                        {/* Botão para adicionar material ao campo personalizado */}
                                                        <div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTopic(`custom-${fieldIdx}`);
                                                                    setMaterialSearchTerm('');
                                                                    setMaterialQuantity(1);
                                                                    setTimeout(() => {
                                                                        const input = document.querySelector(`[data-topic="custom-${fieldIdx}"]`) as HTMLInputElement;
                                                                        input?.focus();
                                                                    }, 100);
                                                                }}
                                                                className="w-full py-2 px-4 bg-gray-100 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                Adicionar Material
                                                            </button>
                                                        </div>

                                                        {/* Busca de materiais para campo personalizado */}
                                                        {selectedTopic === `custom-${fieldIdx}` && (
                                                            <div ref={materialSearchRef} className="relative bg-white border-2 border-gray-300 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                    </svg>
                                                                    <span className="text-sm font-medium text-gray-700">Buscar Material no Estoque</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <div className="flex-1 relative">
                                                                        <input 
                                                                            type="text" 
                                                                            data-topic={`custom-${fieldIdx}`}
                                                                            value={materialSearchTerm}
                                                                            onChange={e => {
                                                                                setMaterialSearchTerm(e.target.value);
                                                                                setIsMaterialDropdownOpen(true);
                                                                            }}
                                                                            onFocus={() => {
                                                                                if (materialSearchTerm) setIsMaterialDropdownOpen(true);
                                                                            }}
                                                                            placeholder="Digite o nome ou código do material..."
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                                                        />
                                                                        {isMaterialDropdownOpen && materialSearchTerm && filteredMaterials.length > 0 && (
                                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                                                {filteredMaterials.map(material => (
                                                                                    <div 
                                                                                        key={material.id}
                                                                                        onClick={() => {
                                                                                            handleAddMaterialToCustomField(fieldIdx, material, materialQuantity);
                                                                                        }}
                                                                                        className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                                                    >
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="flex-1">
                                                                                                <div className="font-medium text-sm text-gray-900">{material.name}</div>
                                                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                                                    SKU: {material.sku} | Estoque: {material.stock} {material.unitOfMeasure}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="ml-3 text-right">
                                                                                                <div className="text-gray-600 font-semibold text-sm">
                                                                                                    R$ {material.price?.toFixed(2)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        {isMaterialDropdownOpen && materialSearchTerm && filteredMaterials.length === 0 && (
                                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-center">
                                                                                <div className="text-gray-500 text-sm">
                                                                                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                    </svg>
                                                                                    Nenhum material encontrado
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <input 
                                                                        type="number" 
                                                                        value={materialQuantity}
                                                                        onChange={e => setMaterialQuantity(parseInt(e.target.value) || 1)}
                                                                        min="1"
                                                                        placeholder="Qtd"
                                                                        className="w-20 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedTopic('');
                                                                            setMaterialSearchTerm('');
                                                                            setIsMaterialDropdownOpen(false);
                                                                        }}
                                                                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                                        title="Fechar"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Lista de materiais do campo personalizado */}
                                                        {field.items.length > 0 ? (
                                                            <div className="flex-1 overflow-y-auto max-h-48">
                                                                <label className="block text-xs font-semibold text-gray-700 mb-2 sticky top-0 bg-gray-50 py-1">
                                                                    📦 Materiais ({field.items.length})
                                                                </label>
                                                                <div className="space-y-1.5">
                                                                    {field.items.map((item, itemIdx) => (
                                                                        <div key={itemIdx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors group">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="text-xs font-medium text-gray-900 truncate" title={item.name}>
                                                                                    {item.name}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                                    <span className="font-semibold text-gray-700">{item.quantity}x</span> R$ {item.price.toFixed(2)}
                                                                                    <span className="text-gray-400"> = </span>
                                                                                    <span className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => handleRemoveMaterialFromCustomField(fieldIdx, item.productId)}
                                                                                className="flex-shrink-0 p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                                                title="Remover"
                                                                            >
                                                                                <TrashIcon className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-center text-center py-4">
                                                                <div className="text-gray-400">
                                                                    <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                                    </svg>
                                                                    <p className="text-xs">Nenhum material adicionado</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Botão adicionar campo personalizado */}
                                    <div className={subestacaoConfig.camposPersonalizados.length > 0 ? "mt-4" : "mt-6"}>
                                        <button 
                                            type="button"
                                            onClick={handleAddCustomField}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all font-medium flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Adicionar Campo Personalizado
                                        </button>
                                    </div>

                                    {/* Total Geral */}
                                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white flex justify-between items-center">
                                        <span className="text-lg font-semibold">Total do Kit</span>
                                        <span className="text-2xl font-bold">
                                            R$ {subestacaoTotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer do Modal */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                {subestacaoStep === 1 ? (
                                    <>
                                        <button 
                                            type="button" 
                                            onClick={handleCloseSubestacaoModal} 
                                            className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                if (subestacaoNome && subestacaoTipo) {
                                                    setSubestacaoStep(2);
                                                } else {
                                                    alert('Preencha o nome e selecione o tipo de subestação!');
                                                }
                                            }}
                                            className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            disabled={!subestacaoNome || !subestacaoTipo}
                                        >
                                            Continuar →
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            type="button" 
                                            onClick={() => setSubestacaoStep(1)} 
                                            className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                                        >
                                            ← Voltar
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                // Criar o kit de subestação
                                                const newKit: Kit = {
                                                    id: `KIT-${Date.now()}`,
                                                    type: CatalogItemType.Kit,
                                                    name: subestacaoNome,
                                                    description: subestacaoDesc || `Kit de Subestação ${subestacaoTipo === 'aerea' ? 'Aérea' : 'Abrigada'}`,
                                                    products: [
                                                        ...subestacaoConfig.postoTransformacao.items,
                                                        ...subestacaoConfig.aterramento.items,
                                                        ...subestacaoConfig.iluminacao.items,
                                                        ...subestacaoConfig.cabineMedicao.items,
                                                        ...subestacaoConfig.condutores.items,
                                                        ...subestacaoConfig.camposPersonalizados.flatMap(f => f.items)
                                                    ],
                                                    services: [],
                                                    price: subestacaoTotalPrice,
                                                    imageUrl: undefined,
                                                    configuration: {
                                                        kitType: 'subestacoes',
                                                        subestacoes: {
                                                            tipo: subestacaoTipo,
                                                            postoTransformacao: subestacaoConfig.postoTransformacao,
                                                            aterramento: subestacaoConfig.aterramento,
                                                            iluminacao: subestacaoConfig.iluminacao,
                                                            cabineMedicao: subestacaoConfig.cabineMedicao,
                                                            condutores: subestacaoConfig.condutores,
                                                            camposPersonalizados: subestacaoConfig.camposPersonalizados
                                                        }
                                                    }
                                                };
                                                setCatalogItems(prev => [newKit, ...prev]);
                                                // Limpar rascunho após salvar com sucesso
                                                localStorage.removeItem('subestacaoRascunho');
                                                handleCloseSubestacaoModal();
                                            }}
                                            className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-200"
                                        >
                                            ✓ Salvar Kit
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {/* Botão Salvar como Rascunho - sempre visível */}
                            <div className="mt-3 flex justify-center">
                                <button 
                                    type="button"
                                    onClick={handleSalvarRascunhoSubestacao}
                                    className="px-6 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Salvar como Rascunho
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {isCaixasModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                         <div className="p-6 border-b">
                            <h3 className="text-lg font-bold">Selecionar Caixas de Policarbonato</h3>
                        </div>
                        <div className="p-6 max-h-96 overflow-y-auto grid grid-cols-2 gap-4">
                            {caixasPolicarbonatoData.map(caixa => (
                                <div key={caixa.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                    <img src={caixa.imageUrl} alt={caixa.name} className="w-20 h-20 object-cover rounded-md" />
                                    <div className="flex-grow">
                                        <p className="font-semibold">{caixa.name}</p>
                                        <p className="text-sm text-brand-gray-600">R$ {caixa.price.toFixed(2)}</p>
                                    </div>
                                    <input type="number" min="0" value={tempCaixaQuantities[caixa.id] || 0} onChange={e => setTempCaixaQuantities({...tempCaixaQuantities, [caixa.id]: parseInt(e.target.value)})} className="w-20 px-2 py-1 border rounded-md" />
                                </div>
                            ))}
                        </div>
                         <div className="p-4 bg-brand-gray-50 border-t flex justify-end gap-3">
                            <button type="button" onClick={() => setIsCaixasModalOpen(false)} className="px-4 py-2 bg-white border rounded-lg font-semibold">Cancelar</button>
                            <button type="button" onClick={handleConfirmCaixasSelection} className="px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold">Confirmar Seleção</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default Catalogo;
