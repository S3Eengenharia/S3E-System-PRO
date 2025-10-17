import { 
    type Budget, BudgetStatus,
    type CatalogItem, CatalogItemType, type Product, type Kit,
    type Client, ClientType, ClientStatus, ContactPreference, ClientSource, OpportunityStatus, InteractionType,
    type HistoryLog, ModuleType, ActionType,
    type MaterialItem, MaterialCategory,
    type StockMovement, MovementType,
    type PurchaseOrder, PurchaseStatus,
    type Project, ProjectStatus, ProjectType, ProjectMaterialStatus, ProjectStageStatus, QCCheckStatus,
    type AdminStage, AdminStageStatus,
    type Service, ServiceType,
    type Supplier, SupplierCategory,
    type User, UserRole
} from '../types';

// Helper function to generate the 10 fixed administrative stages
const generateAdminStages = (projectStartDate: string): AdminStage[] => {
    const stages = [
        'Organizar Projeto',
        'Abertura de SR',
        'Emitir ART',
        'Concluir Projeto',
        'Protocolar Projeto',
        'Aprovação do Projeto',
        'Revisão Final',
        'Cobrança',
        'Acervo Técnico',
        'Vistoria',
    ];

    const startDate = new Date(projectStartDate);
    
    return stages.map((name, index) => {
        const deadline = new Date(startDate);
        deadline.setHours(deadline.getHours() + 24); // 24 hours from start

        return {
            id: `ADMIN-STAGE-${index + 1}`,
            name,
            order: index + 1,
            status: AdminStageStatus.Pending,
            deadline: deadline.toISOString(),
            startedAt: startDate.toISOString(),
        };
    });
};

export const usersData: User[] = [
    { id: 'USR-001', name: 'Usuário Admin', email: 'admin@s3e.com.br', role: UserRole.Admin },
    { id: 'USR-002', name: 'João Engenheiro', email: 'joao.eng@s3e.com.br', role: UserRole.Engenheiro },
    { id: 'USR-003', name: 'Maria Técnica', email: 'maria.tec@s3e.com.br', role: UserRole.Tecnico },
    { id: 'USR-004', name: 'Carlos Desenhista', email: 'carlos.des@s3e.com.br', role: UserRole.DesenhistaIndustrial },
    { id: 'USR-005', name: 'Ana Desenvolvedora', email: 'ana.dev@s3e.com.br', role: UserRole.Desenvolvedor },
];

export const obrasTeamData: User[] = [
    { id: 'OBR-TM-001', name: 'Marcos Eletricista', email: 'marcos.elet@s3e.com.br', role: UserRole.Tecnico },
    { id: 'OBR-TM-002', name: 'Felipe Ajudante', email: 'felipe.ajd@s3e.com.br', role: UserRole.Tecnico },
    { id: 'OBR-TM-003', name: 'Laura Encarregada', email: 'laura.enc@s3e.com.br', role: UserRole.Engenheiro },
];

export const suppliersData: Supplier[] = [
    { id: 'SUP-001', name: 'Fornecedor Elétrico Nacional', cnpj: '11.111.111/0001-11', contactPerson: 'Carlos Andrade', phone: '(11) 9999-8888', email: 'vendas@nacional.com', address: 'Rua Principal, 100, São Paulo, SP', categories: [SupplierCategory.MaterialEletrico, SupplierCategory.Insumo], stateRegistration: '123.456.789.112', website: 'https://nacional.com.br' },
    { id: 'SUP-002', name: 'Distribuidora de Cabos Megawatt', cnpj: '22.222.222/0001-22', contactPerson: 'Fernanda Lima', phone: '(21) 9888-7777', email: 'contato@megawatt.com', address: 'Avenida Central, 200, Rio de Janeiro, RJ', categories: [SupplierCategory.MaterialEletrico], notes: 'Entrega rápida para o Rio de Janeiro.' },
    { id: 'SUP-003', name: 'Iluminação & Cia', cnpj: '33.333.333/0001-33', contactPerson: 'Ricardo Souza', phone: '(31) 9777-6666', email: 'comercial@iluminacaoecia.com', address: 'Praça da Luz, 300, Belo Horizonte, MG', categories: [SupplierCategory.MaterialEletrico], bankDetails: 'Banco X, Ag 0001, C/C 12345-6' },
    { id: 'SUP-004', name: 'Ferramentas Sigma', cnpj: '44.444.444/0001-44', contactPerson: 'Ana Pereira', phone: '(51) 9666-5555', email: 'ana.p@sigma.com.br', address: 'Rua dos Componentes, 400, Porto Alegre, RS', categories: [SupplierCategory.Ferramenta, SupplierCategory.Insumo], website: 'https://sigmatools.com' },
];

