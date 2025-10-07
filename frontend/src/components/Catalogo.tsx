import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CatalogItem, CatalogItemType, Product, Kit, KitProduct, Service, KitService, ServiceType, KitConfiguration, MaterialItem } from '../types';
import { catalogData, servicesData, quadrosAluminioData, caixasPolicarbonatoData, quadrosComandoBaseData, materialsData } from '../data/mockData';

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
    disjuntoresIndividuais: [],
    cabos: { type: '', items: [] },
    dpsId: undefined,
    acabamentos: { hasBornes: false, parafusos: [], terminais: { type: '', id: undefined, quantity: 0 } },
};

const Catalogo: React.FC<CatalogoProps> = ({ toggleSidebar }) => {
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(catalogData);
    const [filter, setFilter] = useState<CatalogItemType | 'Todos'>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isKitModalOpen, setIsKitModalOpen] = useState(false);
    
    // Edit/Delete state
    const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
    const [itemToView, setItemToView] = useState<CatalogItem | null>(null);

    // Form state for new/edit product
    const [newProductName, setNewProductName] = useState('');
    const [newProductSku, setNewProductSku] = useState('');
    const [newProductDesc, setNewProductDesc] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductStock, setNewProductStock] = useState('');
    const [newProductImage, setNewProductImage] = useState<string | null>(null);
    const productFileInputRef = useRef<HTMLInputElement>(null);

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
    const [caboToAdd, setCaboToAdd] = useState({ id: '', quantity: 1 });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
             if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId]?.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
             if (comandoDropdownRef.current && !comandoDropdownRef.current.contains(event.target as Node)) {
                setIsComandoListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);


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
            setNewProductName(product.name);
            setNewProductSku(product.sku);
            setNewProductDesc(product.description);
            setNewProductPrice(String(product.price));
            setNewProductStock(String(product.stock));
            setNewProductImage(product.imageUrl || null);
        } else {
            setItemToEdit(null);
        }
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setItemToEdit(null);
        setNewProductName(''); setNewProductSku(''); setNewProductDesc('');
        setNewProductPrice(''); setNewProductStock(''); setNewProductImage(null);
    };

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setNewProductImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleProductFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (itemToEdit && itemToEdit.type === CatalogItemType.Produto) { // Editing existing product
            const updatedProduct: Product = {
                ...(itemToEdit as Product),
                name: newProductName, sku: newProductSku, description: newProductDesc,
                price: parseFloat(newProductPrice) || 0, stock: parseInt(newProductStock) || 0,
                imageUrl: newProductImage || undefined,
            };
            setCatalogItems(prev => prev.map(item => item.id === itemToEdit.id ? updatedProduct : item));
        } else { // Creating new product
            const newProduct: Product = {
                id: `PROD-${String(catalogItems.filter(i => i.type === CatalogItemType.Produto).length + 1).padStart(3, '0')}`,
                type: CatalogItemType.Produto,
                name: newProductName, sku: newProductSku, description: newProductDesc,
                price: parseFloat(newProductPrice) || 0, stock: parseInt(newProductStock) || 0,
                imageUrl: newProductImage || undefined,
            };
            setCatalogItems(prev => [newProduct, ...prev]);
        }
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
            const material = materialsData.find(m => m.id === id) || quadrosAluminioData.find(m => m.id === id) || quadrosComandoBaseData.find(m => m.id === id);
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
            const allItems = [...materialsData, ...quadrosAluminioData, ...caixasPolicarbonatoData, ...quadrosComandoBaseData];
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

    const disjuntoresGerais = useMemo(() => materialsData.filter(m => m.subType === 'Disjuntor Geral' && (m.properties?.amperage ?? 0) >= 50 && m.properties?.breakingCapacity === '6KA'), []);
    const disjuntoresIndividuais = useMemo(() => materialsData.filter(m => m.subType === 'Disjuntor Individual'), []);
    const cabosFlexiveis = useMemo(() => materialsData.filter(m => m.subType === 'Cabo Flexível'), []);
    const cabosRigidos = useMemo(() => materialsData.filter(m => m.subType === 'Cabo Rígido'), []);
    const dpsItems = useMemo(() => materialsData.filter(m => m.subType === 'DPS'), []);
    const parafusosItems = useMemo(() => materialsData.filter(m => m.subType === 'Parafuso'), []);
    const terminaisCompressao = useMemo(() => materialsData.filter(m => m.subType === 'Terminal de Compressão'), []);
    const terminaisTubulares = useMemo(() => materialsData.filter(m => m.subType === 'Terminal Tubular'), []);
    
    const STEPS = ["Info", "Estrutura", "Disjuntor Geral", "Disjuntores Medidores", "Cabos", "DPS", "Acabamentos"];

    // Multi-item handlers
    const handleAddDisjuntorIndividual = () => {
        if (!disjuntorIndividualToAdd.id || (kitConfig.disjuntoresIndividuais || []).some(dj => dj.id === disjuntorIndividualToAdd.id)) return;
        handleKitConfigChange('disjuntoresIndividuais', [...(kitConfig.disjuntoresIndividuais || []), disjuntorIndividualToAdd]);
        setDisjuntorIndividualToAdd({ id: '', quantityPerMeter: 1 });
    };
    const handleRemoveDisjuntorIndividual = (id: string) => {
        handleKitConfigChange('disjuntoresIndividuais', (kitConfig.disjuntoresIndividuais || []).filter(dj => dj.id !== id));
    };

    const handleAddCabo = () => {
        if (!caboToAdd.id || (kitConfig.cabos?.items || []).some(c => c.id === caboToAdd.id)) return;
        handleKitConfigChange('cabos.items', [...(kitConfig.cabos?.items || []), caboToAdd]);
        setCaboToAdd({ id: '', quantity: 1 });
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
                        Criar Produto
                    </button>
                    <button onClick={() => handleOpenKitModal()} className="flex items-center justify-center bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-gray-50 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Criar Kit
                    </button>
                </div>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                {/* Filters and Search */}
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

                {/* Content Area */}
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
                                <div key={item.id} className="bg-white rounded-lg border border-brand-gray-200 shadow-sm flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                                    {item.type === CatalogItemType.Produto ? (
                                        <div className="relative h-40 w-full">
                                            <img className="h-full w-full object-cover" src={item.imageUrl || 'https://picsum.photos/seed/placeholder/400'} alt={item.name} />
                                        </div>
                                    ) : (
                                        <div className="relative h-40 w-full bg-brand-gray-50 flex items-center justify-center">
                                            <CubeIcon className="w-20 h-20 text-brand-gray-300"/>
                                        </div>
                                    )}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-brand-gray-800 leading-tight flex-1 pr-2">{item.name}</h3>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow ${item.type === CatalogItemType.Produto ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{item.type}</span>
                                        </div>
                                        <p className="text-xs text-brand-gray-500 mb-3">{item.type === CatalogItemType.Produto ? `SKU: ${item.sku}` : `ID: ${item.id}`}</p>
                                        
                                        <div className="mt-auto pt-3 border-t border-brand-gray-100 flex justify-between items-baseline">
                                            <p className="text-xl font-bold text-brand-blue">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            <p className="text-sm text-brand-gray-600">
                                                {item.type === CatalogItemType.Produto ? `${item.stock} em estoque` : `${(item.products.length + (item.services?.length || 0))} itens`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-brand-gray-50 border-t flex justify-end">
                                        <div className="relative">
                                             <button onClick={() => setOpenDropdownId(item.id === openDropdownId ? null : item.id)} className="p-1 rounded-full text-brand-gray-500 hover:bg-brand-gray-200">
                                                <EllipsisVerticalIcon className="w-5 h-5" />
                                            </button>
                                             {openDropdownId === item.id && (
                                                <div ref={el => { dropdownRefs.current[item.id] = el; }} className="origin-top-right absolute right-0 bottom-full mb-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenViewModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100"><EyeIcon className="w-4 h-4" /> Visualizar</a>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (item.type === CatalogItemType.Produto) handleOpenProductModal(item as Product); if (item.type === CatalogItemType.Kit) handleOpenKitModal(item as Kit); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100"><PencilIcon className="w-4 h-4" /> Editar</a>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(item); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><TrashIcon className="w-4 h-4" /> Excluir</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <form onSubmit={handleProductFormSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-gray-800">{itemToEdit ? 'Editar Produto' : 'Criar Novo Produto'}</h2>
                            <button type="button" onClick={handleCloseProductModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="productName" className="block text-sm font-medium text-brand-gray-700 mb-1">Nome do Produto</label>
                                    <input type="text" id="productName" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                                <div>
                                    <label htmlFor="productSku" className="block text-sm font-medium text-brand-gray-700 mb-1">SKU (Código)</label>
                                    <input type="text" id="productSku" value={newProductSku} onChange={e => setNewProductSku(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="productDesc" className="block text-sm font-medium text-brand-gray-700 mb-1">Descrição</label>
                                <textarea id="productDesc" value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} rows={3} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="productPrice" className="block text-sm font-medium text-brand-gray-700 mb-1">Preço (R$)</label>
                                    <input type="number" id="productPrice" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required step="0.01" min="0" />
                                </div>
                                <div>
                                    <label htmlFor="productStock" className="block text-sm font-medium text-brand-gray-700 mb-1">Estoque (Unidades)</label>
                                    <input type="number" id="productStock" value={newProductStock} onChange={e => setNewProductStock(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" required step="1" min="0" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Imagem do Produto</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-lg bg-brand-gray-100 flex items-center justify-center border-2 border-dashed border-brand-gray-300">
                                        {newProductImage ? <img src={newProductImage} alt="Preview" className="w-full h-full object-cover rounded-md" /> : <PhotoIcon className="w-10 h-10 text-brand-gray-400" />}
                                    </div>
                                    <input type="file" ref={productFileInputRef} onChange={handleProductImageChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => productFileInputRef.current?.click()} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                        Carregar Imagem
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseProductModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">{itemToEdit ? 'Salvar Alterações' : 'Salvar Produto'}</button>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-gray-800">Detalhes do Item</h2>
                            <button type="button" onClick={handleCloseViewModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="sm:w-1/3 flex-shrink-0">
                                    <img 
                                        src={itemToView.imageUrl || 'https://picsum.photos/seed/placeholder/400'} 
                                        alt={itemToView.name} 
                                        className="w-full h-auto object-cover rounded-lg shadow-md aspect-square" 
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-brand-gray-900">{itemToView.name}</h3>
                                    <p className="text-sm text-brand-gray-500 mb-2">
                                        {itemToView.type === CatalogItemType.Produto ? `SKU: ${itemToView.sku}` : `ID do Kit: ${itemToView.id}`}
                                    </p>
                                    <p className="text-lg font-bold text-brand-blue mb-4">
                                        R$ {itemToView.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-sm text-brand-gray-700 whitespace-pre-wrap">{itemToView.description}</p>
                                </div>
                            </div>

                            {itemToView.type === CatalogItemType.Produto && (
                                <div className="pt-4 border-t border-brand-gray-200">
                                    <h4 className="font-semibold text-brand-gray-800 mb-2">Detalhes do Produto</h4>
                                    <p className="text-sm text-brand-gray-600">
                                        <strong>Estoque:</strong> {itemToView.stock} unidades
                                    </p>
                                </div>
                            )}
                            
                            {itemToView.type === CatalogItemType.Kit && (
                                <div className="pt-4 border-t border-brand-gray-200">
                                     <h4 className="font-semibold text-brand-gray-800 mb-3">Itens Inclusos no Kit</h4>
                                     {itemToView.products.length > 0 && (
                                         <div className="mb-4">
                                             <h5 className="font-medium text-brand-gray-700 mb-2">Produtos:</h5>
                                             <ul className="space-y-2 text-sm">
                                                 {itemToView.products.map(p => (
                                                     <li key={p.productId} className="flex justify-between items-center p-2 bg-brand-gray-50 rounded-md">
                                                         <span>{p.quantity}x {p.name}</span>
                                                         <span className="font-semibold">R$ {(p.price * p.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                     </li>
                                                 ))}
                                             </ul>
                                         </div>
                                     )}
                                      {itemToView.services.length > 0 && (
                                         <div>
                                             <h5 className="font-medium text-brand-gray-700 mb-2">Serviços:</h5>
                                             <ul className="space-y-2 text-sm">
                                                 {itemToView.services.map(s => (
                                                     <li key={s.serviceId} className="flex justify-between items-center p-2 bg-brand-gray-50 rounded-md">
                                                         <span>{s.name}</span>
                                                         <span className="font-semibold">R$ {s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                     </li>
                                                 ))}
                                             </ul>
                                         </div>
                                     )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseViewModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Fechar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Kit Modal -> Kit Builder */}
            {isKitModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <form onSubmit={handleKitFormSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-brand-gray-800">{itemToEdit ? 'Editar Kit' : 'Construtor de Kit'}</h2>
                            <button type="button" onClick={handleCloseKitModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>

                        <div className="px-6 pt-4">
                            <nav aria-label="Progress">
                                <ol role="list" className="flex items-center">
                                    {STEPS.map((stepName, stepIdx) => (
                                    <li key={stepName} className={`relative ${stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                                        {stepIdx < currentStep ? (
                                        <>
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <div className="h-0.5 w-full bg-brand-blue" />
                                            </div>
                                            <button type="button" onClick={() => setCurrentStep(stepIdx + 1)} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue hover:bg-brand-blue/90">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                                            </button>
                                        </>
                                        ) : stepIdx === currentStep ? (
                                        <>
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-brand-gray-200" />
                                            </div>
                                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-blue bg-white" aria-current="step">
                                            <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" aria-hidden="true" />
                                            </div>
                                        </>
                                        ) : (
                                        <>
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-brand-gray-200" />
                                            </div>
                                            <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-gray-300 bg-white">
                                            <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                                            </div>
                                        </>
                                        )}
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
                                                    <option value="medidores">Quadro de Medidores</option>
                                                    <option value="comando">Quadro de Comando</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-brand-gray-700 mb-1">Descrição do Kit</label>
                                            <textarea value={newKitDesc} onChange={e => setNewKitDesc(e.target.value)} rows={2} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Step 2 */}
                             {currentStep === 2 && kitConfig.kitType === 'medidores' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">2. Configuração do Quadro de Medidores</h3>
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
                                    <div className="space-y-2">
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
                                </div>
                            )}

                            {/* Step 4 */}
                            {currentStep === 4 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">4. Disjuntores por Medidor</h3>
                                    <div className="p-3 bg-brand-gray-50 rounded-lg grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-6">
                                            <label className="text-xs font-medium text-brand-gray-700">Modelo</label>
                                            <select value={disjuntorIndividualToAdd.id} onChange={e => setDisjuntorIndividualToAdd({...disjuntorIndividualToAdd, id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-brand-gray-300 rounded-lg bg-white text-sm">
                                                <option value="">Selecione...</option>
                                                {disjuntoresIndividuais.filter(d => !(kitConfig.disjuntoresIndividuais || []).some(added => added.id === d.id)).map(dj => <option key={dj.id} value={dj.id} disabled={dj.stock <= 0}>{dj.name} {dj.stock <= 0 ? '(S/ Estoque)' : ''}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <label className="text-xs font-medium text-brand-gray-700">Qtd. por Medidor</label>
                                            <input type="number" value={disjuntorIndividualToAdd.quantityPerMeter} onChange={e => setDisjuntorIndividualToAdd({...disjuntorIndividualToAdd, quantityPerMeter: parseInt(e.target.value)})} min="1" className="w-full mt-1 px-3 py-2 border border-brand-gray-300 rounded-lg text-sm" />
                                        </div>
                                        <div className="col-span-3">
                                            <button type="button" onClick={handleAddDisjuntorIndividual} className="w-full px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600 text-sm" disabled={!disjuntorIndividualToAdd.id}>Adicionar</button>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {(kitConfig.disjuntoresIndividuais || []).map(dj => {
                                            const item = materialsData.find(m => m.id === dj.id);
                                            return (
                                                <div key={dj.id} className="p-2 bg-brand-gray-100 rounded-md flex justify-between items-center text-sm">
                                                    <span>{dj.quantityPerMeter}x {item?.name} (por medidor)</span>
                                                    <button type="button" onClick={() => handleRemoveDisjuntorIndividual(dj.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                             {/* Step 5 */}
                             {currentStep === 5 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">5. Cabos</h3>
                                    <div className="flex gap-4 mb-4">
                                        <label><input type="radio" name="cableType" value="flexivel" checked={kitConfig.cabos?.type === 'flexivel'} onChange={() => handleKitConfigChange('cabos.type', 'flexivel')} className="mr-2" />Flexível</label>
                                        <label><input type="radio" name="cableType" value="rigido" checked={kitConfig.cabos?.type === 'rigido'} onChange={() => handleKitConfigChange('cabos.type', 'rigido')} className="mr-2" />Rígido</label>
                                    </div>
                                    {kitConfig.cabos?.type && (
                                        <div className="p-3 bg-brand-gray-50 rounded-lg grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-6">
                                                <label className="text-xs font-medium text-brand-gray-700">Cabo</label>
                                                <select value={caboToAdd.id} onChange={e => setCaboToAdd({...caboToAdd, id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-brand-gray-300 rounded-lg bg-white text-sm">
                                                    <option value="">Selecione...</option>
                                                    {(kitConfig.cabos.type === 'flexivel' ? cabosFlexiveis : cabosRigidos).filter(c => !(kitConfig.cabos?.items || []).some(added => added.id === c.id)).map(c => <option key={c.id} value={c.id} disabled={c.stock <= 0}>{c.name} {c.stock <= 0 ? '(S/ Estoque)' : ''}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-3">
                                                <label className="text-xs font-medium text-brand-gray-700">Qtd. (metros/rolos)</label>
                                                <input type="number" value={caboToAdd.quantity} onChange={e => setCaboToAdd({...caboToAdd, quantity: parseInt(e.target.value)})} min="1" className="w-full mt-1 px-3 py-2 border border-brand-gray-300 rounded-lg text-sm" />
                                            </div>
                                            <div className="col-span-3">
                                                <button type="button" onClick={handleAddCabo} className="w-full px-4 py-2 bg-brand-gray-700 text-white font-semibold rounded-lg hover:bg-brand-gray-600 text-sm" disabled={!caboToAdd.id}>Adicionar</button>
                                            </div>
                                        </div>
                                    )}
                                     <div className="mt-4 space-y-2">
                                        {(kitConfig.cabos?.items || []).map(cabo => {
                                            const item = materialsData.find(m => m.id === cabo.id);
                                            return (
                                                <div key={cabo.id} className="p-2 bg-brand-gray-100 rounded-md flex justify-between items-center text-sm">
                                                    <span>{cabo.quantity}x {item?.name}</span>
                                                    <button type="button" onClick={() => handleRemoveCabo(cabo.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                             {/* Step 6 */}
                             {currentStep === 6 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">6. Dispositivo de Proteção contra Surtos (DPS)</h3>
                                    <div className="space-y-2">
                                        {dpsItems.map(dps => (
                                            <label key={dps.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${kitConfig.dpsId === dps.id ? 'bg-blue-100 border border-blue-300' : 'bg-brand-gray-50 hover:bg-brand-gray-100'} ${dps.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className="flex items-center">
                                                    <input type="radio" name="dps" value={dps.id} checked={kitConfig.dpsId === dps.id} onChange={() => handleKitConfigChange('dpsId', dps.id)} className="h-4 w-4 text-brand-blue focus:ring-brand-blue" disabled={dps.stock <= 0} />
                                                    <span className="ml-3 text-sm font-medium text-brand-gray-800">{dps.name} - R$ {dps.price?.toFixed(2)}</span>
                                                </div>
                                                {dps.stock <= 0 && <span className="text-xs font-bold text-red-600">SEM ESTOQUE</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-between items-center flex-shrink-0">
                             <span className="text-xl font-bold text-brand-gray-800">
                                Preço Total: R$ {kitBuilderPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <div className="flex gap-3">
                                {currentStep > 1 && <button type="button" onClick={() => setCurrentStep(s => s - 1)} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Voltar</button>}
                                {currentStep < STEPS.length ? 
                                    <button type="button" onClick={() => setCurrentStep(s => s + 1)} className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">Avançar</button>
                                :
                                    <button type="submit" className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90" disabled={!newKitName || kitBuilderPrice <= 0}>Salvar Kit</button>
                                }
                            </div>
                        </div>
                    </form>
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
