// FIX: Import 'React' to resolve 'React.ReactNode' not being found.
import React from 'react';

export enum MovementType {
  Entrada = 'Entrada',
  Saida = 'Saída',
}

export enum StockLevel {
  Sufficient = 'sufficient',
  Low = 'low',
  Critical = 'critical',
}

export interface Movement {
  id: number;
  name: string;
  details: string;
  quantity: number;
  type: MovementType;
  date: string;
  stockLevel: StockLevel;
}

export interface StatCardData {
  title: string;
  value: string;
  subtitle: string;
  subtitleIcon: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}

// Project & Budget Types
export enum ProjectType {
    Tecnico = 'Projeto Técnico',
    Laudo = 'Laudo Técnico',
    SPDA = 'SPDA',
    Montagem = 'Montagem de Quadro',
    CompletoComObra = 'Projeto Completo com Obra',
}

// Project Management Types
export enum ProjectStatus {
    Planejamento = 'Planejamento',
    EmExecucao = 'Em Execução',
    ControleQualidade = 'Controle de Qualidade',
    Concluido = 'Concluído',
    Cancelado = 'Cancelado',
}

export enum ProjectMaterialStatus {
    Pendente = 'Pendente',
    Alocado = 'Alocado',
    EmFalta = 'Em Falta',
}

export interface ProjectMaterial {
    materialId: string;
    name: string;
    sku: string;
    requiredQuantity: number;
    status: ProjectMaterialStatus;
}

export enum ProjectStageStatus {
    AFazer = 'A Fazer',
    EmAndamento = 'Em Andamento',
    Concluido = 'Concluido',
}

export interface ProjectStage {
    id: string;
    title: string;
    status: ProjectStageStatus;
    dueDate?: string;
    assignedMemberId?: string;
    assignedMemberName?: string;
    highlight?: 'paused' | 'cancelled' | null;
}

export enum QCCheckStatus {
    Pendente = 'Pendente',
    Aprovado = 'Aprovado',
    Reprovado = 'Reprovado',
}

export interface QualityCheckItem {
    id: string;
    description: string;
    status: QCCheckStatus;
    notes?: string;
}

// FIX: Add ProjectAttachment interface for project files.
export interface ProjectAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
}

export interface Project {
    id: string;
    name: string;
    clientId: string;
    clientName: string;
    budgetId?: string;
    documentNumber?: string;
    projectType: ProjectType;
    startDate: string;
    endDate: string;
    responsibleUserId: string;
    responsibleUserName: string;
    description: string;
    status: ProjectStatus;
    progress: number;
    billOfMaterials: ProjectMaterial[];
    stages: ProjectStage[];
    qualityChecks: QualityCheckItem[];
    obraStarted?: boolean;
    // FIX: Add optional attachments property to Project interface.
    attachments?: ProjectAttachment[];
    assignedObraTeamMemberId?: string;
    assignedObraTeamMemberName?: string;
}


export enum BudgetStatus {
  Pendente = 'Pendente',
  Aprovado = 'Aprovado',
  Recusado = 'Recusado',
}

// Client CRM Types
export enum ClientType {
    PessoaFisica = 'Pessoa Física',
    PessoaJuridica = 'Pessoa Jurídica',
}

export enum ClientStatus {
    Ativo = 'Ativo',
    Inativo = 'Inativo',
    Potencial = 'Potencial',
    Retroativo = 'Retroativo', // A client from a past period being re-registered
}

export enum ContactPreference {
    Email = 'Email',
    Telefone = 'Telefone',
    WhatsApp = 'WhatsApp',
}

export enum ClientSource {
    Site = 'Site',
    Instagram = 'Instagram',
    Google = 'Google',
    Indicacao = 'Indicação',
}

export interface ClientProjectHistory {
    projectId: string;
    projectName: string;
    date: string;
}

// CRM - Sales Management
export enum OpportunityStatus {
    Qualificacao = 'Qualificação',
    Proposta = 'Proposta Enviada',
    Negociacao = 'Em Negociação',
    Ganha = 'Ganha',
    Perdida = 'Perdida',
}

export interface Opportunity {
    id: string;
    title: string;
    value: number;
    status: OpportunityStatus;
    createdDate: string;
    closeDate?: string;
}

export enum SalesOrderStatus {
    NaoIniciado = 'Não Iniciado',
    EmAndamento = 'Em Andamento',
    Concluido = 'Concluido',
    Cancelado = 'Cancelado',
}