export const servicesData: Service[] = [
    { id: 'SERV-001', name: 'Visita Técnica de Avaliação', internalCode: 'VT-AVAL', description: 'Visita para levantamento e avaliação técnica de necessidades elétricas.', type: ServiceType.Consultoria, price: 150.00 },
    { id: 'SERV-002', name: 'Instalação Padrão (ponto)', internalCode: 'INST-PAD', description: 'Instalação de um ponto elétrico padrão, incluindo fiação e tomada.', type: ServiceType.Instalacao, price: 80.00 },
    { id: 'SERV-003', name: 'Consultoria de Projeto (hora)', internalCode: 'CONS-PROJ', description: 'Hora técnica de consultoria para desenvolvimento e revisão de projetos elétricos.', type: ServiceType.Consultoria, price: 250.00 },
    { id: 'SERV-004', name: 'Manutenção Preventiva', internalCode: 'MANU-PREV', description: 'Serviço de manutenção preventiva em quadros elétricos.', type: ServiceType.Manutencao, price: 350.00 },
];

export const materialsData: MaterialItem[] = [
    { id: 'MAT-001', name: 'Disjuntor Monopolar 20A', sku: 'DJM-20A', type: 'Disjuntores', category: MaterialCategory.MaterialEletrico, description: 'Disjuntor termomagnético para proteção de circuitos.', stock: 150, minStock: 20, unitOfMeasure: 'un', location: 'Prateleira A-1', imageUrl: 'https://picsum.photos/seed/mat1/400', supplierId: 'SUP-001', supplierName: 'Fornecedor Elétrico Nacional', price: 15.50, subType: 'Disjuntor Individual', properties: { amperage: 20 } },
    { id: 'MAT-002', name: 'Cabo Flexível 2.5mm²', sku: 'CB-FX-2.5', type: 'Cabos', category: MaterialCategory.MaterialEletrico, description: 'Rolo com 100 metros.', stock: 80, minStock: 10, unitOfMeasure: 'rolo', location: 'Prateleira B-3', imageUrl: 'https://picsum.photos/seed/mat2/400', supplierId: 'SUP-002', supplierName: 'Distribuidora de Cabos Megawatt', price: 250.00, subType: 'Cabo Flexível', properties: { dimensions: '2.5mm²' } },
    { id: 'MAT-003', name: 'Fita Isolante 20m', sku: 'FITA-ISO-20', type: 'Fitas', category: MaterialCategory.Insumo, description: 'Fita isolante preta para uso geral.', stock: 500, minStock: 50, unitOfMeasure: 'un', location: 'Caixa 5', imageUrl: 'https://picsum.photos/seed/mat3/400', price: 5.00 },
    { id: 'MAT-004', name: 'Alicate Universal 8"', sku: 'FER-ALI-U8', type: 'Alicates', category: MaterialCategory.Ferramenta, description: 'Alicate universal isolado 1000V.', stock: 5, minStock: 2, unitOfMeasure: 'un', location: 'Maleta de Ferramentas 1', imageUrl: 'https://picsum.photos/seed/mat4/400', price: 75.00 },
    { id: 'MAT-005', name: 'Parafuso Philips 3.5x40', sku: 'PAR-PH-3540', type: 'Fixadores', category: MaterialCategory.Insumo, description: 'Caixa com 500 unidades.', stock: 10, minStock: 5, unitOfMeasure: 'caixa', location: 'Gaveteiro C-2', imageUrl: 'https://picsum.photos/seed/mat5/400', supplierId: 'SUP-001', supplierName: 'Fornecedor Elétrico Nacional', price: 45.00, subType: 'Parafuso', properties: { dimensions: '3.5x40mm' } },
    { id: 'MAT-006', name: 'Luminária LED de Sobrepor 18W', sku: 'LUM-SOB-18', type: 'Luminárias', category: MaterialCategory.MaterialEletrico, description: 'Luminária quadrada para tetos.', stock: 45, minStock: 10, unitOfMeasure: 'un', location: 'Prateleira A-2', imageUrl: 'https://picsum.photos/seed/mat6/400', supplierId: 'SUP-003', supplierName: 'Iluminação & Cia', price: 38.90 },
    { id: 'MAT-007', name: 'Multímetro Digital', sku: 'FER-MULT-01', type: 'Medidores', category: MaterialCategory.Ferramenta, description: 'Multímetro com medição de tensão, corrente e resistência.', stock: 3, minStock: 1, unitOfMeasure: 'un', location: 'Bancada de Testes', imageUrl: 'https://picsum.photos/seed/mat7/400', price: 120.00 },
    { id: 'MAT-008', name: 'Terminal Olhal 6mm', sku: 'TERM-OL-6', type: 'Terminais', category: MaterialCategory.Insumo, description: 'Pacote com 100 unidades.', stock: 20, minStock: 5, unitOfMeasure: 'pct', location: 'Gaveteiro A-1', imageUrl: 'https://picsum.photos/seed/mat8/400', price: 22.50, subType: 'Terminal de Compressão' },
    { id: 'MAT-009', name: 'Conduíte Corrugado 3/4"', sku: 'COND-COR-34', type: 'Conduítes', category: MaterialCategory.MaterialEletrico, description: 'Rolo com 50 metros.', stock: 30, minStock: 5, unitOfMeasure: 'rolo', location: 'Estoque Externo', imageUrl: 'https://picsum.photos/seed/mat9/400', supplierId: 'SUP-001', supplierName: 'Fornecedor Elétrico Nacional', price: 55.00 },
    { id: 'MAT-010', name: 'Chave de Fenda Philips', sku: 'FER-CF-PH', type: 'Chaves', category: MaterialCategory.Ferramenta, description: 'Chave isolada 1000V ponta PH2.', stock: 10, minStock: 3, unitOfMeasure: 'un', location: 'Maleta de Ferramentas 2', imageUrl: 'https://picsum.photos/seed/mat10/400', price: 25.00 },
    
    // Additional materials for Kit Builder
    { id: 'MAT-011', name: 'Disjuntor Geral 63A', sku: 'DJG-63A', type: 'Disjuntores', category: MaterialCategory.MaterialEletrico, description: 'Disjuntor geral trifásico.', stock: 25, minStock: 5, unitOfMeasure: 'un', location: 'Prateleira A-1', price: 85.00, subType: 'Disjuntor Geral', properties: { amperage: 63, breakingCapacity: '6KA' } },
    { id: 'MAT-012', name: 'Disjuntor Geral 100A', sku: 'DJG-100A', type: 'Disjuntores', category: MaterialCategory.MaterialEletrico, description: 'Disjuntor geral trifásico.', stock: 15, minStock: 3, unitOfMeasure: 'un', location: 'Prateleira A-1', price: 125.00, subType: 'Disjuntor Geral', properties: { amperage: 100, breakingCapacity: '6KA' } },
    { id: 'MAT-013', name: 'Disjuntor Bipolar 40A', sku: 'DJB-40A', type: 'Disjuntores', category: MaterialCategory.MaterialEletrico, description: 'Disjuntor bipolar para chuveiros.', stock: 80, minStock: 15, unitOfMeasure: 'un', location: 'Prateleira A-2', price: 35.00, subType: 'Disjuntor Individual', properties: { amperage: 40 } },
    { id: 'MAT-014', name: 'Cabo Rígido 10mm²', sku: 'CB-RG-10', type: 'Cabos', category: MaterialCategory.MaterialEletrico, description: 'Cabo de cobre rígido (100m).', stock: 10, minStock: 2, unitOfMeasure: 'rolo', location: 'Prateleira B-4', price: 750.00, subType: 'Cabo Rígido', properties: { dimensions: '10mm²' } },
    { id: 'MAT-015', name: 'DPS 40kA', sku: 'DPS-40', type: 'DPS', category: MaterialCategory.MaterialEletrico, description: 'Dispositivo de Proteção contra Surtos.', stock: 40, minStock: 10, unitOfMeasure: 'un', location: 'Prateleira C-1', price: 95.00, subType: 'DPS', properties: { amperage: 40 } },
    { id: 'MAT-016', name: 'Borne SAK 2.5mm²', sku: 'BRN-SAK-2.5', type: 'Bornes', category: MaterialCategory.Insumo, description: 'Borne de conexão.', stock: 1000, minStock: 200, unitOfMeasure: 'un', location: 'Gaveteiro D-1', price: 2.50, subType: 'Borne' },
    { id: 'MAT-017', name: 'Terminal Tubular Ilhós 2.5mm²', sku: 'TERM-TUB-2.5', type: 'Terminais', category: MaterialCategory.Insumo, description: 'Pacote com 100 unidades.', stock: 30, minStock: 10, unitOfMeasure: 'pct', location: 'Gaveteiro A-2', price: 18.00, subType: 'Terminal Tubular' },
    { id: 'MAT-018', name: 'Cabo Flexível 4mm²', sku: 'CB-FX-4.0', type: 'Cabos', category: MaterialCategory.MaterialEletrico, description: 'Rolo com 100 metros.', stock: 0, minStock: 10, unitOfMeasure: 'rolo', location: 'Prateleira B-3', price: 380.00, subType: 'Cabo Flexível', properties: { dimensions: '4.0mm²' } },
];

export const catalogData: CatalogItem[] = [
    { id: 'PROD-001', type: CatalogItemType.Produto, name: 'Disjuntor Monopolar 20A', sku: 'DJM-20A', description: 'Disjuntor termomagnético para proteção de circuitos.', price: 15.50, stock: 150, imageUrl: 'https://picsum.photos/seed/prod1/400' },
    { id: 'PROD-002', type: CatalogItemType.Produto, name: 'Cabo Flexível 2.5mm² (rolo 100m)', sku: 'CB-FX-2.5-100M', description: 'Cabo flexível para instalações elétricas em geral.', price: 250.00, stock: 80, imageUrl: 'https://picsum.photos/seed/prod2/400' },
    { id: 'PROD-003', type: CatalogItemType.Produto, name: 'Tomada Dupla 2P+T 10A', sku: 'TM-DP-10A', description: 'Tomada de embutir com duas saídas.', price: 12.75, stock: 300, imageUrl: 'https://picsum.photos/seed/prod3/400' },
    { id: 'PROD-004', type: CatalogItemType.Produto, name: 'Lâmpada LED Bulbo 12W', sku: 'LP-LED-12W', description: 'Lâmpada de baixo consumo e alta durabilidade.', price: 14.00, stock: 500, imageUrl: 'https://picsum.photos/seed/prod4/400' },
    {
        id: 'KIT-001', type: CatalogItemType.Kit, name: 'Kit Instalação Padrão', description: 'Kit básico para instalação de um ponto de tomada.',
        products: [
            { productId: 'PROD-003', name: 'Tomada Dupla 2P+T 10A', price: 12.75, quantity: 1 },
        ],
        services: [
            { serviceId: 'SERV-002', name: 'Instalação Padrão (ponto)', price: 80.00 }
        ],
        price: 92.75,
        imageUrl: 'https://picsum.photos/seed/kit1/400',
        configuration: undefined,
    },
];