export interface SalesOrder {
    id: string;
    budgetId: string; // Linked from an approved budget
    title: string;
    value: number;
    status: SalesOrderStatus;
    startDate: string;
    endDate?: string;
}

// CRM - Customer Service & Support
export enum InteractionType {
    Telefone = 'Telefone',
    Email = 'Email',
    Reuniao = 'Reunião',
    WhatsApp = 'WhatsApp',
    Suporte = 'Ticket de Suporte',
}

export interface Interaction {
    id: string;
    type: InteractionType;
    summary: string;
    date: string;
    user: string;
}


export interface Client {
    id: string;
    name: string;
    type: ClientType;
    document?: string; // CPF ou CNPJ
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    // CRM Fields
    status: ClientStatus;
    contactPreference: ContactPreference;
    source: ClientSource;
    projectHistory: ClientProjectHistory[];
    // CRM - Sales & Service
    opportunities: Opportunity[];
    salesOrders: SalesOrder[];
    interactions: Interaction[];
}


export interface Material {
    id: number;
    name: string;
    price: number;
}

export interface BudgetMaterial {
    materialId: string;
    name: string;
    quantity: number;
    price: number;
}

export interface BudgetService {
    serviceId: string;
    name: string;
    price: number;
}

export interface BudgetImage {
    name: string;
    dataUrl: string;
}

export interface Budget {
  id: string;
  clientName: string;
  clientId: string; // Changed to string to match new Client ID
  projectName: string;
  projectType: ProjectType;
  description: string;
  materials: BudgetMaterial[];
  services: BudgetService[];
  images: BudgetImage[];
  date: string;
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  paymentTerms: string;
  status: BudgetStatus;
}


// Catalog Types
export enum CatalogItemType {
  Produto = 'Produto',
  Kit = 'Kit',
}

export interface Product {
    id: string;
    type: CatalogItemType.Produto;
    name: string;
    sku: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
}

export interface KitProduct {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export enum ServiceType {
    Consultoria = 'Consultoria',
    Instalacao = 'Instalação',
    Manutencao = 'Manutenção',
    LaudoTecnico = 'Laudo Técnico',
    Outro = 'Outro',
}

export interface Service {
    id: string;
    name: string;
    internalCode: string;
    description: string;
    type: ServiceType;
    price: number;
}


export interface KitService {
    serviceId: string;
    name: string;
    price: number;
}

export interface KitConfiguration {
    kitType: '' | 'medidores' | 'comando' | 'quadro-eletrico' | 'subestacoes';
    // Medidores path
    medidores?: {
        materialType: '' | 'aluminio' | 'policarbonato';
        numMedidores: number;
        // Aluminio
        quadroAluminioId?: string;
        // Policarbonato
        caixasPolicarbonato?: { id: string; quantity: number }[];
    };
    // Comando path
    comando?: {
        assemblyType: '' | 'servico' | 'propria';
        baseQuadroId?: string;
        items?: KitProduct[];
    };
    // Subestações path
    subestacoes?: {
        tipo: 'aerea' | 'abrigada' | '';
        postoTransformacao?: {
            potencia?: string;
            tensao?: string;
            items: KitProduct[];
        };
        aterramento?: {
            items: KitProduct[];
        };
        iluminacao?: {
            items: KitProduct[];
        };
        cabineMedicao?: {
            items: KitProduct[];
        };
        condutores?: {
            items: KitProduct[];
        };
        camposPersonalizados?: {
            nome: string;
            items: KitProduct[];
        }[];
    };
    // Disjuntor Geral
    disjuntorGeralId?: string;
    disjuntorGeralTipo?: '' | 'caixa-moldada' | 'din';
    disjuntorGeralPolaridade?: '' | 'monopolar' | 'bipolar' | 'tripolar';
    // Disjuntores Individuais
    disjuntoresIndividuais?: {
        id: string;
        quantityPerMeter: number;
    }[];
    disjuntoresIndividuaisPolaridade?: '' | 'monopolar' | 'bipolar' | 'tripolar';
    // Cabos
    cabos?: {
        type: 'flexivel' | 'rigido' | '';
        items: { id: string; quantity: number }[];
    };
    // DPS
    dpsId?: string;
    dpsClasse?: '' | 'classe1' | 'classe2';
    dpsConfig?: {
        quantidade: number;
        tcmQuantidade: number;
        caboTerraComprimento: number;
        caboTerraBitola: string;
        barramentoPenteQuantidade: number;
        disjuntoresDPS?: { id: string; name: string; quantity: number }[];
    };
    // Acabamentos
    acabamentos?: {
        hasBornes: boolean;
        parafusos?: { id: string; quantity: number }[];
        arruelas?: { id: string; quantity: number }[];
        terminais?: {
            type: 'compressao' | 'tubular' | '';
            id?: string;
            quantity: number;
        };
        terminaisTubulares?: {
            quantity: number;
            items?: { id: string; tipo: string; cor: string; quantity: number }[];
        };
        curvaBox?: {
            quantity: number;
        };
    }
}

export interface Kit {
    id: string;
    type: CatalogItemType.Kit;
    name: string;
    description: string;
    products: KitProduct[];
    services: KitService[];
    price: number;
    imageUrl?: string;
    configuration?: KitConfiguration;
}

export type CatalogItem = Product | Kit;

// Stock Movement Types
export interface StockMovement {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  quantity: number;
  type: MovementType;
  date: string;
  responsible: string;
  notes?: string;
  reason?: string;
}

// History Log Types
export enum ActionType {
    Create = 'Create',
    Update = 'Update',
    Delete = 'Delete',
    MovementIn = 'MovementIn',
    MovementOut = 'MovementOut',
}

export enum ModuleType {
    Orçamentos = 'Orçamentos',
    Catálogo = 'Catálogo',
    Estoque = 'Estoque',
    Sistema = 'Sistema',
    Compras = 'Compras',
    Materiais = 'Materiais',
    Projetos = 'Projetos',
    Clientes = 'Clientes',
    Obras = 'Obras',
    Servicos = 'Serviços',
}

export interface HistoryLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: Date;
  module: ModuleType;
  type: ActionType;
}