export const clientsData: Client[] = [
    { id: 'CLI-001', name: 'Construtora Alfa', type: ClientType.PessoaJuridica, document: '11.111.111/0001-11', contactPerson: 'Roberto G.', phone: '(11) 98765-4321', email: 'contato@alfa.com', address: 'Rua das Obras, 123, São Paulo, SP', notes: 'Cliente antigo, foco em grandes projetos.', status: ClientStatus.Ativo, contactPreference: ContactPreference.Email, source: ClientSource.Indicacao, projectHistory: [{ projectId: 'PROJ-087', projectName: 'Instalação Elétrica Ed. Phoenix', date: '15/08/2025'}], opportunities: [
        { id: 'OPP-001', title: 'Novo Edifício Comercial', value: 150000, status: OpportunityStatus.Proposta, createdDate: '20/09/2025' },
        { id: 'OPP-002', title: 'Manutenção Anual Contratada', value: 50000, status: OpportunityStatus.Ganha, createdDate: '01/08/2025' },
    ], salesOrders: [], interactions: [
        { id: 'INT-001', type: InteractionType.Reuniao, summary: 'Alinhamento do escopo para o Ed. Comercial.', date: '21/09/2025', user: 'Admin' },
        { id: 'INT-002', type: InteractionType.Telefone, summary: 'Cliente solicitou ajuste no orçamento ORC-2025-006.', date: '28/09/2025', user: 'Admin' },
    ]},
    { id: 'CLI-002', name: 'Mariana Costa', type: ClientType.PessoaFisica, document: '123.456.789-00', contactPerson: 'Mariana Costa', phone: '(21) 91234-5678', email: 'mari.costa@email.com', address: 'Av. Copacabana, 456, Rio de Janeiro, RJ', notes: 'Solicitou projeto luminotécnico para apartamento.', status: ClientStatus.Potencial, contactPreference: ContactPreference.WhatsApp, source: ClientSource.Instagram, projectHistory: [], opportunities: [
         { id: 'OPP-003', title: 'Projeto Luminotécnico Apto', value: 7500, status: OpportunityStatus.Qualificacao, createdDate: '29/09/2025' },
    ], salesOrders: [], interactions: [] },
    { id: 'CLI-003', name: 'Indústria Gama', type: ClientType.PessoaJuridica, document: '22.222.222/0001-22', contactPerson: 'Sra. Lima', phone: '(31) 95555-4444', email: 'engenharia@gama.ind', address: 'Rod. Industrial, 789, Belo Horizonte, MG', status: ClientStatus.Ativo, contactPreference: ContactPreference.Telefone, source: ClientSource.Google, projectHistory: [{ projectId: 'PROJ-085', projectName: 'Manutenção Preventiva', date: '01/09/2025' }], opportunities: [], salesOrders: [], interactions: [] },
    { id: 'CLI-004', name: 'Condomínio Delta', type: ClientType.PessoaJuridica, document: '33.333.333/0001-33', contactPerson: 'Sr. Síndico', phone: '(51) 98888-7777', email: 'sindico@condominiodelta.com', address: 'Al. dos Jardins, 101, Porto Alegre, RS', status: ClientStatus.Inativo, contactPreference: ContactPreference.Email, source: ClientSource.Site, projectHistory: [{ projectId: 'PROJ-079', projectName: 'Laudo SPDA', date: '10/01/2024' }], opportunities: [], salesOrders: [], interactions: [] },
];

export const budgetsData: Budget[] = [
    { id: 'ORC-2025-001', clientId: 'CLI-001', clientName: 'Construtora Alfa', projectName: 'Edifício Residencial Sol', projectType: ProjectType.CompletoComObra, description: 'Descrição detalhada do projeto para o Edifício Residencial Sol.', materials: [
        { materialId: 'MAT-001', name: 'Disjuntor Monopolar 20A', quantity: 200, price: 15.50 },
        { materialId: 'MAT-002', name: 'Cabo Flexível 2.5mm²', quantity: 50, price: 250.00 },
    ], services: [], images: [], date: '25/09/2025', subtotal: 80000, discount: 5000, taxes: 0, total: 75000.00, paymentTerms: '50% adiantado, 50% na entrega', status: BudgetStatus.Aprovado },
    { id: 'ORC-2025-002', clientId: 'CLI-002', clientName: 'Mariana Costa', projectName: 'Reforma Elétrica Loja Central', projectType: ProjectType.Laudo, description: '', materials: [], services: [], images: [], date: '22/09/2025', subtotal: 25000, discount: 0, taxes: 500.50, total: 25500.50, paymentTerms: '30 dias', status: BudgetStatus.Pendente },
    { id: 'ORC-2025-003', clientId: 'CLI-003', clientName: 'Indústria Gama', projectName: 'Automação Linha de Produção', projectType: ProjectType.Montagem, description: 'Automação da linha de produção XPTO.', materials: [], services: [{ serviceId: 'SERV-003', name: 'Consultoria de Projeto (hora)', price: 250.00 }], images: [], date: '20/09/2025', subtotal: 120000, discount: 0, taxes: 300, total: 120300.00, paymentTerms: '45 dias', status: BudgetStatus.Aprovado },
    { id: 'ORC-2025-004', clientId: 'CLI-004', clientName: 'Condomínio Delta', projectName: 'Sistema de Para-raios (SPDA)', projectType: ProjectType.SPDA, description: '', materials: [], services: [], images: [], date: '15/09/2025', subtotal: 16000, discount: 200, taxes: 0, total: 15800.00, paymentTerms: 'Boleto 28 dias', status: BudgetStatus.Recusado },
    { id: 'ORC-2025-005', clientId: 'CLI-002', clientName: 'Mariana Costa', projectName: 'Instalação de Painéis Solares Residenciais', projectType: ProjectType.CompletoComObra, description: 'Instalação de 10 painéis solares na residência.', materials: [], services: [], images: [], date: '10/09/2025', subtotal: 100000, discount: 5000, taxes: 0, total: 95000.00, paymentTerms: '6x sem juros', status: BudgetStatus.Aprovado },
];