// Purchase Types
export enum SupplierCategory {
    MaterialEletrico = 'Material Elétrico',
    Insumo = 'Insumo',
    Ferramenta = 'Ferramenta',
}

export interface Supplier {
    id: string;
    name: string;
    cnpj?: string;
    stateRegistration?: string;
    website?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    categories?: SupplierCategory[];
    bankDetails?: string;
    notes?: string;
}

export interface PurchaseOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    ncm?: string;
}

export enum PurchaseStatus {
    Pendente = 'Pendente',
    Recebido = 'Recebido',
    Cancelado = 'Cancelado',
}

export interface Installment {
    dueDate: string;
    value: number;
}

export interface PurchaseOrder {
    id: string;
    supplier: {
        id: string;
        name: string;
    };
    date: string;
    items: PurchaseOrderItem[];
    totalValue: number;
    status: PurchaseStatus;
    invoiceNumber?: string;
    paymentMethod?: string;
    installments?: Installment[];
    paymentTerms?: string;
    fullVendorDetails?: {
        name: string;
        cnpj: string;
        address: string;
    };
}

// Materials Page Types
export enum MaterialCategory {
    MaterialEletrico = 'Material Elétrico',
    Insumo = 'Insumo',
    Ferramenta = 'Ferramenta',
}

export enum MaterialClassification {
    Insumo = 'Insumo',
    Produto = 'Produto',
    Ambos = 'Ambos (Insumo/Produto)',
}

export interface MaterialItem {
    id: string;
    name: string; // Descrição Técnica
    sku: string; // Código
    type: string; // Categoria (e.g., 'Cabos', 'Disjuntores')
    subType?: 'Disjuntor Geral' | 'Disjuntor Individual' | 'Cabo Flexível' | 'Cabo Rígido' | 'DPS' | 'Borne' | 'Parafuso' | 'Terminal de Compressão' | 'Terminal Tubular';
    properties?: {
        amperage?: number;
        breakingCapacity?: string; // e.g., '6KA'
        voltage?: string;
        material?: string; // e.g. 'Cobre'
        dimensions?: string; // e.g., '3.5x40mm'
    };
    category: MaterialCategory; // Classificação
    description: string; // Especificações Técnicas
    stock: number;
    minStock: number;
    unitOfMeasure: string; // e.g., 'un', 'm', 'rolo'
    location: string; // e.g., 'Prateleira A-3'
    imageUrl?: string;
    supplierId?: string;
    supplierName?: string;
    price?: number;
}


// User Management Types
export enum UserRole {
    Admin = 'Admin',
    Engenheiro = 'Engenheiro',
    Tecnico = 'Técnico',
    DesenhistaIndustrial = 'Desenhista Industrial',
    Desenvolvedor = 'Desenvolvedor',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}