export const movementsData: StockMovement[] = [
    { id: 'MOV-001', product: { id: 'MAT-001', name: 'Disjuntor Monopolar 20A', sku: 'DJM-20A' }, quantity: 50, type: MovementType.Entrada, date: '28/09/2025', responsible: 'Admin', reason: 'Recebimento de Compra' },
    { id: 'MOV-002', product: { id: 'MAT-002', name: 'Cabo Flexível 2.5mm²', sku: 'CB-FX-2.5' }, quantity: 5, type: MovementType.Saida, date: '27/09/2025', responsible: 'João Engenheiro', reason: 'Aplicação em Obra/Projeto', notes: 'Obra Ed. Phoenix' },
    { id: 'MOV-003', product: { id: 'MAT-004', name: 'Alicate Universal 8"', sku: 'FER-ALI-U8' }, quantity: 2, type: MovementType.Saida, date: '26/09/2025', responsible: 'Admin', reason: 'Perda ou Avaria' },
    { id: 'MOV-004', product: { id: 'MAT-003', name: 'Fita Isolante 20m', sku: 'FITA-ISO-20' }, quantity: 100, type: MovementType.Entrada, date: '25/09/2025', responsible: 'Admin', reason: 'Recebimento de Compra' },
    { id: 'MOV-005', product: { id: 'MAT-007', name: 'Multímetro Digital', sku: 'FER-MULT-01' }, quantity: 1, type: MovementType.Saida, date: '24/09/2025', responsible: 'Maria Técnica', reason: 'Uso Interno/Consumo' },
];

export const purchasesData: PurchaseOrder[] = [
    { id: 'PC-2025-001', supplier: { id: 'SUP-001', name: 'Fornecedor Elétrico Nacional' }, date: '28/09/2025', items: [{productId: 'MAT-001', productName: 'Disjuntor Monopolar 20A', quantity: 50, unitCost: 10.00}], totalValue: 500.00, status: PurchaseStatus.Recebido, invoiceNumber: 'NFe-12345' },
    { id: 'PC-2025-002', supplier: { id: 'SUP-002', name: 'Distribuidora de Cabos Megawatt' }, date: '25/09/2025', items: [{productId: 'MAT-002', productName: 'Cabo Flexível 2.5mm²', quantity: 20, unitCost: 210.00}], totalValue: 4200.00, status: PurchaseStatus.Pendente },
    { id: 'PC-2025-003', supplier: { id: 'SUP-003', name: 'Iluminação & Cia' }, date: '22/09/2025', items: [{productId: 'MAT-006', productName: 'Luminária LED de Sobrepor 18W', quantity: 200, unitCost: 35.50}], totalValue: 7100.00, status: PurchaseStatus.Cancelado },
];

export const projectsData: Project[] = [
    {
        id: 'PROJ-001', name: 'Instalação Elétrica Ed. Phoenix', clientId: 'CLI-001', clientName: 'Construtora Alfa', budgetId: 'ORC-2025-001', documentNumber: 'ART-12345/SP',
        projectType: ProjectType.CompletoComObra,
        startDate: '2025-08-01', endDate: '2025-11-30', responsibleUserId: 'USR-002', responsibleUserName: 'João Engenheiro',
        description: 'Projeto completo de instalação elétrica para novo edifício residencial de 15 andares.',
        status: ProjectStatus.EmExecucao, progress: 75,
        billOfMaterials: [
            { materialId: 'MAT-001', name: 'Disjuntor Monopolar 20A', sku: 'DJM-20A', requiredQuantity: 150, status: ProjectMaterialStatus.Alocado },
            { materialId: 'MAT-002', name: 'Cabo Flexível 2.5mm²', sku: 'CB-FX-2.5', requiredQuantity: 25, status: ProjectMaterialStatus.Alocado },
            { materialId: 'MAT-005', name: 'Parafuso Philips 3.5x40', sku: 'PAR-PH-3540', requiredQuantity: 5, status: ProjectMaterialStatus.Pendente },
        ],
        stages: [
            { id: 'STG-001-A', title: 'Passagem de Conduítes', status: ProjectStageStatus.Concluido, assignedMemberId: 'OBR-TM-001', assignedMemberName: 'Marcos Eletricista' },
            { id: 'STG-001-B', title: 'Cabeamento de Unidades', status: ProjectStageStatus.EmAndamento, dueDate: '2025-10-15', assignedMemberId: 'OBR-TM-002', assignedMemberName: 'Felipe Ajudante', highlight: 'paused' },
            { id: 'STG-001-C', title: 'Montagem de Quadros', status: ProjectStageStatus.AFazer, dueDate: '2025-10-25', assignedMemberId: 'OBR-TM-001', assignedMemberName: 'Marcos Eletricista' },
            { id: 'STG-001-D', title: 'Instalação de Tomadas (Cancelado)', status: ProjectStageStatus.AFazer, highlight: 'cancelled' },
        ],
        adminStages: generateAdminStages('2025-08-01'),
        qualityChecks: [
            { id: 'QC-001-A', description: 'Verificação de Aterramento', status: QCCheckStatus.Aprovado },
            { id: 'QC-001-B', description: 'Teste de Continuidade dos Circuitos', status: QCCheckStatus.Pendente },
        ],
        obraStarted: true,
        attachments: [],
        assignedObraTeamMemberId: 'OBR-TM-001',
        assignedObraTeamMemberName: 'Marcos Eletricista',
    },
    {
        id: 'PROJ-002', name: 'Projeto Luminotécnico Loja Central', clientId: 'CLI-002', clientName: 'Mariana Costa', budgetId: 'ORC-2025-005',
        projectType: ProjectType.Tecnico,
        startDate: '2025-09-15', endDate: '2025-10-15', responsibleUserId: 'USR-004', responsibleUserName: 'Carlos Desenhista',
        description: 'Desenvolvimento do projeto luminotécnico para a nova loja no centro da cidade.',
        status: ProjectStatus.Planejamento, progress: 20,
        billOfMaterials: [], stages: [], adminStages: generateAdminStages('2025-09-15'), qualityChecks: [],
        attachments: [],
    },
    {
        id: 'PROJ-003', name: 'Laudo SPDA Indústria Gama', clientId: 'CLI-003', clientName: 'Indústria Gama', budgetId: 'ORC-2025-003',
        projectType: ProjectType.Laudo,
        startDate: '2025-10-01', endDate: '2025-10-31', responsibleUserId: 'USR-003', responsibleUserName: 'Maria Técnica',
        description: 'Emissão de laudo técnico para o Sistema de Proteção contra Descargas Atmosféricas.',
        status: ProjectStatus.Planejamento, progress: 10,
        billOfMaterials: [], stages: [], adminStages: generateAdminStages('2025-10-01'), qualityChecks: [],
        attachments: [],
    },
     {
        id: 'PROJ-004', name: 'Reforma Elétrica Loja Beta', clientId: 'CLI-002', clientName: 'Mariana Costa',
        projectType: ProjectType.CompletoComObra,
        startDate: '2025-07-01', endDate: '2025-08-30', responsibleUserId: 'USR-002', responsibleUserName: 'João Engenheiro',
        description: 'Reforma completa do sistema elétrico da loja matriz.',
        status: ProjectStatus.Concluido, progress: 100,
        billOfMaterials: [], 
        stages: [
            { id: 'STG-004-A', title: 'Remover fiação antiga', status: ProjectStageStatus.Concluido, assignedMemberId: 'OBR-TM-003', assignedMemberName: 'Laura Encarregada'},
            { id: 'STG-004-B', title: 'Instalar novo quadro de distribuição', status: ProjectStageStatus.Concluido, assignedMemberId: 'OBR-TM-003', assignedMemberName: 'Laura Encarregada'},
        ], 
        adminStages: generateAdminStages('2025-07-01'),
        qualityChecks: [],
        obraStarted: true,
        attachments: [],
        assignedObraTeamMemberId: 'OBR-TM-003',
        assignedObraTeamMemberName: 'Laura Encarregada',
    },
    {
        id: 'PROJ-005', name: 'Reforma Fachada Ed. Beta', clientId: 'CLI-001', clientName: 'Construtora Alfa',
        projectType: ProjectType.CompletoComObra,
        startDate: '2025-09-01', endDate: '2025-12-31', responsibleUserId: 'USR-002', responsibleUserName: 'João Engenheiro',
        description: 'Reforma da fachada do edifício Beta, cancelada devido a problemas de orçamento.',
        status: ProjectStatus.Cancelado, progress: 30,
        billOfMaterials: [], 
        stages: [
            { id: 'STG-005-A', title: 'Preparação do canteiro', status: ProjectStageStatus.Concluido },
            { id: 'STG-005-B', title: 'Demolição inicial', status: ProjectStageStatus.EmAndamento, highlight: 'cancelled' },
        ], 
        adminStages: generateAdminStages('2025-09-01'),
        qualityChecks: [],
        obraStarted: true,
        attachments: [],
    }
];

export const historyData: HistoryLog[] = [
    { id: 'LOG-001', action: 'Criação de Orçamento', details: 'Orçamento ORC-2025-001 criado para Construtora Alfa', user: 'Admin', timestamp: new Date('2025-09-25T10:30:00Z'), module: ModuleType.Orçamentos, type: ActionType.Create },
    { id: 'LOG-002', action: 'Entrada em Estoque', details: '50 unidades de Disjuntor Monopolar 20A (DJM-20A)', user: 'Admin', timestamp: new Date('2025-09-28T14:00:00Z'), module: ModuleType.Estoque, type: ActionType.MovementIn },
    { id: 'LOG-003', action: 'Saída de Estoque', details: '5 rolos de Cabo Flexível 2.5mm² (CB-FX-2.5) para a obra Ed. Phoenix', user: 'João Engenheiro', timestamp: new Date('2025-09-27T09:15:00Z'), module: ModuleType.Estoque, type: ActionType.MovementOut },
    { id: 'LOG-004', action: 'Atualização de Catálogo', details: 'Produto "Lâmpada LED Bulbo 12W" (LP-LED-12W) teve seu preço atualizado.', user: 'Admin', timestamp: new Date('2025-09-26T11:00:00Z'), module: ModuleType.Catálogo, type: ActionType.Update },
    { id: 'LOG-005', action: 'Exclusão de Orçamento', details: 'Orçamento ORC-2025-004 foi excluído.', user: 'Admin', timestamp: new Date('2025-09-29T16:45:00Z'), module: ModuleType.Orçamentos, type: ActionType.Delete },
];

export const quadrosAluminioData = [
  { id: 'QA-001', name: 'Quadro Alumínio 6 Medidores', capacidade: 6, price: 350 },
  { id: 'QA-002', name: 'Quadro Alumínio 9 Medidores', capacidade: 9, price: 480 },
  { id: 'QA-003', name: 'Quadro Alumínio 12 Medidores', capacidade: 12, price: 620 },
];

export const caixasPolicarbonatoData = [
  { id: 'CP-001', name: 'Caixa Policarbonato Média', price: 80, imageUrl: 'https://picsum.photos/seed/caixa1/200' },
  { id: 'CP-002', name: 'Caixa Policarbonato Grande', price: 120, imageUrl: 'https://picsum.photos/seed/caixa2/200' },
  { id: 'CP-003', name: 'Caixa Policarbonato Visor', price: 95, imageUrl: 'https://picsum.photos/seed/caixa3/200' },
];

export const quadrosComandoBaseData = [
  { id: 'QCB-001', name: 'Quadro Metálico Base 80x60cm', price: 280 },
  { id: 'QCB-002', name: 'Quadro Metálico Base 100x80cm', price: 410 },
];
